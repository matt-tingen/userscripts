define('includesClass', () => className => {
  // Valid CSS class names do not require escaping at the root of a regex.
  const regex = new RegExp(`(^| )${className}($| )`, 'g');
  return classNames => regex.test(classNames);
});
