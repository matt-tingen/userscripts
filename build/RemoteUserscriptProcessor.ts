import UserscriptProcessor from './UserscriptProcessor';
import Userscript from './Userscript';

class RemoteUserscriptProcessor extends UserscriptProcessor {
  constructor(
    localRepoPath: string,
    localSourcePath: string,
    private remoteRepoUrl: string,
  ) {
    super(localRepoPath, localSourcePath);
  }

  protected resolveAppUrl(...parts: string[]) {
    return [this.remoteRepoUrl, ...parts].join('/');
  }

  protected prepareMetadata({ metadata, name }: Userscript) {
    return {
      ...metadata,
      downloadURL: this.resolveAppUrl('dist', `${name}.user.js`),
    };
  }
}

export default RemoteUserscriptProcessor;
