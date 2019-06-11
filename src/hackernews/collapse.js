(function() {
  const { css } = window.__MJT_USERSCRIPTS__.utils;

  css`
    :root {
      --mjt-toggle-height: 0.9rem;
      --mjt-toggle-width: 2rem;
    }

    .togg {
      position: relative;
    }

    .togg:after {
      content: '';
      position: absolute;
      padding: var(--mjt-toggle-height) var(--mjt-toggle-width);
      left: 0;
      top: calc(-0.5 * var(--mjt-toggle-height));
    }

    .togg.disabled {
      pointer-events: none;
      color: #d8d8d8 !important;
    }
  `;

  const setLoading = (id, isLoading) => {
    const toggle = document
      .getElementById(id)
      .getElementsByClassName('togg')[0];
    toggle.classList.toggle('disabled', isLoading);
  };

  const originalToggle = window.toggle;

  window.toggle = (event, id) => {
    // The toggle code can be quite slow on mobile due to sync layout recalcs.
    // Show an indication that is in progress.
    setLoading(id, true);
    originalToggle(event, id);
    setLoading(id, false);
  };
})();
