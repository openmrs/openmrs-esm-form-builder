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

export const newFormModal = getAsyncLifecycle(() => import('./components/interactive-builder/new-form.modal'), options);

export const newPageModal = getAsyncLifecycle(() => import('./components/interactive-builder/page.modal'), options);

export const deletePageModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/delete-page.modal'),
  options,
);

export const newSectionModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/section.modal'),
  options,
);

export const addReferenceSectionModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/reference-section.modal'),
  options,
);

export const deleteSectionModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/delete-section.modal'),
  options,
);

export const addQuestionModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/add-question.modal'),
  options,
);

export const deleteQuestionModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/delete-question.modal'),
  options,
);

export const editQuestionModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/edit-question.modal'),
  options,
);

export const restoreDraftSchemaModal = getAsyncLifecycle(
  () => import('./components/form-editor/restore-draft-schema.modal'),
  options,
);

export const unpublishFormModal = getAsyncLifecycle(
  () => import('./components/action-buttons/unpublish-form.modal'),
  options,
);

export const deleteFormModal = getAsyncLifecycle(() => import('./components/dashboard/delete-form.modal'), options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
