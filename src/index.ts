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

export const newFormModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/new-form/new-form.modal'),
  options,
);

export const newPageModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/new-page/page.modal'),
  options,
);

export const deletePageModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/delete-page/delete-page.modal'),
  options,
);

export const newSectionModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/section/section.modal'),
  options,
);

export const deleteSectionModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/delete-section/delete-section.modal'),
  options,
);

export const addFormReferenceModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/add-form-reference/add-form-reference.modal'),
  options,
);

export const questionModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/question/question.modal'),
  options,
);

export const deleteQuestionModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/delete-question/delete-question.modal'),
  options,
);

export const restoreDraftSchemaModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/restore-draft-schema/restore-draft-schema.modal'),
  options,
);

export const unpublishFormModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/unpublish-form/unpublish-form.modal'),
  options,
);

export const deleteFormModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/delete-form/delete-form.modal'),
  options,
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
