(function() {
  const delayedArrive = (selector, callback) => {
    document.arrive(selector, function() {
      setTimeout(callback.bind(this), 0)
    });
  }

  // Avoid the "Are you still watching" interruption.
  delayedArrive('.interrupter-actions', function() {
    this.firstElementChild.click();
  });

  // Skip show intros.
  delayedArrive('.skip-credits', function() {
      this.firstElementChild.click();
  });

  // Play next episode when one completes.
  delayedArrive('.WatchNext-still-container', function() {
    this.click();
  });

  delayedArrive('.nf-flat-button-primary.nf-icon-button', function() {
    if (this.textContent.startsWith('Next episode')) {
      this.click();
    }
  })
})();
