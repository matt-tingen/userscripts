import fs, { readSync } from 'fs-extra';
import path from 'path';
import stable from 'stable';
import Userscript from './Userscript';

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

class UserscriptRenderer {
  constructor(
    private rootPath: string,
    private isScriptGlobal: (scriptPath: string) => boolean,
  ) {}

  private sortRules(rules: MetadataRule[]) {
    // This sort must be stable to maintain the order among `@require`s.
    return stable(rules, ([a], [b]) => {
      const i = ruleOrder.indexOf(a);
      const j = ruleOrder.indexOf(b);

      return i - j;
    });
  }

  private getRules(metadata: Metadata) {
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

  private renderMetadata(metadata: Metadata) {
    return [
      '// ==UserScript==',
      ...this.sortRules(this.getRules(metadata)).map(
        ([key, value]) => `// @${key} ${value}`,
      ),
      '// ==/UserScript==',
    ].join('\n');
  }

  private async renderScript(scriptPath: string) {
    const fullPath = path.resolve(this.rootPath, scriptPath);
    const contents = await fs.readFile(scriptPath);
    const useIife = !this.isScriptGlobal(fullPath);

    return [
      `/* Script loaded from "${scriptPath}" */`,
      useIife && '(function () {',
      contents,
      useIife && '})();',
      '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  async render(userscript: Userscript) {
    const metadata = this.renderMetadata(userscript.metadata);
    const scripts = await Promise.all(
      userscript.inlineScriptPaths.map(scriptPath =>
        this.renderScript(scriptPath),
      ),
    );

    return [metadata, ...scripts].join('\n\n');
  }
}

export default UserscriptRenderer;
