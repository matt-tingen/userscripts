import MetadataFactory from './MetadataFactory';
import Userscript from './Userscript';

class RemoteMetadataFactory extends MetadataFactory {
  constructor(private baseRepoUrl: string) {
    super();
  }

  resolveAppUrl(...parts: string[]) {
    return [this.baseRepoUrl, ...parts].join('/');
  }

  prepare({ metadata, name }: Userscript) {
    return {
      ...metadata,
      downloadURL: this.resolveAppUrl('dist', `${name}.user.js`),
      require: [...metadata.require, `/src/${name}/index.js`],
    };
  }
}

export default RemoteMetadataFactory;
