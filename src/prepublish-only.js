import { endent, property } from '@dword-design/functions';
import deleteEmpty from 'delete-empty';
import { execa } from 'execa';
import fs from 'fs-extra';
import micromatch from 'micromatch';
import { createRequire } from 'module';
import P from 'path';

const _require = createRequire(import.meta.url);

export default async function (options) {
  options = {
    log: process.env.NODE_ENV !== 'test',
    resolvePluginsRelativeTo: _require.resolve('@dword-design/eslint-config'),
    ...options,
  };

  const output = { all: '' };

  try {
    output.all +=
      execa(
        'eslint',
        [
          '--fix',
          '--ext',
          '.js,.json',
          '--ignore-path',
          '.gitignore',
          '--resolve-plugins-relative-to',
          options.resolvePluginsRelativeTo,
          '.',
        ],
        options.log ? { stdio: 'inherit' } : { all: true },
      )
      |> await
      |> property('all');
  } catch (error) {
    throw new Error(error.all);
  }

  await fs.remove('dist');

  // https://github.com/babel/babel/issues/11394
  await fs.copy('src', 'dist', {
    filter: path =>
      !micromatch.isMatch(path, [
        '**/*.js',
        '**/__snapshots__',
        '**/__image_snapshots__',
      ]),
  });

  await deleteEmpty(P.resolve('dist'));

  if (this.config.cjsFallback) {
    await fs.outputFile(
      P.join('dist', 'cjs-fallback.cjs'),
      endent`
        const jiti = require('jiti')(__filename, { interopDefault: true })
        const api = jiti('.')

        module.exports = api
      `,
    );
  }

  output.all +=
    execa(
      'babel',
      ['--out-dir', 'dist', '--ignore', '**/*.spec.js', '--verbose', 'src'],
      options.log ? { stdio: 'inherit' } : { all: true },
    )
    |> await
    |> property('all');

  return output;
}
