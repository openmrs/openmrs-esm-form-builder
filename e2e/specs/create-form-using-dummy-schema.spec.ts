import { test } from '../core';
import { expect } from '@playwright/test';
import { deleteForm } from '../commands/form-operations';
import { FormBuilderPage } from '../pages';

let formUuid = '';

test('Create a form using the `Input Dummy Schema` feature', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I visit the form builder', async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step('And click the `Create New Form` button', async () => {
    await formBuilderPage.createNewFormButton().click();
  });

  await test.step('Then I click the `Input Dummy Schema` button', async () => {
    await formBuilderPage.inputDummySchemaButton().click();
  });

  await test.step('Then I click the `Save Form` button', async () => {
    await formBuilderPage.saveFormButton().click();
  });

  await test.step('And then I fill in the form name', async () => {
    await formBuilderPage.formNameInput().click();
    await formBuilderPage.formNameInput().fill('A sample form with dummy schema');
  });

  await test.step('And then I fill in the version number', async () => {
    await formBuilderPage.formVersionInput().click();
    await formBuilderPage.formVersionInput().fill('1.0');
  });

  await test.step('And then I fill in the form description', async () => {
    await formBuilderPage.formDescriptionInput().fill('This is a test form');
  });

  await test.step('And then I select the encounter type', async () => {
    await formBuilderPage.formEncounterType().selectOption('Admission');
  });

  await test.step('And then I click on the `Save` button', async () => {
    await formBuilderPage.formSaveButton().click();
  });

  await test.step('Then should get a success message and be redirected to the edit page for the new form', async () => {
    // Checks whether the user has been redirected to the edit page
    const editFormPageURLRegex = new RegExp('/edit/');
    await expect(formBuilderPage.page.getByText('Form created')).toBeVisible();
    await page.waitForURL(editFormPageURLRegex);
    const editFormPageURL = page.url();
    formUuid = editFormPageURL.split('/').slice(-1)[0];
  });
});

test.afterEach(async ({ api }) => {
  if (formUuid) {
    await deleteForm(api, formUuid);
  }
});
