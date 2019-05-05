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

To add a new userscript, create a `.meta.json` file within a folder in `src` corresponding to the website. Editors such as VSCode will offer suggestions for completing this file. The main property is `require` where scripts can be added. Scripts can be specified as:

- Absolute URLs e.g. `https://example.com/main.js`
- Anchored paths which are resolved from `src` e.g. `/utils/general.js`
- Relative paths which are resolve from the `.meta.json` file e.g. `./index.js`

Use `yarn start` and the resulting `dist/*.local.user.js` files for testing.
