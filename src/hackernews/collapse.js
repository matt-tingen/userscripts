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
  `;
})();
