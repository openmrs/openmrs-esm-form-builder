import openmrs from '@openmrs/eslint-config';

export default [
  {
    ignores: ['**/dist/**', 'coverage/**', '.yarn/**', '**/*.d.tsx', '__mocks__/*'],
  },
  ...openmrs,
  {
    rules: {
      // typescript-eslint v8 split ban-types into these three rules. This repo
      // enforced them before the migration, while the shared config leaves them off.
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/no-require-imports': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['e2e/**'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];
