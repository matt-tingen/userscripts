import fs from 'fs-extra';
import klaw from 'klaw';
import path from 'path';
import packageJson from '../package.json';
import LocalMetadataFactory from './LocalMetadataFactory.js';
import MetadataFactory from './MetadataFactory.js';
import RemoteMetadataFactory from './RemoteMetadataFactory.js';
import renderMetadata from './renderMetadata';
import Userscript from './Userscript';

function getRepoUrl() {
  try {
    const userAndName = packageJson.repository.match(/:([^.]+).git/)![1];
    return `https://raw.githubusercontent.com/${userAndName}/master`;
  } catch (ignore) {
    throw new Error('Package repository in unexpected format');
  }
}

function processMetadata(metadataPath: string) {
  const userscript = new Userscript(metadataPath, defaultMetadata);

  Object.entries(metadataFactories).forEach(([filenameSuffix, factory]) => {
    const metadata = factory.build(userscript);
    writeUserscript(userscript, metadata, filenameSuffix);
  });
}

const defaultMetadata = {
  author: packageJson.author.replace(/\s<.+/, ''),
  grant: 'none',
  namespace: packageJson.homepage,
};

async function writeUserscript(
  { name }: Userscript,
  metadata: Metadata,
  filenameSuffix: string,
) {
  const contents = renderMetadata(metadata);

  const filename = `${name}${
    filenameSuffix ? `.${filenameSuffix}` : ''
  }.user.js`;
  const outputPath = path.resolve(destPath, filename);
  await fs.writeFile(outputPath, contents);
  console.log(`wrote ${filename}`);
}

const getMetadataPaths = () =>
  new Promise<string[]>((resolve, reject) => {
    const paths: string[] = [];

    klaw(sourcePath)
      .on('data', item => {
        if (item.stats.isFile() && item.path.endsWith('.meta.json')) {
          paths.push(item.path);
        }
      })
      .on('error', reject)
      .on('end', () => resolve(paths));
  });

const main = async () => {
  const metadataPaths = await getMetadataPaths();
  metadataPaths.forEach(processMetadata);
};

const rootPath = path.resolve(__dirname, '..');
const destPath = path.resolve(rootPath, 'dist');
const sourcePath = path.resolve(rootPath, 'src');
const baseRepoUrl = getRepoUrl();

const metadataFactories: Record<string, MetadataFactory> = {
  '': new RemoteMetadataFactory(baseRepoUrl),
  local: new LocalMetadataFactory(),
};

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
