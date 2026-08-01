import pathLib from 'node:path';

import { type Base, type PartialCommandOptions, run } from '@dword-design/base';
import chokidar from 'chokidar';
import debounce from 'debounce';

export default (base: Base, options: PartialCommandOptions = {}) =>
  chokidar.watch(pathLib.join(base.cwd, 'src')).on(
    'all',
    debounce(async () => {
      try {
        await run(base, 'prepublishOnly', options);
      } catch (error) {
        console.log(error instanceof Error ? error.message : String(error));
      }
    }, 200),
  );
