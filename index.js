const path = require('path');
const fs = require('fs');
const stable = require('stable');
const package = require('./package.json');

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
  entries.forEach(processHeader);
}

function processHeader(name) {
  const headerPath = path.resolve(scriptsDir, name, 'header.json');
  const headerJson = require(headerPath);
  const defaultedHeader = prepHeader(headerJson, name);

  buildModes.forEach(getBuildSettings => {
    const { header, baseFilename = name } = getBuildSettings(
      name,
      defaultedHeader,
    );
    const headerString = renderHeader(header);

    writeUserscript(baseFilename, headerString);
  });
}

function asArray(value) {
  return Array.isArray(value) ? value : [value];
}

const defaultHeader = {
  author: package.author.replace(/\s<.+/, ''),
  grant: 'none',
  namespace: package.homepage,
  require: [],
};

function applyHeaderDefaults(header, name) {
  return {
    name,
    ...defaultHeader,
    ...header,
  };
}

function prepHeader(header, name) {
  const defaulted = applyHeaderDefaults(header, name);

  Object.getOwnPropertyNames(defaulted).forEach(key => {
    defaulted[key] = asArray(defaulted[key]);
  });

  return defaulted;
}

function getKeyValuePairs(header) {
  const pairs = [];

  Object.entries(header).forEach(([key, value]) => {
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

function renderHeader(header) {
  return [
    '// ==UserScript==',
    ...sortDirectives(getKeyValuePairs(header)).map(
      ([key, value]) => `// @${key} ${value}`,
    ),
    '// ==/UserScript==',
    '',
  ].join('\n');
}

const buildModes = [
  (name, header) => ({
    header: updateRemoteHeader(header, name),
  }),
  (name, header) => ({
    baseFilename: `${name}.local`,
    header: updateLocalHeader(header, name),
  }),
];

function getRemoteUrl(...parts) {
  return joinUrl(repoBaseUrl, ...parts);
}

function updateRemoteHeader(header, name) {
  return {
    ...header,
    downloadURL: getRemoteUrl('dist', `${name}.user.js`),
    require: [...header.require, `/src/${name}/index.js`].map(url =>
      updateAppRequire(getRemoteUrl, url),
    ),
  };
}

function getLocalUrl(...parts) {
  return `file://${path.resolve(__dirname, ...parts)}`;
}

function updateLocalHeader(header, name) {
  return {
    ...header,
    require: [
      ...header.require,
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

const destPath = path.resolve(__dirname, 'dist');
const scriptsDir = path.resolve(__dirname, 'src');
const repoBaseUrl = getRepoUrl();
fs.readdir(scriptsDir, processScriptsFolder);
