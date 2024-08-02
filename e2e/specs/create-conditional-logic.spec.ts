/* eslint-disable playwright/no-force-option */
/* eslint-disable playwright/no-wait-for-timeout */
import { test } from '../core';
import { expect } from '@playwright/test';
import { FormBuilderPage } from '../pages';

test('check the toggle functionality', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I visit the form builder', async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step('And I enable the validation rule builder feature in implementor tools', async () => {
    await formBuilderPage.formBuilderSetupForRuleBuilder();
  });

  await test.step('And I navigate to the interactive builder', async () => {
    await formBuilderPage.page.getByRole('tab', { name: 'Interactive Builder' }).click();
  });

  await test.step('And I expand the `Demographics` section', async () => {
    await formBuilderPage.page.getByRole('button', { name: 'Demographics' }).click();
  });

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

test('create hiding logic', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I visit the form builder', async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step('And I enable the validation rule builder feature in implementor tools', async () => {
    await formBuilderPage.formBuilderSetupForRuleBuilder();
  });

  await test.step('And I navigate to the interactive builder', async () => {
    await formBuilderPage.page.getByRole('tab', { name: /Interactive Builder/i }).click();
  });

  await test.step('And I expand the `Covid Experience` section', async () => {
    await formBuilderPage.page.getByRole('button', { name: /Covid Experience/i }).click();
  });

  await test.step('And I create conditional logic of `hideWhenExpression`', async () => {
    await formBuilderPage.page
      .getByRole('button', { name: /Add conditional logic/i })
      .first()
      .click();
  });

  await test.step('And I create the hiding logic', async () => {
    await formBuilderPage.page
      .getByLabel('Target field')
      .getByRole('combobox', { name: /Select a field/i })
      .click();
    await formBuilderPage.page
      .getByLabel('Target field')
      .getByText(/Are you affected by COVID ?/i)
      .click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select condition/i }).click();
    await formBuilderPage.page.getByText('Equals', { exact: true }).click();
    await formBuilderPage.page.getByPlaceholder(/Target value/i).click();
    await formBuilderPage.page.getByRole('option', { name: /Yes/i }).click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select an action/i }).click();
    await formBuilderPage.page.getByText('Hide', { exact: true }).click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select a field/i }).click();
    await formBuilderPage.page
      .getByRole('option', { name: /What symptoms did you/i })
      .locator('div')
      .click();
  });

  await test.step('And I visit form preview', async () => {
    await formBuilderPage.page.waitForTimeout(4000); // Adds delay to render the form
    await formBuilderPage.page.getByRole('tab', { name: /Preview/i }).click();
  });

  await test.step('And I see the `What symptoms did you experience` field presents in the form', async () => {
    await expect(
      formBuilderPage.page.getByLabel('Preview', { exact: true }).getByText(/What symptoms did you/i),
    ).toBeVisible();
  });

  await test.step('And I select the value as `yes` for the `are you affected by COVID` field', async () => {
    await formBuilderPage.page.getByRole('combobox', { name: /Are you affected by COVID ?/i }).click();
    await formBuilderPage.page.getByText('Yes').click();
  });

  await test.step('And I see the `What symptoms did you experience` field is vanished successfully', async () => {
    await expect(formBuilderPage.page.getByLabel(/What symptoms did you/i)).toBeHidden();
  });

  await test.step('And If I change the value of `are you affected by COVID` field to `no`', async () => {
    await formBuilderPage.page.getByRole('combobox', { name: /Are you affected by COVID ?/i }).click();
    await formBuilderPage.page.getByText('No', { exact: true }).click();
  });

  await test.step('Then I see the `What symptoms did you experience` is visible again', async () => {
    await expect(formBuilderPage.page.getByLabel(/What symptoms did you/i)).toBeVisible();
  });
});

test('create a calculation logic', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I visit the form builder', async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step('And I enable the validation rule builder feature in implementor tools', async () => {
    await formBuilderPage.formBuilderSetupForRuleBuilder();
  });

  await test.step('And I navigate to the interactive builder', async () => {
    await formBuilderPage.page.getByRole('tab', { name: /Interactive Builder/i }).click();
  });

  await test.step('And I expand the `Vitals and Biomterics` section, and create conditional logic', async () => {
    await formBuilderPage.page.getByRole('button', { name: /Vitals and Biomterics/i }).click();
    await formBuilderPage.page.getByRole('button', { name: 'Add conditional logic' }).nth(2).click();
  });

  await test.step('And I create the calculcation logic for the `BSA` field', async () => {
    await formBuilderPage.page
      .getByLabel('Target field')
      .getByRole('combobox', { name: /Select a field/i })
      .click();
    await formBuilderPage.page
      .getByLabel('Target field')
      .getByText(/Height/i)
      .click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select condition/i }).click();
    await formBuilderPage.page.getByText(/Not Empty/i).click();
    await formBuilderPage.page.getByTestId('condition-options-menu').click();
    await formBuilderPage.page.getByLabel('Add condition', { exact: true }).click();
    await formBuilderPage.page
      .getByLabel('Target field')
      .getByRole('combobox', { name: /Select a field/i })
      .click();
    await formBuilderPage.page
      .getByRole('option', { name: /Weight/i })
      .locator('div')
      .click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select condition/i }).click();
    await formBuilderPage.page
      .getByRole('option', { name: /Not Empty/i })
      .locator('div')
      .click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select an action/i }).click();
    await formBuilderPage.page.getByText('Calculate', { exact: true }).click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select Calculate Expression/i }).click();
    await formBuilderPage.page.getByRole('option', { name: /BSA/i }).locator('div').click();
  });

  await test.step('And I navigate to the form preview tab', async () => {
    await formBuilderPage.page.waitForTimeout(4000); // Adds delay to render the form
    await formBuilderPage.page.getByRole('tab', { name: 'Preview' }).click();
  });

  await test.step('And I see enter value for `Height` and `Weight` field, then `BSA` calculated automiatically', async () => {
    await formBuilderPage.page.getByLabel(/Height/i).fill('40');
    await formBuilderPage.page.getByLabel(/Weight/i).fill('40');
    await formBuilderPage.page.getByLabel('Preview', { exact: true }).getByText(/BSA/i).click();
    await expect(formBuilderPage.page.getByLabel(/BSA/i)).toHaveValue('0.67');
  });
});
