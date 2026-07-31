import pathLib from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Base, PartialCommandOptions } from '@dword-design/base';
import { execaCommand } from 'execa';

import resolveAliases from './resolve-aliases';

const __dirname = pathLib.dirname(fileURLToPath(import.meta.url));

export default async function (
  this: Base,
  options: PartialCommandOptions = {},
) {
  options = {
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...options,
  };

  const result = await execaCommand(
    'mkdist --declaration --ext=js --pattern=** --pattern=!**/*.spec.ts --pattern=!**/*-snapshots --loaders=js,vue', // Do not compile sass
    {
      ...(options.log && { stdout: 'inherit' }),
      cwd: this.cwd,
      localDir: __dirname,
      preferLocal: true,
      stderr: options.stderr,
    },
  );

  await resolveAliases({ cwd: this.cwd });
  return result;
}
