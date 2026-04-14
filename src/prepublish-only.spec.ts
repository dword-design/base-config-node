import pathLib from 'node:path';

import { Base } from '@dword-design/base';
import { expect, test } from '@playwright/test';
import fs from 'fs-extra';

test('build errors', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'src', 'index.ts'), 'foo bar');
  const base = new Base('../../src', { cwd });
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

  const base = new Base('../../src', { cwd });
  await base.prepare();
  await base.run('prepublishOnly');

  expect(
    await fs.readFile(pathLib.join(cwd, 'src', 'index.ts'), 'utf8'),
  ).toEqual("console.log('foo');\n");
});

test('linting errors', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'src', 'index.ts'), 'var foo = 2');
  const base = new Base('../../src', { cwd });
  await base.prepare();

  await expect(base.run('prepublishOnly')).rejects.toThrow(
    "'foo' is assigned a value but never used",
  );

  expect(await fs.exists(pathLib.join(cwd, 'dist'))).toBeFalsy();
});
