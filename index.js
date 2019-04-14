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

function readScriptsFolder(err, entries) {
  handleError(err);
  entries.forEach(readHeader);
}

function readHeader(entry) {
  const headerPath = path.resolve(scriptsDir, entry, 'header.js');
  fs.readFile(headerPath, (err, buffer) => {
    handleError(err);
    writeUserscript(buffer.toString(), entry);
  });
}

function addInclude(contents, requireUrl) {
  // prettier-ignore
  const lines = [
    `@require      ${requireUrl}`,
    '==/UserScript=='
  ]
    .map(line => `// ${line}`)
    .join('\n');
  return contents.replace(/^\/\/\s*==\/UserScript==$/m, lines);
}

const prefixes = {
  '': scriptDir => joinUrl(repoBaseUrl, 'src', scriptDir, 'index.js'),
  '.local': scriptDir =>
    `file://${path.resolve(scriptsDir, scriptDir, 'index.js')}`,
};

function writeUserscript(contents, scriptDir) {
  Object.entries(prefixes).forEach(([prefix, getRequireUrl]) => {
    const requireUrl = getRequireUrl(scriptDir);
    const newContents = addInclude(contents, requireUrl);
    const filename = `${scriptDir}${prefix}.js`;
    const outputPath = path.resolve(destPath, filename);
    fs.writeFile(outputPath, newContents, err => {
      handleError(err);
      console.log(`wrote ${filename}`);
    });
  });
}

const destPath = path.resolve(__dirname, 'dist');
const scriptsDir = path.resolve(__dirname, 'src');
const repoBaseUrl = getRepoUrl();
fs.readdir(scriptsDir, readScriptsFolder);
