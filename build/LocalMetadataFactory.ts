import path from 'path';
import MetadataFactory from './MetadataFactory';
import Userscript from './Userscript';

class LocalMetadataFactory extends MetadataFactory {
  resolveAppUrl(...parts: string[]) {
    return `file://${path.resolve(__dirname, ...parts)}`;
  }

  prepare({ metadata, name }: Userscript) {
    return {
      ...metadata,
      require: [
        ...metadata.require,
        `/src/${name}/index.js`,
        `/utils/local.js`,
      ],
    };
  }
}

export default LocalMetadataFactory;
