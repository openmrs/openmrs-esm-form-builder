import { getAsyncLifecycle } from "@openmrs/esm-framework";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

const backendDependencies = {
  fhir2: "^1.2.0",
  "webservices.rest": "^2.2.0",
};

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-form-builder";

  const options = {
    featureName: "form-builder",
    moduleName,
  };

  return {
    pages: [
      {
        load: getAsyncLifecycle(() => import("./form-builder"), options),
        route: "form-builder",
      },
    ],
    extensions: [],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
