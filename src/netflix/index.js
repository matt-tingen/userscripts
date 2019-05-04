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
