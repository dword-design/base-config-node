import pathLib from 'node:path';

import deleteEmpty from 'delete-empty';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import micromatch from 'micromatch';

export default async function (options) {
  options = {
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...options,
  };

  await execaCommand('eslint --fix .', {
    ...(options.log && { stdout: 'inherit' }),
    cwd: this.cwd,
    stderr: options.stderr,
  });

  await fs.remove(pathLib.join(this.cwd, 'dist'));

  await fs.copy(pathLib.join(this.cwd, 'src'), pathLib.join(this.cwd, 'dist'), {
    filter: path =>
      !micromatch.isMatch(path, [
        '**/*.ts',
        ...(this.config.testRunner === 'playwright'
          ? ['**/*-snapshots']
          : ['**/__snapshots__', '**/__image_snapshots__']),
      ]),
  });

  await deleteEmpty(pathLib.join(this.cwd, 'dist'));

  const hasFiles = await execaCommand('tsc --listFilesOnly', { cwd: this.cwd })
    .then(() => true)
    .catch(() => false);

  let result;

  if (hasFiles) {
    result = await execaCommand('tsc --rootDir src --outDir dist', {
      ...(options.log && { stdout: 'inherit' }),
      cwd: this.cwd,
      stderr: options.stderr,
    });
  }

  await execaCommand('tsc-alias --outDir dist --resolve-full-paths');
  return result;
}
