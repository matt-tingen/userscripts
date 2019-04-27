# Userscripts

This is a collection of userscripts I've made to fix annoyances with various websites.

## Usage

Install a userscript extension such as [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) for Chrome.

Add userscripts to the extension using the contents of the files in the `dist` folder.

**Warning**: These scripts are intended for my personal use and will auto-update which is a security risk if you don't fully trust me. To avoid this, add the commit hash to the `@require` e.g.

```diff
- // @require      https://raw.githubusercontent.com/matt-tingen/userscripts/master/src/netflix/index.js
+ // @require      https://raw.githubusercontent.com/matt-tingen/userscripts/63c7d92e60a940d997841fcc8f09be87760539db/src/netflix/index.js
```

## Development

To add a new userscript, create a folder in `src` with a `metadata.json` and `index.js` file.

The `metadata.json` corresponds to the `==UserScript==` comment block and `index.js` should be an IIFE with the script itself.

Use `yarn start` and the resulting `dist/*.local.user.js` files for testing.
