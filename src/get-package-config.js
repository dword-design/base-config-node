import fs from 'fs-extra'
import P from 'path'

export default (config = {}) => {
  if (!fs.existsSync(P.join('src', 'index.js'))) {
    return {}
  }

  const packageConfig = {
    type: 'module',
    ...(fs.existsSync('package.json') ? fs.readJsonSync('package.json') : {}),
  }

  return {
    main: `dist/${config.cjsFallback ? 'cjs-fallback.cjs' : 'index.js'}`,
    ...(packageConfig.type === 'module' &&
      !config.cjsFallback && {
        exports:
          typeof packageConfig.exports === 'object'
            ? { ...packageConfig.exports, '.': './dist/index.js' }
            : './dist/index.js',
      }),
  }
}
