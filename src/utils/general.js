window.__MJT_USERSCRIPTS__ = {
  utils: (function() {
    const includesClass = className => {
      // Valid CSS class names do not require escaping at the root of a regex.
      const regex = new RegExp(`(^| )${className}($| )`, 'g');
      return classNames => regex.test(classNames);
    };

    const waitForClass = (className, nodes, callback) => {
      const hasClass = includesClass(className);
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          const node = mutation.target;

          if (!hasClass(mutation.oldValue) && hasClass(node.className)) {
            callback(node);
          }
        });
      });

      nodes.forEach(node => {
        observer.observe(node, {
          attributes: true,
          attributeFilter: ['class'],
          attributeOldValue: true,
        });
      });
    };

    return {
      includesClass,
      waitForClass,
    };
  })(),
};
