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


;(function() {
  const arrive = (selector, callback) => {
    document.arrive(selector, function() {
      setTimeout(callback.bind(this), 0)
    })
  }

  // Avoid the "Are you still watching" interruption.
  arrive('.interrupter-actions', function() {
    this.firstElementChild.click()
  })

  // Skip show intros.
  arrive('.skip-credits', function() {
    this.firstElementChild.click()

    // The video is often paused after skipping credits so click the play button
    // if it shows up shortly after doing so.
    setTimeout(() => {
      const playPauseButton = document.querySelector('.button-nfplayerPlay')

      if (playPauseButton.getAttribute('aria-label') === 'Play') {
        playPauseButton.click()
      }
    }, 100)
  })

  // Play next episode when one completes.
  arrive('.WatchNext-still-container', function() {
    this.click()
  })
  arrive('.nf-flat-button-primary.nf-icon-button', function() {
    if (this.textContent.startsWith('Next episode')) {
      this.click()
    }
  })
})()
