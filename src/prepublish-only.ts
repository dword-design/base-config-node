import {
  type Base,
  lint,
  type PartialCommandOptions,
  run,
  typecheck,
} from '@dword-design/base';

export default async (base: Base, options: PartialCommandOptions = {}) => {
  await lint(base, options);
  await typecheck(base, options);
  return run(base, 'build', options);
};
