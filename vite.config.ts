import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true' ? {
        clientPort: process.env.K_SERVICE ? 443 : undefined,
      } : false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
