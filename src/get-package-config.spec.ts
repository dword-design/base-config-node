import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import fs from 'fs-extra';
import outputFiles from 'output-files';

import self from './get-package-config';

test('empty', ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  expect(self({ cwd })).toEqual({});
});

test('esm', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'src', 'index.ts'), '');

  expect(self({ cwd })).toEqual({
    exports: {
      '.': {
        import: { default: './dist/index.js', types: './dist/index.d.ts' },
      },
    },
    main: 'dist/index.js',
  });
});

test('multiple exports', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      exports: { '.': './dist/index.js', './foo': './dist/index.js' },
    }),
    'src/foo.ts': '',
    'src/index.ts': '',
  });

  expect(self({ cwd })).toEqual({
    exports: {
      '.': {
        import: { default: './dist/index.js', types: './dist/index.d.ts' },
      },
      './foo': './dist/index.js',
    },
    main: 'dist/index.js',
  });
});

test('outdated object export', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      exports: { '.': './dist/xyz.js', './foo': './dist/foo.js' },
    }),
    'src/index.ts': '',
  });

  expect(self({ cwd })).toEqual({
    exports: {
      '.': {
        import: { default: './dist/index.js', types: './dist/index.d.ts' },
      },
      './foo': './dist/foo.js',
    },
    main: 'dist/index.js',
  });
});

test('outdated string export', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ exports: './dist/foo.js' }),
    'src/index.ts': '',
  });

  expect(self({ cwd })).toEqual({
    exports: {
      '.': {
        import: { default: './dist/index.js', types: './dist/index.d.ts' },
      },
    },
    main: 'dist/index.js',
  });
});

test('single default export in object', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ exports: { '.': './dist/xyz.js' } }),
    'src/foo.ts': '',
    'src/index.ts': '',
  });

  expect(self({ cwd })).toEqual({
    exports: {
      '.': {
        import: { default: './dist/index.js', types: './dist/index.d.ts' },
      },
    },
    main: 'dist/index.js',
  });
});

test('single non-export in object', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ exports: { './foo': './dist/foo.js' } }),
    'src/foo.ts': '',
    'src/index.ts': '',
  });

  expect(self({ cwd })).toEqual({
    exports: {
      '.': {
        import: { default: './dist/index.js', types: './dist/index.d.ts' },
      },
      './foo': './dist/foo.js',
    },
    main: 'dist/index.js',
  });
});
