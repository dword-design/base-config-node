import type { Base, PartialCommandOptions } from '@dword-design/base';

export default async (base: Base, options: PartialCommandOptions = {}) => {
  await base.lint(options);
  await base.typecheck(options);
  return base.run('build', options);
};
