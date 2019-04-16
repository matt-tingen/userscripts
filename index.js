const path = require('path');
const fs = require('fs');
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

function processHeader(entry) {
  const headerPath = path.resolve(scriptsDir, entry, 'header.json');
  const headerJson = require(headerPath);
  const updatedHeader = updateHeader(headerJson, entry);

  Object.entries(prefixes).forEach(([prefix, getRequireUrl]) => {
    const finalHeader = addHeaderValue(
      updatedHeader,
      'require',
      getRequireUrl(entry),
    );

    writeUserscript(renderHeader(finalHeader), entry, prefix);
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
};

function updateHeader(header, name) {
  return {
    name,
    downloadURL: joinUrl(repoBaseUrl, 'dist', `${name}.js`),
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

function renderHeader(header) {
  return [
    '// ==UserScript==',
    ...getKeyValuePairs(header).map(([key, value]) => `// @${key} ${value}`),
    '// ==/UserScript==',
    '',
  ].join('\n');
}

const prefixes = {
  '': scriptDir => joinUrl(repoBaseUrl, 'src', scriptDir, 'index.js'),
  '.local': scriptDir =>
    `file://${path.resolve(scriptsDir, scriptDir, 'index.js')}`,
};

function writeUserscript(contents, scriptDir, prefix) {
  const filename = `${scriptDir}${prefix}.js`;
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
