import fs from 'fs-extra';
import klaw from 'klaw';
import path from 'path';
import LocalUserscriptProcessor from './LocalUserscriptProcessor';
import packageInfo from './packageInfo';
import RemoteUserscriptProcessor from './RemoteUserscriptProcessor';
import renderMetadata from './renderMetadata';
import Userscript from './Userscript';
import UserscriptProcessor from './UserscriptProcessor.js';

function getRepoUrl() {
  try {
    const userAndName = packageInfo.repository.match(/:([^.]+).git/)![1];
    return `https://raw.githubusercontent.com/${userAndName}/master`;
  } catch (ignore) {
    throw new Error('Package repository in unexpected format');
  }
}

function processUserscript(userscript: Userscript) {
  Object.entries(userscriptProcessors).forEach(
    ([filenameSuffix, processor]) => {
      const updatedUserscript = processor.process(userscript);
      writeUserscript(updatedUserscript, filenameSuffix);
    },
  );
}

const defaultMetadata = {
  author: packageInfo.author.replace(/\s<.+/, ''),
  grant: 'none',
  namespace: packageInfo.homepage,
};

async function writeUserscript(
  { name, metadata }: Userscript,
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

const userscriptNames = new Set<string>();

const registerUserscript = ({ name }: Userscript) => {
  if (userscriptNames.has(name)) {
    throw new Error('Duplicate script name');
  }

  userscriptNames.add(name);
};

const main = async () => {
  const metadataPaths = await getMetadataPaths();

  metadataPaths.forEach(metadataPath => {
    const userscript = Userscript.fromFile(metadataPath, defaultMetadata);
    registerUserscript(userscript);
    processUserscript(userscript);
  });
};

const rootPath = path.resolve(__dirname, '..');
const destPath = path.resolve(rootPath, 'dist');
const sourcePath = path.resolve(rootPath, 'src');
const baseRepoUrl = getRepoUrl();

const userscriptProcessors: Record<string, UserscriptProcessor> = {
  '': new RemoteUserscriptProcessor(rootPath, sourcePath, baseRepoUrl),
  local: new LocalUserscriptProcessor(rootPath, sourcePath),
};

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
