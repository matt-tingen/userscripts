import path from 'path';
import MetadataFactory from './MetadataFactory';
import Userscript from './Userscript';

class LocalMetadataFactory extends MetadataFactory {
  resolveAppUrl(...parts: string[]) {
    return `file://${path.resolve(this.rootPath, ...parts)}`;
  }

  prepare({ metadata }: Userscript) {
    return {
      ...metadata,
      require: [...metadata.require, `/utils/local.js`],
    };
  }
}

export default LocalMetadataFactory;
