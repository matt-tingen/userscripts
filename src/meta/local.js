(() => {
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

if ('define' in window) {
  console.warn(
    '"window.define" is already defined; userscripts may error. Use non-local userscripts to avoid issues.',
  );
} else {
  // Expose define for referenced scripts.
  window.define = __MJT_USERSCRIPTS__.define;
}
