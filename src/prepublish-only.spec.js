import outputFiles from 'output-files'
import execa from 'execa'
import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'
import { exists, readFile } from 'fs-extra'
import glob from 'glob-promise'
import P from 'path'

export default {
  'build errors': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'package.json': endent`
        {
          "baseConfig": "node",
          "devDependencies": {
            "@dword-design/base-config-node": "^1.0.0"
          }
        }

      `,
        'src/index.js': 'foo bar',
      })
      await execa.command('base prepare')
      let all
      try {
        await execa.command('base prepublishOnly', { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch('Unexpected token, expected ";"')
    }),
  'linting errors': async () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'package.json': endent`
        {
          "baseConfig": "node",
          "devDependencies": {
            "@dword-design/base-config-node": "^1.0.0"
          }
        }

      `,
        'src/index.js': 'var foo = 2',
      })
      await execa.command('base prepare')
      let all
      try {
        await execa.command('base prepublishOnly', { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch("'foo' is assigned a value but never used")
      expect(await exists('dist')).toBeFalsy()
    }),
  valid: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'dist/foo.js': '',
        'package.json': endent`
        {
          "baseConfig": "node",
          "devDependencies": {
            "@dword-design/base-config-node": "^1.0.0"
          }
        }

      `,
        src: {
          'index.js': 'export default 1',
          'index.spec.js': '',
          'test.txt': 'foo',
        },
      })
      await execa.command('base prepare')
      const { all } = await execa.command('base prepublishOnly', { all: true })
      expect(all).toEqual('Successfully compiled 1 file with Babel.')
      expect(await glob('*', { dot: true, cwd: 'dist' })).toEqual([
        'index.js',
        'test.txt',
      ])
      expect(await readFile('.gitignore', 'utf8')).toMatch('/.eslintrc.json\n')
      expect(require(P.resolve('dist'))).toEqual(1)
    }),
}
