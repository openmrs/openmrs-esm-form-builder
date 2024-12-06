const config = (module.exports = require('openmrs/default-webpack-config'));
config.overrides.resolve = {
  extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss', '.json'],
  alias: {
    '@openmrs/esm-framework': '@openmrs/esm-framework/src/internal',
    '@openmrs/esm-form-engine-lib': '@openmrs/esm-form-engine-lib/src/index',
  },
};
module.exports = config;
