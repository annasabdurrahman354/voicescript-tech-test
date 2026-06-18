import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Run all tests, domain tests are fast and need no DB
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // Focus coverage reporting on the pure domain layer
      include: ['src/domain/**'],
      reporter: ['text', 'json', 'html'],
    },
  },
});
