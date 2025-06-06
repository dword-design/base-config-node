import pathLib from 'node:path';

import fs from 'fs-extra';

export default ({ cwd = '.' } = {}) => {
  if (!fs.existsSync(pathLib.join(cwd, 'src', 'index.ts'))) {
    return {};
  }

  const packageConfig = {
    type: 'module',
    ...(fs.existsSync(pathLib.join(cwd, 'package.json'))
      ? fs.readJsonSync(pathLib.join(cwd, 'package.json'))
      : {}),
  };

  return {
    exports: {
      ...(typeof packageConfig.exports === 'object' && packageConfig.exports),
      '.': {
        import: { default: './dist/index.js', types: './dist/index.d.ts' },
      },
    },
    main: 'dist/index.js',
  };
};
