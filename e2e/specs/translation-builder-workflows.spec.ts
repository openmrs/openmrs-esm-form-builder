/* eslint-disable testing-library/prefer-screen-queries */

import { test } from '../core';
import { expect } from '@playwright/test';
import { deleteForm, createForm, createValueReference, addFormResources } from '../commands/form-operations';
import { FormBuilderPage } from '../pages';

let formUuid = '';

const formDetails = {
  name: 'Covid-19 Screening',
  description: 'A test form for recording COVID-19 screening information',
  version: '1.0',
  published: true,
};
test.beforeEach(async ({ api }) => {
  const form = await createForm(api, false, formDetails);
  formUuid = form.uuid;

  const valueReference = await createValueReference(api);
  await addFormResources(api, valueReference, formUuid);
});

test('Manage translations: switch languages, filter, and search', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I open a form in the translation builder', async () => {
    await formBuilderPage.gotoFormBuilder();
    await formBuilderPage.searchForForm(formDetails.name);
    await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
  });

  await test.step('And then I go to the translation builder', async () => {
    await formBuilderPage.translationBuilderTab().click();
  });

  await test.step('And I switch between languages', async () => {
    await formBuilderPage.languageDropdown().click();
    const dropdownMenu = formBuilderPage.translationBuilderPanel().locator('.cds--list-box__menu');
    await expect(dropdownMenu).toBeVisible();
    await expect(dropdownMenu.getByRole('option', { name: 'English (en)' })).toBeVisible();
  });

  await test.step('And I filter translations using tabs', async () => {
    await formBuilderPage.allTranslationsTab().click();
    await expect(formBuilderPage.allTranslationsTab()).toHaveAttribute('aria-selected', 'true');

    await formBuilderPage.translatedTab().click();
    await expect(page.locator('[data-status="translated"]')).toHaveCount(0);

    await formBuilderPage.untranslatedTab().click();
    await expect(formBuilderPage.untranslatedTab()).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-status="untranslated"]').first()).toBeVisible();
  });

  await test.step('And I search for a translation string', async () => {
    const searchInput = formBuilderPage.translationSearchInput();
    await searchInput.fill('Visit Details');
    await expect(searchInput).toHaveValue('Visit Details');

    const results = page.locator('[data-testid="translation-entry"]');
    await expect(results).not.toHaveCount(0);
    await expect(results.first()).toBeVisible();
  });
});

test('Edit and update an individual translation', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I open a form in the Translation Builder', async () => {
    await formBuilderPage.gotoFormBuilder();
    await formBuilderPage.searchForForm(formDetails.name);
    await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
  });

  await test.step('And then I go to the translation builder', async () => {
    await formBuilderPage.translationBuilderTab().click();
  });

  await test.step('And then I select the French language', async () => {
    await formBuilderPage.languageDropdown().click();
    const dropdownMenu = formBuilderPage.translationBuilderPanel().locator('.cds--list-box__menu');
    await expect(dropdownMenu).toBeVisible();
    await dropdownMenu.getByRole('option', { name: 'French (fr)' }).click();
  });

  await test.step('And then I edit a translation string and save it', async () => {
    await formBuilderPage.editTranslationButton(0).click();
    const translationInput = formBuilderPage.translationValueInput();
    await translationInput.fill('Test Translation Updated');
  });
  await test.step('And then when I preview the form in the language, I should see the edited translation strings', async () => {
    await formBuilderPage.saveTranslationButton().click();
    await expect(formBuilderPage.translationModal()).toBeHidden();
    await expect(formBuilderPage.editTranslationButton(0)).toBeEnabled();
  });
});
test('Download a translation file from a form', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I open a form in the translation Builder', async () => {
    await formBuilderPage.gotoFormBuilder();
    await formBuilderPage.searchForForm(formDetails.name);
    await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
  });

  await test.step('And then I go to the translation builder', async () => {
    await formBuilderPage.translationBuilderTab().click();
  });

  await test.step('And I download the translation file', async () => {
    const downloadButton = formBuilderPage.downloadTranslationButton();
    const [download] = await Promise.all([
      formBuilderPage.page.waitForEvent('download', { timeout: 15000 }),
      downloadButton.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  });
});

test('Upload a translation file to backend', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I open a form in the translation builder', async () => {
    await formBuilderPage.gotoFormBuilder();
    await formBuilderPage.searchForForm(formDetails.name);
    await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
  });

  await test.step('And then I go to the translation builder', async () => {
    await formBuilderPage.translationBuilderTab().click();
  });

  await test.step('And I upload a translation file', async () => {
    const uploadButton = formBuilderPage.uploadTranslationButton();
    await expect(uploadButton).toBeEnabled();
    await expect(uploadButton).toBeVisible();
    await expect(formBuilderPage.translationBuilderPanel()).toBeVisible();

    await uploadButton.click();
    await expect(formBuilderPage.page.getByText(/Translations Uploaded./i)).toBeVisible();
    await expect(formBuilderPage.page.getByText(/Translation file uploaded successfully/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  if (formUuid) {
    await deleteForm(api, formUuid);
  }
});
