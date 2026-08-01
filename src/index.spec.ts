import { Base, prepare, test as baseTest } from '@dword-design/base';
import { test } from '@playwright/test';
import outputFiles from 'output-files';

test('sass library', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'node_modules/foo': {
      'index.scss': '',
      'package.json': JSON.stringify({ main: './index.scss', name: 'foo' }),
    },
    'package.json': JSON.stringify({ dependencies: { foo: '^1.0.0' } }),
    'src/style.scss': "@import 'foo';",
  });

  const base = new Base('../../src', { cwd });
  await prepare(base);
  await baseTest(base);
});
