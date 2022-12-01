import {
  getAsyncLifecycle,
  defineConfigSchema,
  registerBreadcrumbs,
} from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";

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
  const moduleName = "@openmrs/esm-form-builder-app";

  const options = {
    featureName: "form-builder",
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  registerBreadcrumbs([
    {
      path: `${window.spaBase}/form-builder`,
      title: "Form Builder",
      parent: `${window.spaBase}/home`,
    },
    {
      path: `${window.spaBase}/form-builder/new`,
      title: "Form Editor",
      parent: `${window.spaBase}/form-builder`,
    },
    {
      path: `${window.spaBase}/form-builder/edit/:uuid`,
      title: "Form Editor",
      parent: `${window.spaBase}/form-builder`,
    },
  ]);

  return {
    pages: [
      {
        load: getAsyncLifecycle(() => import("./root.component"), options),
        route: "form-builder",
      },
    ],
    extensions: [
      {
        id: "form-builder-app-menu-link",
        slot: "app-menu-slot",
        load: getAsyncLifecycle(
          () => import("./form-builder-app-menu-link.component"),
          options
        ),
        online: true,
        offline: true,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
