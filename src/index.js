import depcheckParserSass from '@dword-design/depcheck-parser-sass';

import dev from './dev.js';
import getPackageConfig from './get-package-config.js';
import prepublishOnly from './prepublish-only.js';

export default function () {
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
}
