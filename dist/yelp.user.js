// ==UserScript==
// @name Yelp
// @namespace https://github.com/matt-tingen/userscripts
// @version 1.0
// @author Matt Tingen
// @description Improve directions links
// @downloadURL https://raw.githubusercontent.com/matt-tingen/userscripts/master/dist/yelp.user.js
// @match https://www.yelp.com/*
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


/* Script loaded from "src/yelp/index.js" */
(function () {
const urlRegex = /[&?]url=([^&]+)/;
const fixHref = href => urlRegex.exec(decodeURIComponent(href))[1];

const externalLinks = $('a[href^="/biz_redir"]');
externalLinks.each((i, el) => {
  el.href = fixHref(el.href);
  el.removeAttribute('target');
});

const directionsUrl =
  'https://www.google.com/maps/search/' +
  encodeURIComponent(
    $('.street-address')
      .text()
      .trim(),
  );
const directionsLink = $('a.biz-directions');
directionsLink.attr('href', directionsUrl);

})();