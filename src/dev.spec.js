/* import outputFiles from 'output-files'
import execa from 'execa'
import withLocalTmpDir from 'with-local-tmp-dir'
import { writeFile, remove } from 'fs-extra'
import P from 'path'
import { waitFile } from 'wait-file'
import stealthyRequire from 'stealthy-require'
import dev from './dev' */

export default {
  valid: () => {},
  /* withLocalTmpDir(async () => {
    await outputFiles({
      'package.json': JSON.stringify(
        {
          baseConfig: require.resolve('.'),
        },
        undefined,
        2
      ),
      'src/index.js': 'export default 1',
    })
    await execa.command('base prepare')
    const watcher = dev({ log: false })
    try {
      await waitFile({ resources: [P.join('dist', 'index.js')] })
      expect(require(P.resolve(process.cwd(), 'dist', 'index.js'))).toEqual(1)
      await remove(P.join('dist', 'index.js'))
      await writeFile(P.resolve('src', 'index.js'), 'export default 2')
      await waitFile({ resources: [P.join('dist', 'index.js')] })
      expect(
        stealthyRequire(require.cache, () =>
          require(P.join(process.cwd(), 'dist', 'index.js'))
        )
      ).toEqual(2)
    } finally {
      await watcher.close()
    }
  }), */
};
