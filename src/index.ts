import { type Base, defineBaseConfig } from '@dword-design/base';
import depcheckParserSass from '@dword-design/depcheck-parser-sass';

import dev from './dev';
import getPackageConfig from './get-package-config';
import prepublishOnly from './prepublish-only';

export default defineBaseConfig(function (this: Base) {
  return {
    allowedMatches: ['src'],
    commands: { dev, prepublishOnly },
    depcheckConfig: { parsers: { '**/*.scss': depcheckParserSass } },
    editorIgnore: ['dist'],
    gitignore: ['/dist'],
    npmPublish: true,
    packageConfig: getPackageConfig({ cwd: this.cwd }),
    useJobMatrix: true,
  };
});

export { default as getPackageConfig } from './get-package-config';
