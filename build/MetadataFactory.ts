import Userscript from './Userscript';

abstract class MetadataFactory {
  abstract resolveAppUrl(...parts: string[]): string;
  protected abstract prepare(userscript: Userscript): Metadata;

  private processRequire(url: string) {
    return url.startsWith('/')
      ? this.resolveAppUrl(...url.split('/').slice(1))
      : url;
  }

  build(userscript: Userscript): Metadata {
    const metadata = this.prepare(userscript);
    return {
      ...metadata,
      require: metadata.require.map(url => this.processRequire(url)),
    };
  }
}

export default MetadataFactory;
