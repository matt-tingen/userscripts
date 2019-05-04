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


(function() {
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
