// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const config = (module.exports = require('openmrs/default-webpack-config'));
config.overrides.resolve = {
  extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss', '.json'],
  alias: {
    '@openmrs/esm-framework': '@openmrs/esm-framework/src/internal',
    '@openmrs/esm-form-engine-lib': '@openmrs/esm-form-engine-lib/src/index',
    '@hooks': path.resolve(__dirname, 'src/hooks/'),
    '@types$': path.resolve(__dirname, 'src/types.ts'),
    '@resources': path.resolve(__dirname, 'src/resources/'),
    '@tools': path.resolve(__dirname, 'tools/'),
    '@constants$': path.resolve(__dirname, 'src/constants.ts'),
  },
};
module.exports = config;
