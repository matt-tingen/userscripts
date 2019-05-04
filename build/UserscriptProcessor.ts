import path from 'path';
import partition from './partition';
import Userscript from './Userscript';

abstract class UserscriptProcessor {
  protected static isScriptInternal(url: string) {
    return /^\.?\//.test(url);
  }

  protected abstract resolveAppUrl(...parts: string[]): string;
  protected abstract prepareMetadata(userscript: Userscript): Metadata;

  constructor(
    protected localRepoPath: string,
    protected localSourcePath: string,
    private inlineScriptFilter: (url: string) => boolean = () => false,
  ) {}

  private processScriptPath(
    { metadataPath }: Userscript,
    scriptPath: string,
    resolve = true,
  ) {
    if (!UserscriptProcessor.isScriptInternal(scriptPath)) {
      return scriptPath;
    }

    const [firstPart, ...parts] = scriptPath.split('/');

    const basePath = path.relative(
      this.localRepoPath,
      firstPart === '.' ? path.dirname(metadataPath) : this.localSourcePath,
    );

    return resolve
      ? this.resolveAppUrl(basePath, ...parts)
      : [basePath, ...parts].join('/');
  }

  process(userscript: Userscript): Userscript {
    const metadata = this.prepareMetadata(userscript);
    const allScripts = [
      '/meta/base.js',
      '/meta/define.js',
      ...metadata.require,
    ];

    const [inlineScripts, referencedScripts] = partition(
      allScripts,
      this.inlineScriptFilter,
    );

    const updatedMetadata = {
      ...metadata,
      require: [
        ...referencedScripts.map(scriptPath =>
          this.processScriptPath(userscript, scriptPath),
        ),
      ],
    };

    return new Userscript(
      userscript.metadataPath,
      updatedMetadata,
      inlineScripts.map(scriptPath =>
        this.processScriptPath(userscript, scriptPath, false),
      ),
    );
  }
}

export default UserscriptProcessor;
