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
  const defaultedHeader = applyHeaderDefaults(headerJson, name);

  buildModes.forEach(({ updateHeader, filenameSuffix = '' }) => {
    const baseFilename = name + filenameSuffix;
    const header = updateHeader(defaultedHeader, name);
    const headerString = renderHeader(header);

    writeUserscript(baseFilename, headerString);
  });
}

function addHeaderValue(header, key, value) {
  const existing = header[key];
  const array = Array.isArray(existing) ? existing : existing ? [existing] : [];

  return { ...header, [key]: [...array, value] };
}

const defaultHeader = {
  author: package.author,
  grant: 'none',
  namespace: package.homepage,
};

function applyHeaderDefaults(header, name) {
  return {
    name,
    ...defaultHeader,
    ...header,
  };
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
  {
    updateHeader: (header, name) => ({
      ...addHeaderValue(
        header,
        'require',
        joinUrl(repoBaseUrl, 'src', name, 'index.js'),
      ),
      downloadURL: joinUrl(repoBaseUrl, 'dist', `${name}.user.js`),
    }),
  },
  {
    filenameSuffix: '.local',
    updateHeader: (header, name) =>
      addHeaderValue(
        header,
        'require',
        `file://${path.resolve(scriptsDir, name, 'index.js')}`,
      ),
  },
];

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
