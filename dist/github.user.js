// ==UserScript==
// @name GitHub
// @namespace https://github.com/matt-tingen/userscripts
// @version 1.0
// @author Matt Tingen
// @description Convert textual branch references to links
// @downloadURL https://raw.githubusercontent.com/matt-tingen/userscripts/master/dist/github.user.js
// @match https://github.com/*
// @require https://code.jquery.com/jquery-3.3.1.slim.min.js
// @grant none
// ==/UserScript==

/* Script loaded from "src/meta/base.js" */
window.__MJT_USERSCRIPTS__ = {};


/* Script loaded from "src/meta/define.js" */
__MJT_USERSCRIPTS__.define = (() => {
  const modules = Object.create(null);

  return (...args) => {
    let name, definition;

    if (args.length === 2) {
      name = args[0];
      definition = args[1];
    } else if (args.length === 1) {
      definition = args[0];
    }

    if (
      typeof definition !== 'function' ||
      (name && typeof name !== 'string')
    ) {
      throw new Error('Invalid invocation of "define"');
    }

    if (name && name in modules) {
      throw new Error(`Module "${name}" is already defined`);
    }

    const result = definition(modules);

    if (name) {
      modules[name] = result;
    }
  };
})();


/* Script loaded from "src/meta/remote.js" */
// Expose define for inlined scripts.
const { define } = __MJT_USERSCRIPTS__;


/* Script loaded from "src/github/index.js" */
(function () {
const origin = 'https://github.com/';
function getLink(branch) {
  const path = location.href.replace(origin, '');
  const repo = path.match(/^([^\/]+\/[^\/]+)/)[0];
  return `${origin}${repo}/tree/${encodeURIComponent(branch)}`;
}

const branches = $('.commit-ref');
branches.each(function() {
  const el = $(this);
  const branch = el.text();
  const href = getLink(branch);
  const link = $('<a>').attr('href', href);
  el.wrapInner(link);
});

})();