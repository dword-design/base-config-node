import pathLib from 'node:path';

import * as babel from '@babel/core';
import deleteEmpty from 'delete-empty';
import packageName from 'depcheck-package-name';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import { globby } from 'globby';
import micromatch from 'micromatch';
import ts from 'typescript';

export default async function (options) {
  options = {
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...options,
  };

  await this.lint(options);
  await fs.remove(pathLib.join(this.cwd, 'dist'));

  await fs.copy(pathLib.join(this.cwd, 'src'), pathLib.join(this.cwd, 'dist'), {
    filter: path => !micromatch.isMatch(path, ['**/*.ts', '**/*-snapshots']),
  });

  await deleteEmpty(pathLib.join(this.cwd, 'dist'));

  const { config } = ts.readConfigFile(
    pathLib.join(this.cwd, 'tsconfig.json'),
    ts.sys.readFile,
  );

  const { fileNames } = ts.parseJsonConfigFileContent(config, ts.sys, this.cwd);

  if (fileNames.length > 0) {
    const result = await execaCommand('tsc', {
      ...(options.log && { stdout: 'inherit' }),
      cwd: this.cwd,
      stderr: options.stderr,
    });

    const babelConfig = {
      plugins: [
        [
          packageName`babel-plugin-module-resolver`,
          { alias: { '@/src': './dist' }, cwd: this.cwd },
        ],
        packageName`babel-plugin-add-import-extension`,
      ],
    };

    const paths = await globby('**/*.js', {
      absolute: true,
      cwd: pathLib.join(this.cwd, 'dist'),
    });

    await Promise.all(
      paths.map(async path => {
        const source = await fs.readFile(path, 'utf8');

        const result = await babel.transformAsync(source, {
          ...babelConfig,
          cwd: this.cwd,
          filename: path,
        });

        if (result?.code) {
          await fs.outputFile(path, result.code);
        }
      }),
    );

    return result;
  }
}
