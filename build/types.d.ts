interface Metadata {
  [key: string]: string | string[];
  name: string;
  description: string;
  match: string[];
  require: string[];
  version: string;
}
