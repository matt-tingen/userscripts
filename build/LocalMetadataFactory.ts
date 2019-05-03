import path from 'path';
import MetadataFactory from './MetadataFactory';
import Userscript from './Userscript';

class LocalMetadataFactory extends MetadataFactory {
  constructor(private rootPath: string) {
    super();
  }

  resolveAppUrl(...parts: string[]) {
    return `file://${path.resolve(this.rootPath, ...parts)}`;
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
