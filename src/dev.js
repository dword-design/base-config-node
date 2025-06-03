import pathLib from 'node:path';

import chokidar from 'chokidar';
import debounce from 'debounce';

import prepublishOnly from './prepublish-only.js';

export default function (options) {
  return chokidar.watch(pathLib.join(this.cwd, 'src')).on(
    'all',
    debounce(async () => {
      try {
        await prepublishOnly.call(this, options);
      } catch (error) {
        console.log(error.message);
      }
    }, 200),
  );
}
