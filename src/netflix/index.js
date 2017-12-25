(function() {
  // Avoid the "Are you still watching" interruption.
  document.arrive('.interrupter-actions', function() {
    this.firstElementChild.click();
  });

  // Skip show intros.
  document.arrive('.skip-credits', function() {
    this.firstElementChild.click();
  });

  // Play next episode when one completes.
  document.arrive('.WatchNext-still-container', function() {
    this.click();
  });
})();
