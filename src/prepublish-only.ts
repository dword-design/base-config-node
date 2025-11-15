import type { Base, PartialCommandOptions } from '@dword-design/base';
import { execaCommand } from 'execa';

import resolveAliases from './resolve-aliases';

export default async function (
  this: Base,
  options: PartialCommandOptions = {},
) {
  options = {
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...options,
  };

  await this.lint(options);

  const result = await execaCommand(
    'mkdist --declaration --ext=js --pattern=** --pattern=!**/*.spec.ts --pattern=!**/*-snapshots --loaders=js,vue', // Do not compile sass
    {
      ...(options.log && { stdout: 'inherit' }),
      cwd: this.cwd,
      stderr: options.stderr,
    },
  );

  await resolveAliases({ cwd: this.cwd });
  return result;
}
