import path from 'path';

const encounteredNames = new Set<string>();

class Userscript {
  private static register(name: string) {
    if (encounteredNames.has(name)) {
      throw new Error('Duplicate script name');
    }

    encounteredNames.add(name);
  }

  private static getName(metadataPath: string) {
    return path.basename(metadataPath, '.meta.json').toLowerCase();
  }

  name: string;
  metadata: Metadata;

  constructor(public metadataPath: string, defaultMetadata: Partial<Metadata>) {
    this.name = Userscript.getName(metadataPath);
    Userscript.register(this.name);

    const baseMetadata = require(metadataPath) as Metadata;
    this.metadata = {
      ...(defaultMetadata as Metadata),
      ...baseMetadata,
    };
  }
}

export default Userscript;
