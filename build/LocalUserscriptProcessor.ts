import path from 'path';
import UserscriptProcessor from './UserscriptProcessor';
import Userscript from './Userscript';

class LocalUserscriptProcessor extends UserscriptProcessor {
  protected resolveAppUrl(...parts: string[]) {
    return `file://${path.resolve(this.localRepoPath, ...parts)}`;
  }

  protected prepareMetadata({ metadata }: Userscript) {
    return {
      ...metadata,
      require: [...metadata.require, `/utils/local.js`],
    };
  }
}

export default LocalUserscriptProcessor;
