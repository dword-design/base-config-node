import pathLib from 'node:path';

import fs from 'fs-extra';

export default ({ cwd = '.', mainFilename = 'index.ts' } = {}) => {
  if (!fs.existsSync(pathLib.join(cwd, 'src', mainFilename))) {
    return {};
  }

  const packageConfig = {
    type: 'module',
    ...(fs.existsSync(pathLib.join(cwd, 'package.json'))
      ? fs.readJsonSync(pathLib.join(cwd, 'package.json'))
      : {}),
  };

  const basename = pathLib.basename(mainFilename, '.ts');
  return {
    exports: {
      ...(typeof packageConfig.exports === 'object' && packageConfig.exports),
      '.': {
        import: {
          default: `./dist/${basename}.js`,
          types: `./dist/${basename}.d.ts`,
        },
      },
    },
    main: `dist/${basename}.js`,
  };
};
