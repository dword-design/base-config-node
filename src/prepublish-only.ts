import pathLib from 'node:path';

import deleteEmpty from 'delete-empty';
import packageName from 'depcheck-package-name';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
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

    await fs.outputFile(
      pathLib.join(this.cwd, 'babel.config.json'),
      `${JSON.stringify({
        plugins: [
          [
            packageName`babel-plugin-module-resolver`,
            { alias: { '@/src': './dist' } },
          ],
          packageName`babel-plugin-add-import-extension`,
        ],
      })}\n`,
    );

    try {
      await execaCommand('babel dist --out-dir dist', { cwd: this.cwd });
    } finally {
      await fs.remove(pathLib.join(this.cwd, 'babel.config.json'));
    }

    return result;
  }
}
