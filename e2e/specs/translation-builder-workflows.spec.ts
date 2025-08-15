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

    await test.step('Navigate to form builder', async () => {
      await formBuilderPage.gotoFormBuilder();
    });

    await test.step('Search and open the test form', async () => {
      await formBuilderPage.searchForForm(formDetails.name);
      await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
    });

    await test.step('Open translation builder tab', async () => {
      await formBuilderPage.translationBuilderTab().click();
    });

    await test.step('Verify translation builder components are displayed', async () => {
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

    await test.step('Navigate to form builder and open translation builder', async () => {
      await formBuilderPage.gotoFormBuilder();
      await formBuilderPage.searchForForm(formDetails.name);
      await formBuilderPage.page.getByRole('row', { name: formDetails.name }).getByLabel('Edit Schema').first().click();
      await formBuilderPage.translationBuilderTab().click();
      await expect(formBuilderPage.downloadTranslationButton()).toBeVisible();
    });

    await test.step('Verify language dropdown is present and functional', async () => {
      const languageDropdown = formBuilderPage.languageDropdown();
      await expect(languageDropdown).toBeVisible();
      await expect(languageDropdown).toBeEnabled();
    });

    await test.step('Open language dropdown and verify available languages', async () => {
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
});
