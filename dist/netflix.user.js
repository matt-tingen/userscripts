// ==UserScript==
// @name Netflix
// @namespace https://github.com/matt-tingen/userscripts
// @version 1.0
// @author Matt Tingen
// @description Skip the interruptions
// @downloadURL https://raw.githubusercontent.com/matt-tingen/userscripts/master/dist/netflix.user.js
// @match https://www.netflix.com/*
// @require https://cdnjs.cloudflare.com/ajax/libs/arrive/2.4.1/arrive.min.js
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


/* Script loaded from "src/netflix/index.js" */
(function () {
const arrive = (selector, callback) => {
  document.arrive(selector, function() {
    setTimeout(callback.bind(this), 0);
  });
};

// Avoid the "Are you still watching" interruption.
arrive('.interrupter-actions', function() {
  this.firstElementChild.click();
});

// Skip show intros.
arrive('.skip-credits', function() {
  this.firstElementChild.click();

  // The video is often paused after skipping credits so click the play button
  // if it shows up shortly after doing so.
  setTimeout(() => {
    const playPauseButton = document.querySelector('.button-nfplayerPlay');

    if (playPauseButton.getAttribute('aria-label') === 'Play') {
      playPauseButton.click();
    }
  }, 100);
});

// Play next episode when one completes.
arrive('.WatchNext-still-container', function() {
  this.click();
});
arrive('.nf-flat-button-primary.nf-icon-button', function() {
  if (this.textContent.startsWith('Next episode')) {
    this.click();
  }
});

})();