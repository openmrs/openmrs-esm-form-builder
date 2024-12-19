/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  transform: {
    '^.+\\.tsx?$': ['@swc/jest'],
  },
  transformIgnorePatterns: ['/node_modules/(?!@openmrs)'],
  moduleDirectories: ['node_modules', '__mocks__', 'tools', 'src', __dirname],
  moduleNameMapper: {
    '^@resources/(.*)$': '<rootDir>/src/resources/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@types$': '<rootDir>/src/types.ts',
    '^@tools/(.*)$': '<rootDir>/tools/$1',
    '^@constants$': '<rootDir>/src/constants.ts',
    '^@carbon/icons-react/es/(.*)$': '@carbon/icons-react/lib/$1',
    '^carbon-components-react/es/(.*)$': 'carbon-components-react/lib/$1',
    '@openmrs/esm-framework': '@openmrs/esm-framework/mock',
    '\\.(s?css)$': 'identity-obj-proxy',
    '^lodash-es/(.*)$': 'lodash/$1',
    'lodash-es': 'lodash',
    '^dexie$': '<rootDir>/node_modules/dexie',
    '^react-i18next$': '<rootDir>/__mocks__/react-i18next.js',
    'react-markdown': '<rootDir>/__mocks__/react-markdown.tsx',
  },
  setupFilesAfterEnv: ['<rootDir>/tools/setup-tests.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/e2e'],
};
