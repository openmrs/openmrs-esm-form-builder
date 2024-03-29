import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-form-builder-app';

const options = {
  featureName: 'form-builder',
  moduleName,
};

export const importTranslation = require.context('../translations', true, /.json$/, 'lazy');

export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const systemAdministrationFormBuilderCardLink = getAsyncLifecycle(
  () => import('./form-builder-admin-card-link.component'),
  options,
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
