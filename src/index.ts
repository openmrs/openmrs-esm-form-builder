import { defineConfigSchema, getAsyncLifecycle, registerFeatureFlag } from '@openmrs/esm-framework';
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

export const deleteQuestionModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/delete-question-modal.component'),
  options,
);

export const editQuestionModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/edit-question-modal.component'),
  options,
);

export const deleteConditionalLogicModal = getAsyncLifecycle(
  () => import('./components/rule-builder/delete-conditional-logic-modal.component'),
  options,
);
export function startupApp() {
  defineConfigSchema(moduleName, configSchema);

  registerFeatureFlag(
    'form-rule-builder',
    'Form Validation Rule Builder',
    'Enables conditional logic in forms to streamline workflow',
  );
}
