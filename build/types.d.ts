type RunAtDestination =
  | 'document-start'
  | 'document-body'
  | 'document-end'
  | 'document-idle'
  | 'context_menu';

interface Metadata {
  [key: string]: string | string[];
  name: string;
  description: string;
  match: string[];
  'run-at': RunAtDestination;
  require: string[];
  version: string;
}
