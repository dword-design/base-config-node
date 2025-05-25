import { Base } from '@dword-design/base';
import { endent, property } from '@dword-design/functions';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import { globby } from 'globby';
import outputFiles from 'output-files';
import P from 'path';

import self from './prepublish-only.js';

export default tester(
  {
    'build errors': async () => {
      await fs.outputFile(P.join('src', 'index.js'), 'foo bar');
      const base = new Base({ name: '../src/index.js' });
      await base.prepare();

      await expect(base.run('prepublishOnly')).rejects.toThrow(
        'Parsing error: Missing semicolon. (1:3)',
      );
    },
    cjsFallback: async () => {
      await outputFiles({
        'cjs-file.cjs': "console.log(require('.'))",
        'package.json': JSON.stringify({ type: 'module' }),
        src: { 'index.js': "export default 'foo'" },
      });

      const base = new Base({ cjsFallback: true, name: '../src/index.js' });
      await base.prepare();
      await base.run('prepublishOnly');
      expect((await execaCommand('node cjs-file.cjs')).stdout).toEqual('foo');
    },
    'eslint-config project': async () => {
      await outputFiles({
        'package.json': JSON.stringify({
          name: '@dword-design/eslint-config',
          type: 'module',
        }),
        'src/index.js': '',
      });

      const base = new Base({ cjsFallback: true, name: '../src/index.js' });
      await base.prepare();
      await base.run('prepublishOnly');
    },
    fixable: async () => {
      await fs.outputFile(P.join('src', 'index.js'), "console.log('foo')");
      const base = new Base({ name: '../src/index.js' });
      await base.prepare();
      await base.run('prepublishOnly');

      expect(await fs.readFile(P.join('src', 'index.js'), 'utf8')).toEqual(
        "console.log('foo');\n",
      );
    },
    'linting errors': async () => {
      await fs.outputFile(P.join('src', 'index.js'), 'var foo = 2');
      await new Base({ name: '../src/index.js' }).prepare();

      await expect(self()).rejects.toThrow(
        "'foo' is assigned a value but never used",
      );

      expect(await fs.exists('dist')).toBeFalsy();
    },
    'only copied files': async () => {
      await fs.outputFile(P.join('src', 'test.txt'), 'foo');
      const base = new Base({ name: '../src/index.js' });
      await base.prepare();
      await base.run('prepublishOnly');

      expect(
        await globby('*', { cwd: 'dist', dot: true, onlyFiles: false }),
      ).toEqual(['test.txt']);
    },
    'snapshots mocha': async () => {
      await outputFiles({
        'dist/foo.js': '',
        src: {
          '__image_snapshots__/foo-snap.png': '',
          '__snapshots__/foo.js.snap': '',
          'index.js': 'export default 1',
          'index.js-snapshots/valid-1.txt': '',
        },
      });

      const base = new Base({ name: '../src/index.js' });
      await base.prepare();
      await base.run('prepublishOnly');

      expect(
        new Set(
          await globby('**', { cwd: 'dist', dot: true, onlyFiles: false }),
        ),
      ).toEqual(
        new Set(
          Object.keys({
            'index.js': true,
            'index.js-snapshots': true,
            'index.js-snapshots/valid-1.txt': true,
          }),
        ),
      );
    },
    'snapshots playwright': async () => {
      await outputFiles({
        'dist/foo.js': '',
        src: {
          '__image_snapshots__/foo-snap.png': '',
          '__snapshots__/foo.js.snap': '',
          'index.js': 'export default 1',
          'index.js-snapshots/valid-1.txt': '',
        },
      });

      const base = new Base({
        name: '../src/index.js',
        testRunner: 'playwright',
      });

      await base.prepare();
      await base.run('prepublishOnly');

      expect(
        new Set(
          await globby('**', { cwd: 'dist', dot: true, onlyFiles: false }),
        ),
      ).toEqual(
        new Set(
          Object.keys({
            __image_snapshots__: true,
            '__image_snapshots__/foo-snap.png': true,
            __snapshots__: true,
            '__snapshots__/foo.js.snap': true,
            'index.js': true,
          }),
        ),
      );
    },
    async valid() {
      await outputFiles({
        'dist/foo.js': '',
        src: {
          'index.js': 'export default 1 |> x => x * 2',
          'index.spec.js': '',
          'test.txt': 'foo',
        },
      });

      const base = new Base({ name: '../src/index.js' });
      await base.prepare();

      expect(base.run('prepublishOnly') |> await |> property('all')).toMatch(
        new RegExp(endent`
          src(\\\\|/)index\\.js -> dist(\\\\|/)index\\.js
          Successfully compiled 1 file with Babel( \\(.*?\\))?\\.$
        `),
      );

      expect(
        await globby('*', { cwd: 'dist', dot: true, onlyFiles: false }),
      ).toEqual(['index.js', 'test.txt']);

      expect(
        await fs.readFile(P.join('dist', 'index.js'), 'utf8'),
      ).toMatchSnapshot(this);
    },
  },
  [testerPluginTmpDir()],
);
