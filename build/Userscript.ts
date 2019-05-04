import path from 'path';

class Userscript {
  private static getName(metadataPath: string) {
    return path.basename(metadataPath, '.meta.json').toLowerCase();
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
}

export default Userscript;
