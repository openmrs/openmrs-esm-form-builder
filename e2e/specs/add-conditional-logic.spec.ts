/* eslint-disable playwright/no-force-option */
/* eslint-disable playwright/no-wait-for-timeout */
import { test } from '../core';
import { expect } from '@playwright/test';
import { FormBuilderPage } from '../pages';
import customSchema from '../support/validation-custom-schema.json';

test('create a conditional logic', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I visit the form builder', async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step('And I click the `Create New Form` button', async () => {
    await formBuilderPage.createNewFormButton().click();
  });

  await test.step('And I Enable the validation rule builder feature', async () => {
    await formBuilderPage.page.getByTestId('globalImplementerToolsButton').getByRole('button').click();
    await formBuilderPage.page.getByRole('tab', { name: 'Feature flags' }).click();
    await formBuilderPage.page.locator('.cds--toggle__switch').click();
    await formBuilderPage.page.getByRole('button', { name: 'Close' }).click();
  });

  await test.step('Then I paste in a custom JSON schema into the schema editor and click the `Render Changes` button', async () => {
    await formBuilderPage.schemaInput().fill(JSON.stringify(customSchema, null, 2));
    await formBuilderPage.renderChangesButton().click();
    await formBuilderPage.page.getByRole('button', { name: 'Render changes' }).click();
    await formBuilderPage.page.getByRole('tab', { name: 'Interactive Builder' }).click();
  });

  await formBuilderPage.page.getByRole('button', { name: 'Demographics' }).click();

  await test.step('And I make the `name` field as require', async () => {
    await formBuilderPage.page.getByRole('button', { name: 'Add conditional logic' }).first().click();
    await formBuilderPage.page
      .locator('div')
      .filter({ hasText: /^Required$/ })
      .locator('div')
      .click();
  });

  await test.step('And I check the validation in preview', async () => {
    await formBuilderPage.page.getByRole('tab', { name: 'Preview' }).click();
    await formBuilderPage.page.waitForTimeout(4000); // Adds delay to render the form
    await formBuilderPage.page.locator('input[name="name"]').click();
    await formBuilderPage.page.getByLabel('Preview', { exact: true }).getByText('Name').click();
    await expect(formBuilderPage.page.getByText('Field is mandatory')).toBeVisible();
    await formBuilderPage.page.locator('input[name="name"]').click();
    await formBuilderPage.page.locator('input[name="name"]').fill('OpenMRS');
    await formBuilderPage.page.getByLabel('Preview', { exact: true }).getByText('Name').click();
    await expect(formBuilderPage.page.getByText('Field is mandatory')).toBeHidden();
  });

  await test.step('And I disallow future dates for `Date of birth` field', async () => {
    await formBuilderPage.page.getByRole('tab', { name: 'Interactive Builder' }).click();
    await formBuilderPage.page.getByRole('button', { name: 'Add conditional logic' }).nth(1).click();
    await formBuilderPage.page
      .locator('div')
      .filter({ hasText: /^Allow Future Dates$/ })
      .locator('div')
      .click({ force: true });
    await formBuilderPage.page
      .locator('div')
      .filter({ hasText: /^Allow Future Dates$/ })
      .locator('div')
      .click({ force: true });
  });

  await test.step('And I see the `date of birth` field is not accepting any future dates', async () => {
    await formBuilderPage.page.waitForTimeout(4000); // Adds delay to render the form
    await formBuilderPage.page.getByRole('tab', { name: 'Preview' }).click();
    await formBuilderPage.page.getByRole('button', { name: 'Calendar Date of Birth' }).click();
    await formBuilderPage.page.getByLabel('Increase').click();
    await formBuilderPage.page.getByLabel('Saturday, August 2,').click({ force: true });
    // await formBuilderPage.page.click('body', { position: { x: 0, y: 0 } });
    await expect(formBuilderPage.page.getByText('Future dates not allowed')).toBeVisible();
    await formBuilderPage.page.getByRole('button', { name: 'Calendar Date of Birth' }).click();
    await formBuilderPage.page.getByLabel('Decrease').click();
    await formBuilderPage.page.getByLabel('Thursday, August 1,').click();
    await expect(formBuilderPage.page.getByText('Future dates not allowed')).toBeHidden();
  });

  await test.step('And I disallow decimal values for `age` field', async () => {
    await formBuilderPage.page.getByRole('tab', { name: 'Interactive Builder' }).click();
    await formBuilderPage.page.getByRole('button', { name: 'Add conditional logic' }).nth(2).click();
    await formBuilderPage.page
      .locator('div')
      .filter({ hasText: /^Disallow Decimal Value$/ })
      .locator('div')
      .click();
  });

  await test.step('And I see the `age` field is not accepting any decimal value', async () => {
    await formBuilderPage.page.waitForTimeout(4000); // Adds delay to render the form
    await formBuilderPage.page.getByRole('tab', { name: 'Preview' }).click();
    await formBuilderPage.page.getByLabel('Age', { exact: true }).click();
    await formBuilderPage.page.getByLabel('Age', { exact: true }).fill('20.8');
    await formBuilderPage.page.getByLabel('Preview', { exact: true }).getByText('Age', { exact: true }).click();
    await expect(formBuilderPage.page.getByText('Decimal values are not allowed for this field')).toBeVisible();
    await formBuilderPage.page.getByLabel('Age', { exact: true }).click();
    await formBuilderPage.page.getByLabel('Age', { exact: true }).fill('20');
    await formBuilderPage.page.getByLabel('Preview', { exact: true }).getByText('Age', { exact: true }).click();
    await expect(formBuilderPage.page.getByText('Decimal values are not allowed for this field')).toBeHidden();
  });
});
