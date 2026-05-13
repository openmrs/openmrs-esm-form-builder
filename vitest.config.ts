import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const r = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url));

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
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'Date',
      ],
    },
    alias: [
      { find: '@openmrs/esm-framework/src/internal', replacement: '@openmrs/esm-framework/mock' },
      { find: '@openmrs/esm-framework', replacement: '@openmrs/esm-framework/mock' },
      { find: 'react-i18next', replacement: r('./__mocks__/react-i18next.js') },
      { find: 'react-markdown', replacement: r('./__mocks__/react-markdown.tsx') },
      { find: /^@resources\/(.*)$/, replacement: r('./src/resources/') + '$1' },
      { find: /^@hooks\/(.*)$/, replacement: r('./src/hooks/') + '$1' },
      { find: '@types', replacement: r('./src/types.ts') },
      { find: /^@tools\/(.*)$/, replacement: r('./tools/') + '$1' },
      { find: '@constants', replacement: r('./src/constants.ts') },
    ],
  },
});
