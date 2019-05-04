(function() {
  const watermark = document.createElement('div');
  watermark.textContent = 'Using local userscript';

  Object.assign(watermark.style, {
    position: 'fixed',
    bottom: '1rem',
    right: '2rem',
    color: 'red',
    opacity: 0.4,
    fontSize: '7vw',
    pointerEvents: 'none',
    zIndex: 2147483647,
  });

  document.body.appendChild(watermark);
})();
