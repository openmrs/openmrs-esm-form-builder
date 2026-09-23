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
test.describe('Translation Builder', () => {
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
      await formBuilderPage.translationBuilderTab().click();
    });

    await test.step('When I open the language dropdown', async () => {
      await formBuilderPage.languageDropdown().click();
    });

    await test.step('Then I should see the language list', async () => {
      const dropdownMenu = formBuilderPage.translationBuilderPanel().locator('.cds--list-box__menu');
      await expect(dropdownMenu).toBeVisible();
    });

    await test.step('And I should see "English (en)" in the language list', async () => {
      await expect(formBuilderPage.page.getByRole('option', { name: 'English (en)' })).toBeVisible();
    });

    await test.step('When I select the "All" translations tab', async () => {
      await formBuilderPage.allTranslationsTab().click();
    });

    await test.step('Then the "All" translations tab should be selected', async () => {
      await expect(formBuilderPage.allTranslationsTab()).toHaveAttribute('aria-selected', 'true');
    });

    await test.step('When I select the "Translated" translations tab', async () => {
      await formBuilderPage.translatedTab().click();
    });

    await test.step('Then I should see 0 "translated" entries', async () => {
      await expect(page.locator('[data-status="translated"]')).toHaveCount(0);
    });

    await test.step('When I select the "Untranslated" translations tab', async () => {
      await formBuilderPage.untranslatedTab().click();
    });

    await test.step('Then the "Untranslated" translations tab should be selected', async () => {
      await expect(formBuilderPage.untranslatedTab()).toHaveAttribute('aria-selected', 'true');
    });

    await test.step('And I should see at least 1 "untranslated" entry', async () => {
      await expect(page.locator('[data-status="untranslated"]').first()).toBeVisible();
    });

    await test.step('When I search translations for "Visit Details"', async () => {
      const searchInput = formBuilderPage.translationSearchInput();
      await searchInput.fill('Visit Details');
    });

    await test.step('Then the translation search input should contain "Visit Details"', async () => {
      const searchInput = formBuilderPage.translationSearchInput();
      await expect(searchInput).toHaveValue('Visit Details');
    });

    await test.step('And I should see at least 1 translation result', async () => {
      const results = page.locator('[data-testid="translation-entry"]');
      await expect(results).not.toHaveCount(0);
    });

    await test.step('And the first translation result should be visible', async () => {
      const results = page.locator('[data-testid="translation-entry"]');
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
      await formBuilderPage.page.getByRole('option', { name: 'French (fr)' }).click();
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

    await test.step('Given I have opened a form in the Form Builder', async () => {
      await formBuilderPage.gotoFormBuilder();
      await formBuilderPage.searchForForm(formDetails.name);
      await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
    });

    await test.step('When I navigate to the Translation Builder', async () => {
      await formBuilderPage.translationBuilderTab().click();
    });

    await test.step('Then I should be able to download the translation file', async () => {
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

    await test.step('Given I have opened a form in the Form Builder', async () => {
      await formBuilderPage.gotoFormBuilder();
      await formBuilderPage.searchForForm(formDetails.name);
      await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
    });

    await test.step('When I navigate to the Translation Builder', async () => {
      await formBuilderPage.translationBuilderTab().click();
    });

    await test.step('Then I should be able to upload a translation file successfully', async () => {
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
});
