const config = (module.exports = require("openmrs/default-webpack-config"));
config.scriptRuleConfig.exclude = /(node_modules(?![/\\]@(?:openmrs|ohri)))/;
config.override.resolve = {
  extensions: [".tsx", ".ts", ".jsx", ".js", ".scss", ".json"],
  alias: {
    "@openmrs/esm-framework": "@openmrs/esm-framework/src/internal",
    "@openmrs/openmrs-form-engine-lib":
      "@openmrs/openmrs-form-engine-lib/src/index",
  },
};
module.exports = config;
