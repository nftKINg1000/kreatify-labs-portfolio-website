import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'server/**/*.test.ts'],
    restoreMocks: true,
    testTimeout: 15_000,
    coverage: { provider: 'v8', include: ['src/**', 'server/**'], exclude: ['src/test/**', '**/*.test.*'] },
  },
});
