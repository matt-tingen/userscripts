# Userscripts

This is a collection of userscripts I've made to fix annoyances with various websites.

## Usage

Install a userscript extension such as [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) for Chrome.

Add userscripts to the extension using the contents of the files in the `dist` folder.

## Development

To add a new userscript, create a folder in `src` with a `metadata.json` and `index.js` file.

The `metadata.json` corresponds to the `==UserScript==` comment block and `index.js` should be an IIFE with the script itself.

Use `yarn start` and the resulting `dist/*.local.user.js` files for testing.
