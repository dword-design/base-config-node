import pathLib from 'node:path';

import chokidar from 'chokidar';
import debounce from 'debounce';

export default function (options) {
  return chokidar.watch(pathLib.join(this.cwd, 'src')).on(
    'all',
    debounce(async () => {
      try {
        await this.run('prepublishOnly', options);
      } catch (error) {
        console.log(error.message);
      }
    }, 200),
  );
}
