# Userscripts

This is a collection of userscripts I've made to fix annoyances with various websites.

## Usage

Install a userscript extension such as [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) for Chrome.

Add userscripts to the extension using the contents of the files in the `dist` folder.

## Development

To add a new userscript, create a `.meta.json` file within `src`. Editors such as VSCode will offer suggestions for completing this file. The main property is `require` where scripts can be added. Scripts can be specified as:

- Absolute URLs e.g. `https://example.com/main.js`
- Anchored paths which are resolved from `src` e.g. `/utils/general.js`
- Relative paths which are resolve from the `.meta.json` file e.g. `./index.js`

Use `yarn start` and the resulting `dist/*.local.user.js` files for testing.
