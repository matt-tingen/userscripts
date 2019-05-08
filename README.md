# Userscripts

This is a collection of userscripts I've made to fix annoyances with various websites.

## Usage

Install a userscript extension such as [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) for Chrome.

Add userscripts to the extension using the files in the `dist` folder. Clicking the "Raw" button on a userscript GitHub page may cause the extension to prompt you to install. If not, the contents of the file can be copied a new userscript in the extension.

**Warning**: These scripts are intended for my personal use and will auto-update which is a security risk if you don't fully trust me. To avoid this, there are two options:

1. Configure your extension not to update external scripts. For instance, in TamperMonkey, set the "Update interval" under "Externals" to "never".
1. Add the commit hash to each `@require` within the repo e.g.

```diff
- // @require      https://raw.githubusercontent.com/matt-tingen/userscripts/master/src/netflix/index.js
+ // @require      https://raw.githubusercontent.com/matt-tingen/userscripts/63c7d92e60a940d997841fcc8f09be87760539db/src/netflix/index.js
```

## Development

To add a new userscript, create a `.meta.json` file within `src`. Editors such as VSCode will offer suggestions for completing this file. The main property is `require` where scripts can be added. Scripts can be specified as:

- Absolute URLs e.g. `https://example.com/main.js`
- Anchored paths which are resolved from `src` e.g. `/utils/general.js`
- Relative paths which are resolve from the `.meta.json` file e.g. `./index.js`

Use `yarn start` and the resulting `dist/*.local.user.js` files for testing.

In Chrome, the "Allow access to file URLs" option will also need to be enabled for the userscript extension.
