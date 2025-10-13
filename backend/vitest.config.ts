import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.spec.ts'],
    setupFiles: ['./test/vitest-setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      exclude: [
        '**/*.interface.ts',
        '**/*.enum.ts',
        '**/*.dto.ts',
        '**/index.ts',
      ],
    },
    mockReset: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      src: resolve(__dirname, './src'),
    },
  },
});

