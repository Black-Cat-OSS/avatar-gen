import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    setupFiles: ['./test/vitest-setup.ts'],
  },
  resolve: {
    alias: {
      src: resolve(__dirname, './src'),
    },
  },
});

