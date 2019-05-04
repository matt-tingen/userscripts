define('waitForClass', ({ includesClass }) => (className, nodes, callback) => {
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
});
