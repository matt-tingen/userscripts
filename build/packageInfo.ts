interface PackageInfo {
  repository: string;
  author: string;
  homepage: string;
}

const packageInfo = require('../package.json') as PackageInfo;

export default packageInfo;
