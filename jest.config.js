/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  transform: {
    '^.+\\.tsx?$': ['@swc/jest'],
  },
  transformIgnorePatterns: ['/node_modules/(?!@openmrs)'],
  moduleNameMapper: {
    '^@carbon/icons-react/es/(.*)$': '@carbon/icons-react/lib/$1',
    '^carbon-components-react/es/(.*)$': 'carbon-components-react/lib/$1',
    '@openmrs/esm-framework': '@openmrs/esm-framework/mock',
    '\\.(s?css)$': 'identity-obj-proxy',
    '^lodash-es/(.*)$': 'lodash/$1',
    'lodash-es': 'lodash',
    '^dexie$': '<rootDir>/node_modules/dexie',
    '^react-i18next$': '<rootDir>/__mocks__/react-i18next.js',
    '^uuid$': '<rootDir>/node_modules/uuid',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setup-tests.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/e2e'],
};
