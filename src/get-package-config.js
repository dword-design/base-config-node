import P from 'node:path';

import { keys, omit, property } from '@dword-design/functions';
import fs from 'fs-extra';

export default (config = {}) => {
  if (!fs.existsSync(P.join('src', 'index.js'))) {
    return {};
  }

  const packageConfig = {
    type: 'module',
    ...(fs.existsSync('package.json') ? fs.readJsonSync('package.json') : {}),
  };

  return {
    main: `dist/${config.cjsFallback ? 'cjs-fallback.cjs' : 'index.js'}`,
    ...(packageConfig.type === 'module' &&
      !config.cjsFallback && {
        exports:
          typeof packageConfig.exports === 'object' &&
          (packageConfig.exports |> omit(['.']) |> keys |> property('length')) >
            0
            ? { ...packageConfig.exports, '.': './dist/index.js' }
            : './dist/index.js',
      }),
  };
};
