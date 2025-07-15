import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/coverage/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'composables/**',
        'services/**',
        'utils/**'
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        '.nuxt/**',
        '.output/**',
        'coverage/**',
        'test/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    globals: true,
    testTimeout: 10000,
    hookTimeout: 5000,
    teardownTimeout: 5000,
    silent: false,
    reporters: ['verbose']
  }
})