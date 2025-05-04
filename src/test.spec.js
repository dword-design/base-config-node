import { Base } from '@dword-design/base';
import { endent } from '@dword-design/functions';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import fs from 'fs-extra';

export default tester(
  {
    'jiti cjsFallback': async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ dependencies: { jiti: '*' } }),
      );

      const base = new Base({ cjsFallback: true, name: '../src/index.js' });
      await base.prepare();
      await base.test();
    },
    'jiti without cjsFallback': async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ dependencies: { jiti: '*' } }),
      );

      const base = new Base({ name: '../src/index.js' });
      await base.prepare();

      await expect(base.test()).rejects.toThrow(endent`
        Unused dependencies
        * jiti
      `);
    },
  },
  [testerPluginTmpDir()],
);
