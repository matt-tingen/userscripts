import path from 'path';
import MetadataFactory from './MetadataFactory';
import Userscript from './Userscript';

class LocalMetadataFactory extends MetadataFactory {
  protected resolveAppUrl(...parts: string[]) {
    return `file://${path.resolve(this.localRepoPath, ...parts)}`;
  }

  protected prepare({ metadata }: Userscript) {
    return {
      ...metadata,
      require: [...metadata.require, `/utils/local.js`],
    };
  }
}

export default LocalMetadataFactory;
