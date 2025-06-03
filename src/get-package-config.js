import pathLib from 'node:path';

import fs from 'fs-extra';
import { omit } from 'lodash-es';

export default ({ cwd = '.' } = {}) => {
  if (!fs.existsSync(pathLib.join(cwd, 'src', 'index.ts')) && !fs.existsSync(pathLib.join(cwd, 'src', 'index.js'))) {
    return {};
  }

  const packageConfig = {
    type: 'module',
    ...(fs.existsSync(pathLib.join(cwd, 'package.json'))
      ? fs.readJsonSync(pathLib.join(cwd, 'package.json'))
      : {}),
  };

  return {
    exports:
      typeof packageConfig.exports === 'object' &&
      Object.keys(omit(packageConfig.exports, ['.'])).length > 0
        ? { ...packageConfig.exports, '.': './dist/index.js' }
        : './dist/index.js',
    main: 'dist/index.js',
  };
};
