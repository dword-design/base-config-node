import { type Base, defineBaseConfig } from '@dword-design/base';
import depcheckParserSass from '@dword-design/depcheck-parser-sass';

import build from './build';
import dev from './dev';
import getPackageConfig from './get-package-config';
import prepublishOnly from './prepublish-only';

export default defineBaseConfig(function (this: Base) {
  return {
    allowedMatches: ['src'],
    commands: { build, dev, prepublishOnly },
    depcheckConfig: { parsers: { '**/*.scss': depcheckParserSass } },
    editorIgnore: ['dist'],
    gitignore: ['/dist'],
    npmPublish: true,
    packageConfig: getPackageConfig({ cwd: this.cwd }),
  };
});

// TODO: Otherwise the full type of the config cannot be inferred by TypeScript when used somewhere else

export { default as getPackageConfig } from './get-package-config';

export { default as build } from './build';

export { default as prepublishOnly } from './prepublish-only';

export { default as dev } from './dev';
