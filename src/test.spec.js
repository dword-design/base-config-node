import { endent } from '@dword-design/functions';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import { execaCommand } from 'execa';
import outputFiles from 'output-files';

export default tester(
  {
    'jiti cjsFallback': async () => {
      await outputFiles({
        '.baserc.json': JSON.stringify({
          cjsFallback: true,
          name: '../src/index.js',
        }),
        'package.json': JSON.stringify({ dependencies: { jiti: '*' } }),
      });

      await execaCommand('base prepare');
      await execaCommand('base test');
    },
    'jiti without cjsFallback': async () => {
      await outputFiles({
        '.baserc.json': JSON.stringify('../src/index.js'),
        'package.json': JSON.stringify({ dependencies: { jiti: '*' } }),
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
