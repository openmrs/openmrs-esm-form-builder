import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [{ find: /^.*\.s?css$/, replacement: 'identity-obj-proxy' }],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    clearMocks: true,
    setupFiles: ['./tools/setup-tests.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
    server: {
      deps: {
        inline: [/@openmrs/],
      },
    },
    fakeTimers: {
      toFake: [
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
        'setImmediate',
        'clearImmediate',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'Date',
      ],
    },
    alias: [
      { find: '@openmrs/esm-framework/src/internal', replacement: '@openmrs/esm-framework/mock' },
      { find: '@openmrs/esm-framework', replacement: '@openmrs/esm-framework/mock' },
      { find: 'react-i18next', replacement: new URL('./__mocks__/react-i18next.js', import.meta.url).pathname },
      { find: 'react-markdown', replacement: new URL('./__mocks__/react-markdown.tsx', import.meta.url).pathname },
      { find: /^@resources\/(.*)$/, replacement: new URL('./src/resources/', import.meta.url).pathname + '$1' },
      { find: /^@hooks\/(.*)$/, replacement: new URL('./src/hooks/', import.meta.url).pathname + '$1' },
      { find: '@types', replacement: new URL('./src/types.ts', import.meta.url).pathname },
      { find: /^@tools\/(.*)$/, replacement: new URL('./tools/', import.meta.url).pathname + '$1' },
      { find: '@constants', replacement: new URL('./src/constants.ts', import.meta.url).pathname },
    ],
  },
});
