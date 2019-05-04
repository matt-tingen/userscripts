import path from 'path';
import Userscript from './Userscript';

abstract class MetadataFactory {
  abstract resolveAppUrl(...parts: string[]): string;
  protected abstract prepare(userscript: Userscript): Metadata;

  constructor(protected rootPath: string) {}

  private processRequire({ metadataPath }: Userscript, url: string) {
    if (!/^\.?\//.test(url)) {
      return url;
    }

    const parts = url.split('/').slice(1);

    if (url.startsWith('./')) {
      parts.unshift(path.relative(this.rootPath, path.dirname(metadataPath)));
    }

    return this.resolveAppUrl(...parts);
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
