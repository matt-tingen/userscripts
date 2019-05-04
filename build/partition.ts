const partition = <T>(
  items: T[],
  predicate: (item: T) => boolean,
): [T[], T[]] => {
  const trueItems: T[] = [];
  const falseItems: T[] = [];

  items.forEach(item => {
    const array = predicate(item) ? trueItems : falseItems;
    array.push(item);
  });

  return [trueItems, falseItems];
};

export default partition;
