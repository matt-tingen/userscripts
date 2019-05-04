import MetadataFactory from './MetadataFactory';
import Userscript from './Userscript';

class RemoteMetadataFactory extends MetadataFactory {
  constructor(rootPath: string, private baseRepoUrl: string) {
    super(rootPath);
  }

  resolveAppUrl(...parts: string[]) {
    return [this.baseRepoUrl, ...parts].join('/');
  }

  prepare({ metadata, name }: Userscript) {
    return {
      ...metadata,
      downloadURL: this.resolveAppUrl('dist', `${name}.user.js`),
    };
  }
}

export default RemoteMetadataFactory;
