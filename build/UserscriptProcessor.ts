import path from 'path';
import Userscript from './Userscript';

abstract class UserscriptProcessor {
  protected abstract resolveAppUrl(...parts: string[]): string;
  protected abstract prepareMetadata(userscript: Userscript): Metadata;

  constructor(
    protected localRepoPath: string,
    protected localSourcePath: string,
  ) {}

  private processRequire({ metadataPath }: Userscript, url: string) {
    const [firstPart, ...parts] = url.split('/');

    if (!['', '.'].includes(firstPart)) {
      return url;
    }

    const basePath = path.relative(
      this.localRepoPath,
      firstPart === '.' ? path.dirname(metadataPath) : this.localSourcePath,
    );

    return this.resolveAppUrl(basePath, ...parts);
  }

  private buildMetadata(userscript: Userscript): Metadata {
    const metadata = this.prepareMetadata(userscript);
    return {
      ...metadata,
      require: metadata.require.map(url =>
        this.processRequire(userscript, url),
      ),
    };
  }

  process(userscript: Userscript): Userscript {
    const metadata = this.buildMetadata(userscript);
    return new Userscript(userscript.metadataPath, metadata);
  }
}

export default UserscriptProcessor;
