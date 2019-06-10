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

    const addStyles = styles => {
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      styleSheet.innerText = styles;
      document.head.appendChild(styleSheet);
    };

    const templateTagNoop = (strings, ...keys) => {
      let combined = '';

      for (let i = 0; i < strings.length; i++) {
        combined += strings[i] + (keys[i] || '');
      }

      return combined;
    };

    // Use as a template tag for syntax highlighting.
    const css = (...args) => addStyles(templateTagNoop(...args));

    return {
      includesClass,
      waitForClass,
      css,
    };
  })(),
};
