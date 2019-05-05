import path from 'path';
import capitalize from './capitalize';

class Userscript {
  private static getName(metadataPath: string) {
    const parts = path.dirname(metadataPath).split('/');
    const site = parts[parts.length - 1];
    const feature = path.basename(metadataPath, '.meta.json');

    return feature === site ? site : site + capitalize(feature);
  }

  static isScriptInternal(url: string) {
    return /^\.?\//.test(url);
  }

  static fromFile(
    metadataPath: string,
    defaultMetadata: Partial<Metadata>,
  ): Userscript {
    const baseMetadata = require(metadataPath) as Metadata;
    const metadata = {
      ...(defaultMetadata as Metadata),
      ...baseMetadata,
    };
    return new Userscript(metadataPath, metadata);
  }

  readonly name: string;

  constructor(
    readonly metadataPath: string,
    readonly metadata: Readonly<Metadata>,
  ) {
    this.name = Userscript.getName(metadataPath);
  }

  get internalScripts() {
    return this.metadata.require.filter(Userscript.isScriptInternal);
  }

  get externalScripts() {
    return this.metadata.require.filter(
      url => !Userscript.isScriptInternal(url),
    );
  }
}

export default Userscript;
