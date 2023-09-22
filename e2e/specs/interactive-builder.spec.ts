import { test, expect } from '@playwright/test';
import { FormBuilderPage } from '../pages';

test('Create a schema using the interactive builder', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I visit the form builder', async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step('And click the `Create New Form` button', async () => {
    await formBuilderPage.createNewFormButton().click();
  });

  await test.step('Then I create a new form using the interactive builder', async () => {
    await formBuilderPage.buildFormInteractively();
  });

  await test.step('Then I should see the new schema in the schema editor and a success notification', async () => {
    await expect(page.getByText(/new question created/i)).toBeVisible();
    await page
      .locator('#schemaEditor div')
      .filter({
        hasText: '{ "name": "Covid-19 Screening", "pages": [ { "label": "Screening", "sections": [',
      })
      .nth(1)
      .click();
  });
});
