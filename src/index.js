import depcheckParserSass from '@dword-design/depcheck-parser-sass';

import dev from './dev.js';
import getPackageConfig from './get-package-config.js';
import lint from './lint.js';
import prepublishOnly from './prepublish-only.js';

export default config => ({
  allowedMatches: ['src'],
  commands: { dev, prepublishOnly },
  depcheckConfig: {
    parsers: { '**/*.scss': depcheckParserSass },
    ...(config.cjsFallback && { ignoreMatches: ['jiti'] }),
  },
  editorIgnore: ['dist'],
  gitignore: ['/dist'],
  lint,
  npmPublish: true,
  packageConfig: getPackageConfig(config),
  useJobMatrix: true,
});
