import execa from 'execa'
import { remove } from 'fs-extra'
import getPackageName from 'get-package-name'
import lint from './lint'

export default async ({ log = true }) => {
  await lint()
  await remove('dist')
  await execa(
    'babel',
    [
      '--config-file', getPackageName(require.resolve('@dword-design/babel-config')),
      '--out-dir', 'dist',
      '--copy-files',
      '--no-copy-ignored',
      '--ignore', '**/*.spec.js',
      'src',
    ],
    { stdio: log ? 'inherit' : 'pipe' },
  )
}