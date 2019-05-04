import path from 'path';
import Userscript from './Userscript';

abstract class MetadataFactory {
  protected abstract resolveAppUrl(...parts: string[]): string;
  protected abstract prepare(userscript: Userscript): Metadata;

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

  build(userscript: Userscript): Metadata {
    const metadata = this.prepare(userscript);
    return {
      ...metadata,
      require: metadata.require.map(url =>
        this.processRequire(userscript, url),
      ),
    };
  }
}

export default MetadataFactory;
