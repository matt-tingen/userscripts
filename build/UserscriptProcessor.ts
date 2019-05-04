import path from 'path';
import Userscript from './Userscript';
import partition from './partition';

abstract class UserscriptProcessor {
  protected abstract resolveAppUrl(...parts: string[]): string;
  protected abstract prepareMetadata(userscript: Userscript): Metadata;

  constructor(
    protected localRepoPath: string,
    protected localSourcePath: string,
  ) {}

  private processInternalScriptPath(
    { metadataPath }: Userscript,
    scriptPath: string,
  ) {
    const [firstPart, ...parts] = scriptPath.split('/');

    const basePath = path.relative(
      this.localRepoPath,
      firstPart === '.' ? path.dirname(metadataPath) : this.localSourcePath,
    );

    return this.resolveAppUrl(basePath, ...parts);
  }

  private buildMetadata(userscript: Userscript): Metadata {
    const metadata = this.prepareMetadata(userscript);

    const [internalScripts, externalScripts] = partition(
      metadata.require,
      Userscript.isScriptInternal,
    );

    return {
      ...metadata,
      require: [
        ...externalScripts,
        ...internalScripts.map(scriptPath =>
          this.processInternalScriptPath(userscript, scriptPath),
        ),
      ],
    };
  }

  process(userscript: Userscript): Userscript {
    const metadata = this.buildMetadata(userscript);
    return new Userscript(userscript.metadataPath, metadata);
  }
}

export default UserscriptProcessor;
