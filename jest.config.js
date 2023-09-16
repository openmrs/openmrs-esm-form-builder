/** @type {import('jest').Config} */
module.exports = {
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
    '^dexie$': '<rootDir>/node_modules/dexie',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setup-tests.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/e2e'],
};
