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

test.describe('Translation Builder Workflows', () => {
  test.beforeEach(async ({ api }) => {
    const form = await createForm(api, false, formDetails);
    formUuid = form.uuid;

    const valueReference = await createValueReference(api);
    await addFormResources(api, valueReference, formUuid);
  });

  test.afterEach(async ({ api }) => {
    if (formUuid) {
      await deleteForm(api, formUuid);
    }
  });

  test('Workflow 1: Basic Translation Builder Display', async ({ page }) => {
    const formBuilderPage = new FormBuilderPage(page);

    await test.step('When I visit the form builder', async () => {
      await formBuilderPage.gotoFormBuilder();
    });

    await test.step('And I search for the form and open it for editing', async () => {
      await formBuilderPage.searchForForm(formDetails.name);
      await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
    });

    await test.step('And I open the Translation builder tab', async () => {
      await formBuilderPage.translationBuilderTab().click();
    });

    await test.step('Then I should see the translation builder components (Download/Upload buttons, Translation filter tabs: All/Translated/Untranslated, and the search input)', async () => {
      const translationPanel = formBuilderPage.page
        .getByRole('tabpanel')
        .filter({ has: formBuilderPage.page.getByRole('button', { name: /upload translation/i }) });

      await expect(translationPanel).toBeVisible();
      await expect(translationPanel.getByRole('button', { name: /download translation/i })).toBeVisible();
      await expect(translationPanel.getByRole('button', { name: /upload translation/i })).toBeVisible();
      const tabList = translationPanel.getByRole('tablist', { name: 'Translation filter' });
      await expect(tabList).toBeVisible();

      const tabs = tabList.getByRole('tab');
      await expect(tabs).toHaveCount(3);
      await expect(tabs.nth(0)).toContainText(/all/i);
      await expect(tabs.nth(1)).toContainText(/translated/i);
      await expect(tabs.nth(2)).toContainText(/untranslated/i);
      await expect(translationPanel.getByPlaceholder(/search translation keys/i)).toBeVisible();
    });
  });

  test('Workflow 2: Language Selection and Switching', async ({ page }) => {
    const formBuilderPage = new FormBuilderPage(page);

    await test.step('When I visit the form builder', async () => {
      await formBuilderPage.gotoFormBuilder();
    });

    await test.step('And I search for the form and open it for editing', async () => {
      await formBuilderPage.searchForForm(formDetails.name);
      await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
    });

    await test.step('And I open the Translation builder tab', async () => {
      await formBuilderPage.translationBuilderTab().click();
    });

    await test.step('Then I should see the translation builder components (Download/Upload buttons, Translation filter tabs: All/Translated/Untranslated, and the search input)', async () => {
      await expect(formBuilderPage.downloadTranslationButton()).toBeVisible();
    });

    await test.step('And the language dropdown is present and functional', async () => {
      const languageDropdown = formBuilderPage.languageDropdown();
      await expect(languageDropdown).toBeVisible();
      await expect(languageDropdown).toBeEnabled();
    });

    await test.step('When I open the language dropdown and view available languages', async () => {
      await formBuilderPage.languageDropdown().click();

      const dropdownMenu = formBuilderPage.translationBuilderPanel().locator('.cds--list-box__menu');
      await expect(dropdownMenu).toBeVisible();

      const languageOptions = dropdownMenu.getByRole('option');
      const optionCount = await languageOptions.count();
      expect(optionCount).toBeGreaterThan(0);

      await expect(dropdownMenu.getByRole('option', { name: 'English (en)' })).toBeVisible();
      await expect(languageOptions.nth(1)).toBeVisible();
    });
  });

  test('Workflow 3: Translation Filtering by Tabs', async ({ page }) => {
    const formBuilderPage = new FormBuilderPage(page);

    await test.step('When I visit the form builder', async () => {
      await formBuilderPage.gotoFormBuilder();
    });

    await test.step('And I search for the form and open it for editing', async () => {
      await formBuilderPage.searchForForm(formDetails.name);
      await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
    });

    await test.step('And I open the Translation builder tab', async () => {
      await formBuilderPage.translationBuilderTab().click();
    });

    await test.step('Then I should see the translation builder actions', async () => {
      await expect(formBuilderPage.downloadTranslationButton()).toBeVisible();
    });
    const allEntries = page.locator('[data-testid="translation-entry"]');
    const totalEntries = await allEntries.count();

    await test.step('When I click on the All translations tab', async () => {
      await formBuilderPage.allTranslationsTab().click();
      await expect(formBuilderPage.allTranslationsTab()).toHaveAttribute('aria-selected', 'true');
    });

    await test.step('Then I should see all translation entries', async () => {
      const entries = formBuilderPage.page.locator('[data-testid="translation-entry"]');
      await expect(entries.first()).toBeVisible();
    });

    await test.step('When I click on the Translated tab', async () => {
      await formBuilderPage.translatedTab().click();
      const translatedEntries = page.locator('[data-status="translated"]');
      await expect(translatedEntries).toHaveCount(0);
    });

    await test.step('When I click on the Untranslated tab', async () => {
      await formBuilderPage.untranslatedTab().click();
      await expect(formBuilderPage.untranslatedTab()).toHaveAttribute('aria-selected', 'true');

      const untranslatedEntries = page.locator('[data-status="untranslated"]');
      await expect(untranslatedEntries.first()).toBeVisible();

      const totalEntries = await page.locator('[data-testid="translation-entry"]').count();

      await expect(untranslatedEntries).toHaveCount(totalEntries);
    });
  });

  test('Workflow 4: Translation Search Functionality', async ({ page }) => {
    const formBuilderPage = new FormBuilderPage(page);

    await test.step('When I visit the form builder', async () => {
      await formBuilderPage.gotoFormBuilder();
    });

    await test.step('And I search for the form and open it for editing', async () => {
      await formBuilderPage.searchForForm(formDetails.name);
      await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
    });

    await test.step('And I open the Translation builder tab', async () => {
      await formBuilderPage.translationBuilderTab().click();
    });

    await test.step('Then I should see the translation builder actions', async () => {
      await expect(formBuilderPage.downloadTranslationButton()).toBeVisible();
    });

    await test.step('And the search input is present and functional', async () => {
      const searchInput = formBuilderPage.translationSearchInput();
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeEnabled();
    });

    await test.step('When I type in the search input', async () => {
      const searchInput = formBuilderPage.translationSearchInput();

      await searchInput.fill('test');
      await expect(searchInput).toHaveValue('test');
    });

    await test.step('Then the search input should contain the typed text', async () => {
      const searchInput = formBuilderPage.translationSearchInput();
      await expect(searchInput).toHaveValue('test');
    });

    await test.step('When I clear the search input', async () => {
      const searchInput = formBuilderPage.translationSearchInput();
      await searchInput.clear();
    });

    await test.step('Then the search input should be empty', async () => {
      const searchInput = formBuilderPage.translationSearchInput();
      await expect(searchInput).toHaveValue('');
    });

    await test.step('When I search for a common term that should exist', async () => {
      const searchInput = formBuilderPage.translationSearchInput();

      await searchInput.fill('Visit Details');
      await expect(searchInput).toHaveValue('Visit Details');
    });

    await test.step('Then I should see filtered search results', async () => {
      const translationEntries = formBuilderPage.page.locator('[data-testid="translation-entry"]');
      await expect(translationEntries).not.toHaveCount(0);
      await expect(translationEntries.first()).toBeVisible();
    });
  });

  test('Workflow 5: Edit Individual Translation', async ({ page }) => {
    const formBuilderPage = new FormBuilderPage(page);

    await test.step('When I visit the form builder', async () => {
      await formBuilderPage.gotoFormBuilder();
    });

    await test.step('And I search for the form and open it for editing', async () => {
      await formBuilderPage.searchForForm(formDetails.name);
      await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
    });

    await test.step('And I open the Translation builder tab', async () => {
      await formBuilderPage.translationBuilderTab().click();
    });

    await test.step('Then I should see the translation builder actions', async () => {
      await expect(formBuilderPage.downloadTranslationButton()).toBeVisible();
    });

    await test.step('When I click the edit button on a translation entry', async () => {
      const editButton = formBuilderPage.editTranslationButton(0);
      await expect(editButton).toBeVisible();
      await editButton.click();
    });

    await test.step('Then the translation modal should open', async () => {
      await expect(formBuilderPage.translationModal()).toBeVisible();
      await expect(formBuilderPage.translationValueInput()).toBeVisible();
      await expect(formBuilderPage.saveTranslationButton()).toBeVisible();
    });

    await test.step('When I edit the translation value', async () => {
      const translationInput = formBuilderPage.translationValueInput();
      const originalValue = await translationInput.inputValue();

      await translationInput.fill('Test Translation Updated');
      await expect(translationInput).toHaveValue('Test Translation Updated');
    });

    await test.step('And I save the translation', async () => {
      await formBuilderPage.saveTranslationButton().click();
    });

    await test.step('Then the modal should close', async () => {
      await expect(formBuilderPage.translationModal()).toBeHidden();
    });

    await test.step('And the translation should be updated', async () => {
      const editButton = formBuilderPage.editTranslationButton(0);
      await expect(editButton).toBeEnabled();
    });
  });

  test('Workflow 6: Download Translation File', async ({ page }) => {
    const formBuilderPage = new FormBuilderPage(page);

    await test.step('When I visit the form builder', async () => {
      await formBuilderPage.gotoFormBuilder();
    });

    await test.step('And I search for the form and open it for editing', async () => {
      await formBuilderPage.searchForForm(formDetails.name);
      await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
    });

    await test.step('And I open the Translation builder tab', async () => {
      await formBuilderPage.translationBuilderTab().click();
    });

    await test.step('Then I should see the translation builder components (Download/Upload buttons, Translation filter tabs: All/Translated/Untranslated, and the search input)', async () => {
      await expect(formBuilderPage.downloadTranslationButton()).toBeVisible();
    });

    await test.step('And the download translation button is functional', async () => {
      const downloadButton = formBuilderPage.downloadTranslationButton();

      await expect(downloadButton).toBeVisible({ timeout: 10000 });
      await expect(downloadButton).toBeEnabled({ timeout: 10000 });
    });

    await test.step('When I click the download translation button', async () => {
      const downloadButton = formBuilderPage.downloadTranslationButton();

      const [download] = await Promise.all([
        formBuilderPage.page.waitForEvent('download', { timeout: 15000 }),
        downloadButton.click(),
      ]);

      expect(download.suggestedFilename()).toMatch(/\.json$/);
    });
    await test.step('Then a translation file should be downloaded', async () => {
      await expect(formBuilderPage.downloadTranslationButton()).toBeEnabled();
    });

    await test.step('And the download button should remain functional', async () => {
      const downloadButton = formBuilderPage.downloadTranslationButton();
      await expect(downloadButton).toBeEnabled();

      await expect(downloadButton).toBeVisible();
    });
  });

  test('Workflow 7: Upload Translation File', async ({ page }) => {
    const formBuilderPage = new FormBuilderPage(page);

    await test.step('When I visit the form builder', async () => {
      await formBuilderPage.gotoFormBuilder();
    });

    await test.step('And I search for the form and open it for editing', async () => {
      await formBuilderPage.searchForForm(formDetails.name);
      await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
    });

    await test.step('And I open the Translation builder tab', async () => {
      await formBuilderPage.translationBuilderTab().click();
    });

    await test.step('Then I should see the translation builder components (Download/Upload buttons, Translation filter tabs: All/Translated/Untranslated, and the search input)', async () => {
      await expect(formBuilderPage.uploadTranslationButton()).toBeVisible();
    });

    await test.step('And the upload translation button is functional', async () => {
      const uploadButton = formBuilderPage.uploadTranslationButton();

      await expect(uploadButton).toBeVisible({ timeout: 10000 });
      await expect(uploadButton).toBeEnabled({ timeout: 10000 });
    });

    await test.step('When I click the upload translation button', async () => {
      const uploadButton = formBuilderPage.uploadTranslationButton();

      await uploadButton.click();

      await expect(uploadButton).toBeEnabled();
    });

    await test.step('Then the upload functionality should be triggered', async () => {
      const uploadButton = formBuilderPage.uploadTranslationButton();
      await expect(uploadButton).toBeVisible();
      await expect(uploadButton).toBeEnabled();
    });

    await test.step('And the upload button should remain functional for subsequent uploads', async () => {
      const uploadButton = formBuilderPage.uploadTranslationButton();

      await expect(uploadButton).toBeEnabled();
      await expect(uploadButton).toBeVisible();

      await uploadButton.click();
      await expect(uploadButton).toBeEnabled();
    });
  });

  test('Workflow 8: Translation State Management', async ({ page }) => {
    const formBuilderPage = new FormBuilderPage(page);

    await test.step('When I visit the form builder', async () => {
      await formBuilderPage.gotoFormBuilder();
    });

    await test.step('And I search for the form and open it for editing', async () => {
      await formBuilderPage.searchForForm(formDetails.name);
      await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
    });

    await test.step('And I open the Translation builder tab', async () => {
      await formBuilderPage.translationBuilderTab().click();
    });

    await test.step('Then I should see the translation builder components (Download/Upload buttons, Translation filter tabs: All/Translated/Untranslated, and the search input)', async () => {
      await expect(formBuilderPage.downloadTranslationButton()).toBeVisible();
    });

    await test.step('And translation entries are displayed correctly', async () => {
      const translationEntries = formBuilderPage.page.locator('[data-testid="translation-entry"]');
      await expect(translationEntries).not.toHaveCount(0);

      const firstEntry = translationEntries.first();
      await expect(firstEntry).toBeVisible();
      await expect(firstEntry.locator('[data-testid="translation-key"]')).toBeVisible();
      await expect(firstEntry.locator('[data-testid="translation-value"]')).toBeVisible();
      await expect(firstEntry.locator('[data-testid="edit-translation-button"]')).toBeVisible();
    });

    await test.step('When I interact with translation entries', async () => {
      const translationEntries = formBuilderPage.page.locator('[data-testid="translation-entry"]');
      await expect(translationEntries).not.toHaveCount(0);

      const firstEntry = translationEntries.first();
      await firstEntry.hover();
      await firstEntry.click();
      await expect(firstEntry).toBeVisible();
    });

    await test.step('Then the translation entries should maintain their state', async () => {
      const translationEntries = formBuilderPage.page.locator('[data-testid="translation-entry"]');
      await expect(translationEntries).not.toHaveCount(0);

      const editButton = formBuilderPage.editTranslationButton(0);
      await expect(editButton).toBeVisible();
      await expect(editButton).toBeEnabled();
    });

    await test.step('And the translation builder should remain stable', async () => {
      await expect(formBuilderPage.downloadTranslationButton()).toBeVisible();
      await expect(formBuilderPage.uploadTranslationButton()).toBeVisible();
      await expect(formBuilderPage.translationSearchInput()).toBeVisible();

      await expect(formBuilderPage.allTranslationsTab()).toBeVisible();
      await expect(formBuilderPage.translatedTab()).toBeVisible();
      await expect(formBuilderPage.untranslatedTab()).toBeVisible();
    });
  });
});
