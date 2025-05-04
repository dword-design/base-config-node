import chokidar from 'chokidar';
import debounce from 'debounce';

import prepublishOnly from './prepublish-only.js';

export default options =>
  chokidar.watch('src').on(
    'all',
    debounce(async () => {
      try {
        await prepublishOnly(options);
      } catch (error) {
        console.log(error.message);
      }
    }, 200),
  );
