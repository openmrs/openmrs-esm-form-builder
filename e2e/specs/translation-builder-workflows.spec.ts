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

  test('Manage translations: switch languages, filter, and search', async ({ page }) => {
    const formBuilderPage = new FormBuilderPage(page);

    await test.step('Open a form in the translation builder', async () => {
      await formBuilderPage.gotoFormBuilder();
      await formBuilderPage.searchForForm(formDetails.name);
      await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
      await formBuilderPage.translationBuilderTab().click();
    });

    await test.step('Switch between languages', async () => {
      await formBuilderPage.languageDropdown().click();
      const dropdownMenu = formBuilderPage.translationBuilderPanel().locator('.cds--list-box__menu');
      await expect(dropdownMenu).toBeVisible();
      await expect(dropdownMenu.getByRole('option', { name: 'English (en)' })).toBeVisible();
    });

    await test.step('Filter translations using tabs', async () => {
      await formBuilderPage.allTranslationsTab().click();
      await expect(formBuilderPage.allTranslationsTab()).toHaveAttribute('aria-selected', 'true');

      await formBuilderPage.translatedTab().click();
      await expect(page.locator('[data-status="translated"]')).toHaveCount(0);

      await formBuilderPage.untranslatedTab().click();
      await expect(formBuilderPage.untranslatedTab()).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('[data-status="untranslated"]').first()).toBeVisible();
    });

    await test.step('Search for a translation string', async () => {
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

    await test.step('When I open a form in the translation builder', async () => {
      await formBuilderPage.gotoFormBuilder();
      await formBuilderPage.searchForForm(formDetails.name);
      await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
      await formBuilderPage.translationBuilderTab().click();
    });

    await test.step('Edit a translation string and save it', async () => {
      await formBuilderPage.editTranslationButton(0).click();
      const translationInput = formBuilderPage.translationValueInput();
      await translationInput.fill('Test Translation Updated');
      await formBuilderPage.saveTranslationButton().click();
      await expect(formBuilderPage.translationModal()).toBeHidden();
      await expect(formBuilderPage.editTranslationButton(0)).toBeEnabled();
    });
  });

  test.afterEach(async ({ api }) => {
    if (formUuid) {
      await deleteForm(api, formUuid);
    }
  });
});
