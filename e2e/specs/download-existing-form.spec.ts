import { test } from '../core';
import { createForm, createValueReference, addFormResources, deleteForm } from '../commands/form-operations';
import type { Form } from '@types';
import { FormBuilderPage } from '../pages';
import { expect } from '@playwright/test';

let form: Form = null;

test.beforeEach(async ({ api }) => {
  form = await createForm(api, false);
  const valueReference = await createValueReference(api);
  await addFormResources(api, valueReference, form.uuid);
});

test('Download an existing form', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I visit the form builder', async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step('And I search for the form I need to download', async () => {
    await formBuilderPage.searchForForm(form.name);
  });

  await test.step('And I click the `Download` button on the form I need to download', async () => {
    const downloadPromise = page.waitForEvent('download');
    await formBuilderPage.page
      .getByRole('row', { name: form.name })
      .getByLabel(/download schema/i)
      .first()
      .click();
    const download = await downloadPromise;
    expect(download).toBeDefined();
  });
});

test.afterEach(async ({ api }) => {
  if (form) {
    await deleteForm(api, form.uuid);
  }
});
