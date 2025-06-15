import pathLib from 'node:path';

import { Base } from '@dword-design/base';
import { expect, test } from '@playwright/test';
import packageName from 'depcheck-package-name';
import endent from 'endent';
import fs from 'fs-extra';
import { globby } from 'globby';
import outputFiles from 'output-files';

test('build errors', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'src', 'index.ts'), 'foo bar');
  const base = new Base({ name: '../../src' }, { cwd });
  await base.prepare();

  await expect(base.run('prepublishOnly')).rejects.toThrow(
    'Parsing error: Unexpected keyword or identifier',
  );
});

test('fixable', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'src', 'index.ts'),
    "console.log('foo')",
  );

  const base = new Base({ name: '../../src' }, { cwd });
  await base.prepare();
  await base.run('prepublishOnly');

  expect(
    await fs.readFile(pathLib.join(cwd, 'src', 'index.ts'), 'utf8'),
  ).toEqual("console.log('foo');\n");
});

test('linting errors', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'src', 'index.ts'), 'var foo = 2');
  const base = new Base({ name: '../../src' }, { cwd });
  await base.prepare();

  await expect(base.run('prepublishOnly')).rejects.toThrow(
    "'foo' is assigned a value but never used",
  );

  expect(await fs.exists(pathLib.join(cwd, 'dist'))).toBeFalsy();
});

test('only copied files', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'src', 'test.txt'), 'foo');
  const base = new Base({ name: '../../src' }, { cwd });
  await base.prepare();
  await base.run('prepublishOnly');

  expect(
    await globby('*', {
      cwd: pathLib.join(cwd, 'dist'),
      dot: true,
      onlyFiles: false,
    }),
  ).toEqual(['test.txt']);
});

test('snapshots', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'dist/foo.js': '',
    src: {
      'index.spec.ts-snapshots/valid-1.txt': '',
      'index.ts': 'export default 1',
    },
  });

  const base = new Base({ name: '../../src' }, { cwd });
  await base.prepare();
  await base.run('prepublishOnly');

  expect(
    new Set(
      await globby('**', {
        cwd: pathLib.join(cwd, 'dist'),
        dot: true,
        onlyFiles: false,
      }),
    ),
  ).toEqual(new Set(Object.keys({ 'index.d.ts': true, 'index.js': true })));
});

test('alias', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    src: { 'bar.ts': 'export default 1', 'foo/index.ts': "import '@/src/bar'" },
  });

  const base = new Base({ name: '../../src' }, { cwd });
  await base.prepare();
  await base.run('prepublishOnly');

  expect(
    await fs.readFile(pathLib.join(cwd, 'dist', 'foo', 'index.js'), 'utf8'),
  ).toEqual('import "../bar.js";');
});

test('vue', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'src', 'foo.vue'),
    endent`
      <template>
        <div />
      </template>

      <script setup lang="ts">
      defineProps({ id: { type: String } });
      </script>
    `,
  );

  const base = new Base({ name: '../../src' }, { cwd });
  await base.prepare();
  await base.run('prepublishOnly');
  expect(await fs.exists(pathLib.join(cwd, 'dist', 'foo.vue'))).toEqual(true);

  expect(await fs.exists(pathLib.join(cwd, 'dist', 'foo.vue.d.ts'))).toEqual(
    true,
  );
});

test('vue typescript', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'src', 'foo.vue'),
    endent`
      <template>
        <div>{{ foo }}</div>
      </template>

      <script setup lang="ts">
      const foo: string = 'bar';
      </script>
    `,
  );

  const base = new Base({ name: '../../src' }, { cwd });
  await base.prepare();
  await base.run('prepublishOnly');

  expect(await fs.readFile(pathLib.join(cwd, 'dist', 'foo.vue'), 'utf8'))
    .toEqual(endent`
      <template>
        <div>{{ foo }}</div>
      </template>

      <script setup>
      const foo = "bar";
      </script>\n
    `);
});

test('valid', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'dist/foo.js': '',
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
    }),
    src: {
      'index.spec.ts': endent`
        import { test } from '${packageName`@playwright/test`}';

        test('valid', () => {});
      `,
      'index.ts': 'export default 1;',
      'test.txt': 'foo',
    },
  });

  const base = new Base({ name: '../../src' }, { cwd });
  await base.prepare();
  await base.run('prepublishOnly');

  expect(
    new Set(
      await globby('*', {
        cwd: pathLib.join(cwd, 'dist'),
        dot: true,
        onlyFiles: false,
      }),
    ),
  ).toEqual(
    new Set(
      Object.keys({ 'index.d.ts': true, 'index.js': true, 'test.txt': true }),
    ),
  );

  expect(
    await fs.readFile(pathLib.join(cwd, 'dist', 'index.js'), 'utf8'),
  ).toMatchSnapshot();
});
