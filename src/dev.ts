import pathLib from 'node:path';

import type { Base, PartialCommandOptions } from '@dword-design/base';
import chokidar from 'chokidar';
import debounce from 'debounce';

export default function (this: Base, options: PartialCommandOptions = {}) {
  return chokidar.watch(pathLib.join(this.cwd, 'src')).on(
    'all',
    debounce(async () => {
      try {
        await this.run('prepublishOnly', options);
      } catch (error) {
        console.log(error instanceof Error ? error.message : String(error));
      }
    }, 200),
  );
}
