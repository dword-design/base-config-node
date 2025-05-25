import { endent } from '@dword-design/functions';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import outputFiles from 'output-files';
import { execaCommand } from 'execa';

export default tester(
  {
    'jiti cjsFallback': async () => {
      await outputFiles({
        'package.json': JSON.stringify({ dependencies: { jiti: '*' } }),
        '.baserc.json': JSON.stringify({ name: '../src/index.js', cjsFallback: true }),
      });

      await execaCommand('base prepare')
      await execaCommand('base test')
    },
    'jiti without cjsFallback': async () => {
      await outputFiles({
        'package.json': JSON.stringify({ dependencies: { jiti: '*' } }),
        '.baserc.json': JSON.stringify('../src/index.js'),
      });

      await execaCommand('base prepare');

      await expect(execaCommand('base test')).rejects.toThrow(endent`
        Unused dependencies
        * jiti
      `);
    },
  },
  [testerPluginTmpDir()],
);
