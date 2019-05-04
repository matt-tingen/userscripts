__MJT_USERSCRIPTS__.define = (() => {
  const modules = Object.create(null);

  return (...args) => {
    let name, definition;

    if (args.length === 2) {
      name = args[0];
      definition = args[1];
    } else if (args.length === 1) {
      definition = args[0];
    }

    if (
      typeof definition !== 'function' ||
      (name && typeof name !== 'string')
    ) {
      throw new Error('Invalid invocation of "define"');
    }

    if (name && name in modules) {
      throw new Error(`Module "${name}" is already defined`);
    }

    const result = definition(modules);

    if (name) {
      modules[name] = result;
    }
  };
})();
