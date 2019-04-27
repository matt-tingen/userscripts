const path = require('path');
const fs = require('fs');
const stable = require('stable');
const package = require('../package.json');

function handleError(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
}

function joinUrl(...parts) {
  return parts.join('/');
}

function getRepoUrl() {
  const repo = package.repository;
  let userAndName;

  try {
    userAndName = repo.match(/:([^.]+).git/)[1];
  } catch (err) {
    console.error('Package repository in unexpected format');
    process.exit(1);
  }
  return joinUrl('https://raw.githubusercontent.com', userAndName, 'master');
}

function processScriptsFolder(err, entries) {
  handleError(err);
  entries.forEach(processMetadata);
}

function processMetadata(name) {
  const metadataPath = path.resolve(scriptsDir, name, 'metadata.json');
  const metadataJson = require(metadataPath);
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

function asArray(value) {
  return Array.isArray(value) ? value : [value];
}

const defaultMetadata = {
  author: package.author.replace(/\s<.+/, ''),
  grant: 'none',
  namespace: package.homepage,
  require: [],
};

function applyMetadataDefaults(metadata, name) {
  return {
    name,
    ...defaultMetadata,
    ...metadata,
  };
}

function prepMetadata(metadata, name) {
  const defaulted = applyMetadataDefaults(metadata, name);

  Object.getOwnPropertyNames(defaulted).forEach(key => {
    defaulted[key] = asArray(defaulted[key]);
  });

  return defaulted;
}

function getKeyValuePairs(metadata) {
  const pairs = [];

  Object.entries(metadata).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      pairs.push(...value.map(v => [key, v]));
    } else {
      pairs.push([key, value]);
    }
  });

  return pairs;
}

const directivesOrder = [
  'name',
  'namespace',
  'version',
  'author',
  'description',
  'homepage',
  'homepageURL',
  'website ',
  'source',
  'icon',
  'iconURL ',
  'defaulticon',
  'icon64 ',
  'icon64URL',
  'updateURL',
  'downloadURL',
  'supportURL',
  'include',
  'match',
  'exclude',
  'require',
  'resource',
  'connect',
  'run-at',
  'grant',
  'noframes',
  'unwrap',
  'nocompat',
];

function sortDirectives(directives) {
  // This sort must be stable to maintain the order among `@require`s.
  return stable(
    directives,
    ([a], [b]) => directivesOrder.indexOf(a) - directivesOrder.indexOf(b),
  );
}

function renderMetadata(metadata) {
  return [
    '// ==UserScript==',
    ...sortDirectives(getKeyValuePairs(metadata)).map(
      ([key, value]) => `// @${key} ${value}`,
    ),
    '// ==/UserScript==',
    '',
  ].join('\n');
}

const buildModes = [
  (name, metadata) => ({
    metadata: updateRemoteMetadata(metadata, name),
  }),
  (name, metadata) => ({
    baseFilename: `${name}.local`,
    metadata: updateLocalMetadata(metadata, name),
  }),
];

function getRemoteUrl(...parts) {
  return joinUrl(repoBaseUrl, ...parts);
}

function updateRemoteMetadata(metadata, name) {
  return {
    ...metadata,
    downloadURL: getRemoteUrl('dist', `${name}.user.js`),
    require: [...metadata.require, `/src/${name}/index.js`].map(url =>
      updateAppRequire(getRemoteUrl, url),
    ),
  };
}

function getLocalUrl(...parts) {
  return `file://${path.resolve(__dirname, ...parts)}`;
}

function updateLocalMetadata(metadata, name) {
  return {
    ...metadata,
    require: [
      ...metadata.require,
      `/src/${name}/index.js`,
      `/utils/local.js`,
    ].map(url => updateAppRequire(getLocalUrl, url)),
  };
}

function updateAppRequire(resolveParts, url) {
  return url.startsWith('/') ? resolveParts(...url.split('/').slice(1)) : url;
}

function writeUserscript(baseFilename, contents) {
  const filename = `${baseFilename}.user.js`;
  const outputPath = path.resolve(destPath, filename);
  fs.writeFile(outputPath, contents, err => {
    handleError(err);
    console.log(`wrote ${filename}`);
  });
}

const rootPath = path.resolve(__dirname, '..');
const destPath = path.resolve(rootPath, 'dist');
const scriptsDir = path.resolve(rootPath, 'src');
const repoBaseUrl = getRepoUrl();
fs.readdir(scriptsDir, processScriptsFolder);
