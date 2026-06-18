import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Run all tests, domain tests are fast and need no DB
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/statusMachine.ts', 'src/modules/**/*.service.ts'],
      reporter: ['text', 'json', 'html'],
    },
  },
});
