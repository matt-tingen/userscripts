import UserscriptProcessor from './UserscriptProcessor';
import Userscript from './Userscript';

class RemoteUserscriptProcessor extends UserscriptProcessor {
  constructor(
    localRepoPath: string,
    localSourcePath: string,
    private remoteRepoUrl: string,
  ) {
    super(localRepoPath, localSourcePath, UserscriptProcessor.isScriptInternal);
  }

  protected resolveAppUrl(...parts: string[]) {
    return [this.remoteRepoUrl, ...parts].join('/');
  }

  protected prepareMetadata({ metadata, name }: Userscript) {
    return {
      ...metadata,
      downloadURL: this.resolveAppUrl('dist', `${name}.user.js`),
      require: ['/meta/remote.js', ...metadata.require],
    };
  }
}

export default RemoteUserscriptProcessor;
