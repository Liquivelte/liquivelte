import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    testTimeout: 5000,
    hookTimeout: 5000,
    coverage: {
      provider: 'v8',
      include: ['src/compiler/**/*.ts', 'src/runtime/**/*.ts'],
      exclude: ['src/**/*.d.ts']
    }
  }
});
