import stable from 'stable';

const ruleOrder = [
  'name',
  'namespace',
  'version',
  'author',
  'description',
  'homepage',
  'homepageURL',
  'website ',
  'source',
  'icon',
  'iconURL ',
  'defaulticon',
  'icon64 ',
  'icon64URL',
  'updateURL',
  'downloadURL',
  'supportURL',
  'include',
  'match',
  'exclude',
  'require',
  'resource',
  'connect',
  'run-at',
  'grant',
  'noframes',
  'unwrap',
  'nocompat',
];

type MetadataRule = [string, Metadata[keyof Metadata]];

const sortRules = (rules: MetadataRule[]) =>
  // This sort must be stable to maintain the order among `@require`s.
  stable(rules, ([a], [b]) => {
    const i = ruleOrder.indexOf(a);
    const j = ruleOrder.indexOf(b);

    return i - j;
  });

function getRules(metadata: Metadata) {
  const pairs: MetadataRule[] = [];
  const entries = Object.entries(metadata);

  entries.forEach(([key, value]) => {
    if (Array.isArray(value)) {
      pairs.push(...value.map(v => [key, v] as MetadataRule));
    } else {
      pairs.push([key, value]);
    }
  });

  return pairs;
}

const renderMetadata = (metadata: Metadata) =>
  [
    '// ==UserScript==',
    ...sortRules(getRules(metadata)).map(
      ([key, value]) => `// @${key} ${value}`,
    ),
    '// ==/UserScript==',
    '',
  ].join('\n');

export default renderMetadata;
