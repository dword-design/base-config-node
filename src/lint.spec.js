import { Base } from '@dword-design/base';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import fs from 'fs-extra';

export default tester(
  {
    'cjsFallback and existing jiti': async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ dependencies: { jiti: '*' } }),
      );

      const base = new Base({ cjsFallback: true, name: '../src/index.js' });
      await base.prepare();
      await base.lint();
    },
    'cjsFallback and missing jiti': async () => {
      await fs.outputFile('package.json', JSON.stringify({}));
      const base = new Base({ cjsFallback: true, name: '../src/index.js' });
      await base.prepare();

      await expect(base.lint()).rejects.toThrow(
        'Please add jiti to your project since cjsFallback is activated.',
      );
    },
    valid: async () => {
      await fs.outputFile('package.json', JSON.stringify({}));
      const base = new Base({ name: '../src/index.js' });
      await base.prepare();
      await base.lint();
    },
  },
  [testerPluginTmpDir()],
);
