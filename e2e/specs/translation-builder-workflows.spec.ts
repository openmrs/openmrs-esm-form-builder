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
});
