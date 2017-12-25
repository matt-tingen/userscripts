const path = require('path');
const fs = require('fs');

function readScriptsFolder(err, entries) {
  if (err) {
    console.error(err);
    return;
  }

  entries.forEach(readHeader);
}

function readHeader(entry) {
  const headerPath = path.resolve(scriptsDir, entry, 'header.js');
  fs.readFile(headerPath, function(err, buffer) {
    if (err) {
      console.error(err);
      return;
    }

    writeUserscript(buffer.toString(), entry);
  });
}

function addInclude(contents, requirePath) {
  // prettier-ignore
  const lines = [
    '@require file://' + requirePath,
    '==/UserScript=='
  ]
    .map(function(line) {
      return '// ' + line;
    })
    .join('\n');
  return contents.replace(/^\/\/\s*==\/UserScript==$/m, lines);
}

function writeUserscript(contents, scriptDir) {
  const requirePath = path.resolve(scriptsDir, scriptDir, 'index.js');
  const newContents = addInclude(contents, requirePath);
  const filename = scriptDir + '.js';
  const outputPath = path.resolve(destPath, filename);
  fs.writeFile(outputPath, newContents, function(err) {
    if (err) {
      console.error(err);
      return;
    }

    console.log('wrote ' + filename);
  });
}

const destPath = path.resolve(__dirname, 'dist');
const scriptsDir = path.resolve(__dirname, 'src');
fs.readdir(scriptsDir, readScriptsFolder);
