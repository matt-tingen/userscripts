import path from 'path';
import fs from 'fs-extra';
import klaw from 'klaw';
import stable from 'stable';
import packageJson from '../package.json';

interface BaseMetadata {
  name: string;
  description: string;
  match: string[];
  require: string[];
  version: string;
}

type Metadata = typeof defaultMetadata & BaseMetadata;

interface ProcessedMetadata extends Metadata {
  downloadURL?: string;
}

function joinUrl(...parts: string[]) {
  return parts.join('/');
}

function getRepoUrl() {
  const repo = packageJson.repository;
  const userAndName = repo.match(/:([^.]+).git/)![1];
  return joinUrl('https://raw.githubusercontent.com', userAndName, 'master');
}

const encounteredBaseFilenames = new Set<string>();

const registerName = (name: string) => {
  if (encounteredBaseFilenames.has(name)) {
    throw new Error('Duplicate script name');
  }

  encounteredBaseFilenames.add(name);
};

const getUserscriptName = (metadataPath: string) =>
  path.basename(metadataPath, '.meta.json').toLowerCase();

function processMetadata(metadataPath: string) {
  const metadataJson = require(metadataPath) as BaseMetadata;
  const name = getUserscriptName(metadataPath);

  registerName(name);

  const defaultedMetadata = prepMetadata(metadataJson, name);

  buildModes.forEach(getBuildSettings => {
    const { metadata, baseFilename = name } = getBuildSettings(
      name,
      defaultedMetadata,
    );
    const metadataString = renderMetadata(metadata);

    writeUserscript(baseFilename, metadataString);
  });
}

function asArray<T>(value: T | T[]) {
  return Array.isArray(value) ? value : [value];
}

const defaultMetadata = {
  author: packageJson.author.replace(/\s<.+/, ''),
  grant: 'none',
  namespace: packageJson.homepage,
};

function applyMetadataDefaults(metadata: BaseMetadata): Metadata {
  return {
    ...defaultMetadata,
    ...metadata,
  };
}

function prepMetadata(metadata: BaseMetadata, name: string) {
  const defaulted = applyMetadataDefaults(metadata);
  const keys = Object.getOwnPropertyNames(defaulted) as (keyof Metadata)[];

  keys.forEach(key => {
    defaulted[key] = asArray(defaulted[key]);
  });

  return defaulted;
}

type Metadatum = [keyof ProcessedMetadata, string | string[]];
function getKeyValuePairs(metadata: ProcessedMetadata) {
  const pairs: Metadatum[] = [];
  const entries = Object.entries(metadata) as Metadatum[];

  entries.forEach(([key, value]) => {
    if (Array.isArray(value)) {
      pairs.push(...value.map(v => [key, v] as Metadatum));
    } else {
      pairs.push([key, value]);
    }
  });

  return pairs;
}

const directivesOrder: (keyof ProcessedMetadata)[] = [
  'name',
  'namespace',
  'version',
  'author',
  'description',
  'downloadURL',
  'match',
  'require',
  'grant',
];

function sortDirectives(directives: Metadatum[]) {
  // This sort must be stable to maintain the order among `@require`s.
  return stable(
    directives,
    ([a], [b]) => directivesOrder.indexOf(a) - directivesOrder.indexOf(b),
  );
}

function renderMetadata(metadata: ProcessedMetadata) {
  return [
    '// ==UserScript==',
    ...sortDirectives(getKeyValuePairs(metadata)).map(
      ([key, value]) => `// @${key} ${value}`,
    ),
    '// ==/UserScript==',
    '',
  ].join('\n');
}

type BuildMode = (
  name: string,
  metadata: Metadata,
) => {
  metadata: ProcessedMetadata;
  baseFilename?: string;
};

const buildModes: BuildMode[] = [
  (name, metadata) => ({
    metadata: updateRemoteMetadata(metadata, name),
  }),
  (name, metadata) => ({
    baseFilename: `${name}.local`,
    metadata: updateLocalMetadata(metadata, name),
  }),
];

type UrlPartsResolver = (...parts: string[]) => string;

const getRemoteUrl: UrlPartsResolver = (...parts) =>
  joinUrl(repoBaseUrl, ...parts);

function updateRemoteMetadata(metadata: Metadata, name: string) {
  return {
    ...metadata,
    downloadURL: getRemoteUrl('dist', `${name}.user.js`),
    require: [...metadata.require, `/src/${name}/index.js`].map(url =>
      updateAppRequire(getRemoteUrl, url),
    ),
  };
}

const getLocalUrl: UrlPartsResolver = (...parts) =>
  `file://${path.resolve(__dirname, ...parts)}`;

function updateLocalMetadata(metadata: Metadata, name: string) {
  return {
    ...metadata,
    require: [
      ...metadata.require,
      `/src/${name}/index.js`,
      `/utils/local.js`,
    ].map(url => updateAppRequire(getLocalUrl, url)),
  };
}

function updateAppRequire(resolveParts: UrlPartsResolver, url: string) {
  return url.startsWith('/') ? resolveParts(...url.split('/').slice(1)) : url;
}

async function writeUserscript(baseFilename: string, contents: string) {
  const filename = `${baseFilename}.user.js`;
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

let repoBaseUrl: string;
try {
  repoBaseUrl = getRepoUrl();
} catch (err) {
  console.error('Package repository in unexpected format');
  process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
