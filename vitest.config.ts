import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['skeleton/src/**/*.test.ts', 'apps/*/src/**/*.test.ts'],
  },
});
