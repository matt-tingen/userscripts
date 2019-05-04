import MetadataFactory from './MetadataFactory';
import Userscript from './Userscript';

class RemoteMetadataFactory extends MetadataFactory {
  constructor(
    localRepoPath: string,
    localSourcePath: string,
    private remoteRepoUrl: string,
  ) {
    super(localRepoPath, localSourcePath);
  }

  resolveAppUrl(...parts: string[]) {
    return [this.remoteRepoUrl, ...parts].join('/');
  }

  prepare({ metadata, name }: Userscript) {
    return {
      ...metadata,
      downloadURL: this.resolveAppUrl('dist', `${name}.user.js`),
    };
  }
}

export default RemoteMetadataFactory;
