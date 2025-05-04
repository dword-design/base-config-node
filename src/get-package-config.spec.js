import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import fs from 'fs-extra';
import outputFiles from 'output-files';

import self from './get-package-config.js';

export default tester(
  {
    cjsFallback: async () => {
      await fs.outputFile('src/index.js', '');

      expect(self({ cjsFallback: true })).toEqual({
        main: 'dist/cjs-fallback.cjs',
      });
    },
    commonjs: async () => {
      await outputFiles({
        'package.json': JSON.stringify({ type: 'commonjs' }),
        'src/index.js': '',
      });

      expect(self()).toEqual({ main: 'dist/index.js' });
    },
    empty: () => expect(self()).toEqual({}),
    esm: async () => {
      await fs.outputFile('src/index.js', '');

      expect(self()).toEqual({
        exports: './dist/index.js',
        main: 'dist/index.js',
      });
    },
    'multiple exports': async () => {
      await outputFiles({
        'package.json': JSON.stringify({
          exports: { '.': './dist/index.js', './foo': './dist/index.js' },
        }),
        'src/foo.js': '',
        'src/index.js': '',
      });

      expect(self()).toEqual({
        exports: { '.': './dist/index.js', './foo': './dist/index.js' },
        main: 'dist/index.js',
      });
    },
    'outdated object export': async () => {
      await outputFiles({
        'package.json': JSON.stringify({
          exports: { '.': './dist/xyz.js', './foo': './dist/foo.js' },
        }),
        'src/index.js': '',
      });

      expect(self()).toEqual({
        exports: { '.': './dist/index.js', './foo': './dist/foo.js' },
        main: 'dist/index.js',
      });
    },
    'outdated string export': async () => {
      await outputFiles({
        'package.json': JSON.stringify({ exports: './dist/foo.js' }),
        'src/index.js': '',
      });

      expect(self()).toEqual({
        exports: './dist/index.js',
        main: 'dist/index.js',
      });
    },
    'single default export in object': async () => {
      await outputFiles({
        'package.json': JSON.stringify({ exports: { '.': './dist/xyz.js' } }),
        'src/foo.js': '',
        'src/index.js': '',
      });

      expect(self()).toEqual({
        exports: './dist/index.js',
        main: 'dist/index.js',
      });
    },
    'single non-export in object': async () => {
      await outputFiles({
        'package.json': JSON.stringify({
          exports: { './foo': './dist/foo.js' },
        }),
        'src/foo.js': '',
        'src/index.js': '',
      });

      expect(self()).toEqual({
        exports: { '.': './dist/index.js', './foo': './dist/foo.js' },
        main: 'dist/index.js',
      });
    },
  },
  [testerPluginTmpDir()],
);
