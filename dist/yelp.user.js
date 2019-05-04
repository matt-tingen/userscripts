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


(function() {
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
        .trim()
    );
  const directionsLink = $('a.biz-directions');
  directionsLink.attr('href', directionsUrl);
})();
