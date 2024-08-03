/* eslint-disable playwright/no-force-option */
/* eslint-disable playwright/no-wait-for-timeout */
import { test } from '../core';
import { expect } from '@playwright/test';
import { FormBuilderPage } from '../pages';

test('check the toggle functionality', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);
  const currentDate = new Date();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const day = currentDate.getDate();

  await test.step('When I visit the form builder', async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step('And I enable the validation rule builder feature in implementor tools', async () => {
    await formBuilderPage.formBuilderSetupForRuleBuilder();
  });

  await test.step('And I navigate to the interactive builder', async () => {
    await formBuilderPage.page.getByRole('tab', { name: /Interactive Builder/i }).click();
  });

  await test.step('And I expand the `Demographics` section', async () => {
    await formBuilderPage.page.getByRole('button', { name: /Demographics/i }).click();
  });

  await test.step('And I make the `name` field as require', async () => {
    await formBuilderPage.page
      .getByRole('button', { name: /Add conditional logic/i })
      .first()
      .click();
    await formBuilderPage.page
      .locator('div')
      .filter({ hasText: /^Required$/ })
      .locator('div')
      .click();
  });

  await test.step('And I navigate to form preview tab', async () => {
    await formBuilderPage.page.getByRole('tab', { name: /Preview/i }).click();
    await formBuilderPage.page.waitForTimeout(4000); // Adds delay to render the form
  });

  await test.step('When I skip the `name` field, the warning message appears', async () => {
    await formBuilderPage.page.locator('input[name="name"]').click();
    await formBuilderPage.page.getByLabel('Preview', { exact: true }).getByText('Name').click();
    await expect(formBuilderPage.page.getByText(/Field is mandatory/i)).toBeVisible();
  });

  await test.step('And I enter the `OpenMRS` in `name` field, Then the warning message is disappears', async () => {
    await formBuilderPage.page.locator('input[name="name"]').click();
    await formBuilderPage.page.locator('input[name="name"]').fill('OpenMRS');
    await formBuilderPage.page
      .getByLabel(/Preview/i, { exact: true })
      .getByText('Name')
      .click();
    await expect(formBuilderPage.page.getByText(/Field is mandatory/i)).toBeHidden();
  });

  await test.step('And I disallow future dates for `Date of birth` field', async () => {
    await formBuilderPage.page.getByRole('tab', { name: /Interactive Builder/i }).click();
    await formBuilderPage.page
      .getByRole('button', { name: /Add conditional logic/i })
      .nth(1)
      .click();
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

  await test.step('And I navigate to form preview tab', async () => {
    await formBuilderPage.page.waitForTimeout(4000); // Adds delay to render the form
    await formBuilderPage.page.getByRole('tab', { name: /Preview/i }).click();
  });

  await test.step('When I select a future date, the warning message appears', async () => {
    await formBuilderPage.page.getByRole('button', { name: /Calendar Date of Birth/i }).click();
    await formBuilderPage.page.getByLabel('Increase').click();
    await formBuilderPage.page.getByLabel(`${monthName} ${day},`).click({ force: true });
    await expect(formBuilderPage.page.getByText(/Future dates not allowed/i)).toBeVisible();
  });

  await test.step('When I select a past date, the warning message disappears', async () => {
    await formBuilderPage.page.getByRole('button', { name: /Calendar Date of Birth/i }).click();
    await formBuilderPage.page.getByLabel(/Decrease/i).click();
    await formBuilderPage.page.getByLabel(`${monthName} ${day},`).click();
    await expect(formBuilderPage.page.getByText(/Future dates not allowed/i)).toBeHidden();
  });

  await test.step('And I disallow decimal values for `age` field', async () => {
    await formBuilderPage.page.getByRole('tab', { name: /Interactive Builder/i }).click();
    await formBuilderPage.page
      .getByRole('button', { name: /Add conditional logic/i })
      .nth(2)
      .click();
    await formBuilderPage.page
      .locator('div')
      .filter({ hasText: /^Disallow Decimal Value$/ })
      .locator('div')
      .click();
  });

  await test.step('And I navigate to form preview tab', async () => {
    await formBuilderPage.page.waitForTimeout(4000); // Adds delay to render the form
    await formBuilderPage.page.getByRole('tab', { name: /Preview/i }).click();
  });

  await test.step('When I enter decimal value in the `age` field, the warning message appears', async () => {
    await formBuilderPage.page.getByLabel('Age', { exact: true }).click();
    await formBuilderPage.page.getByLabel('Age', { exact: true }).fill('20.8');
    await formBuilderPage.page.getByLabel('Preview', { exact: true }).getByText('Age', { exact: true }).click();
    await expect(formBuilderPage.page.getByText(/Decimal values are not allowed for this field/i)).toBeVisible();
  });

  await test.step('Then I change the `age` value as `20`, the warning message disappears', async () => {
    await formBuilderPage.page.getByLabel('Age', { exact: true }).click();
    await formBuilderPage.page.getByLabel('Age', { exact: true }).fill('20');
    await formBuilderPage.page.getByLabel('Preview', { exact: true }).getByText('Age', { exact: true }).click();
    await expect(formBuilderPage.page.getByText(/Decimal values are not allowed for this field/i)).toBeHidden();
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
      formBuilderPage.page.getByLabel('Preview', { exact: true }).getByText(/What symptoms did you experience/i),
    ).toBeVisible();
  });

  await test.step('And I select the value as `yes` for the `are you affected by COVID` field', async () => {
    await formBuilderPage.page.getByRole('combobox', { name: /Are you affected by COVID ?/i }).click();
    await formBuilderPage.page.getByText('Yes').click();
  });

  await test.step('And I see the `What symptoms did you experience` field disappears', async () => {
    await expect(formBuilderPage.page.getByLabel(/What symptoms did you experience/i)).toBeHidden();
  });

  await test.step('And If I change the value of `are you affected by COVID` field to `no`', async () => {
    await formBuilderPage.page.getByRole('combobox', { name: /Are you affected by COVID ?/i }).click();
    await formBuilderPage.page.getByText('No', { exact: true }).click();
  });

  await test.step('Then I see the `What symptoms did you experience` field appears again', async () => {
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

test('create calculation logic for `Expected delivery date`', async ({ page }) => {
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

  await test.step('And I expand the `Delivery Dates` section, and create conditional logic', async () => {
    await formBuilderPage.page.getByRole('button', { name: /Delivery Date/i }).click();
    await formBuilderPage.page
      .getByRole('button', { name: /Add conditional logic/i })
      .nth(1)
      .click();
  });

  await test.step('And I create calculation logic to calculate `Expected delivery date`', async () => {
    await formBuilderPage.page
      .getByLabel('Target field')
      .getByRole('combobox', { name: /Select a field/i })
      .click();
    await formBuilderPage.page
      .getByLabel('Target field')
      .getByText(/Last Mensuration Period/i)
      .click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select condition/i }).click();
    await formBuilderPage.page.getByText('Not Empty').click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select an action/i }).click();
    await formBuilderPage.page.getByText('Calculate', { exact: true }).click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select Calculate Expression/i }).click();
    await formBuilderPage.page
      .getByRole('option', { name: /Expected Delivery Date/i })
      .locator('div')
      .click();
  });
  await test.step('And I navigate tot form preview tab', async () => {
    await formBuilderPage.page.waitForTimeout(4000); // Adds delay to render the form
    await formBuilderPage.page.getByRole('tab', { name: /Preview/i }).click();
  });

  await test.step('When I select a date in `LMP` field, Then I see the `EDD` has been calculated', async () => {
    await formBuilderPage.page.getByRole('button', { name: /Calendar Last Mensuration/i }).click();
    await formBuilderPage.page.getByLabel('Thursday, August 1,').click();
    await expect(formBuilderPage.page.getByText('5/8/2025')).toBeVisible();
  });
});

test('calculate viral load status', async ({ page }) => {
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

  await test.step('And I expand the `Test Viral Load Status` section', async () => {
    await formBuilderPage.page.getByRole('button', { name: /Test Viral Load Status/i }).click();
    await formBuilderPage.page
      .getByRole('button', { name: /Add conditional logic/i })
      .nth(1)
      .click();
  });

  await test.step('And I create a calculation logic for `Viral Load Status`', async () => {
    await formBuilderPage.page
      .getByLabel('Target field')
      .getByRole('combobox', { name: /Select a field/i })
      .click();
    await formBuilderPage.page
      .getByLabel('Target field')
      .getByText(/Viral Load Count/i)
      .click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select condition/i }).click();
    await formBuilderPage.page.getByText('Not Empty').click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select an action/i }).click();
    await formBuilderPage.page.getByText('Calculate', { exact: true }).click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select Calculate Expression/i }).click();
    await formBuilderPage.page
      .getByRole('option', { name: /Viral Load Status/i })
      .locator('div')
      .click();
  });

  await test.step('And I navigate to the form preview tab', async () => {
    await formBuilderPage.page.waitForTimeout(4000); // Adds delay to render the form
    await formBuilderPage.page.getByRole('tab', { name: /Preview/i }).click();
  });

  await test.step('And I enter value for the `Viral Load Count`', async () => {
    await formBuilderPage.page.getByLabel('Viral Load Count').fill('35');
    await page.getByLabel('Preview', { exact: true }).getByText('Viral Load Status', { exact: true }).click();
  });

  await test.step('And I see the `Viral load satus` value has `Suppressed` as value', async () => {
    await expect(
      formBuilderPage.page
        .getByRole('group', { name: /Viral Load Status/i })
        .locator('span')
        .nth(1),
    ).toBeChecked();
  });

  await test.step('When I change the value of `Viral load count`, Then `Viral load status` value changed to `Unsuppressed`', async () => {
    await formBuilderPage.page.getByLabel(/Viral Load Count/i).fill('100');
    await page.getByLabel('Preview', { exact: true }).getByText('Viral Load Status', { exact: true }).click();
    await expect(
      formBuilderPage.page
        .getByRole('group', { name: /Viral Load Status/i })
        .locator('span')
        .nth(3),
    ).toBeChecked();
  });
});

test('create a validation logic for date field', async ({ page }) => {
  const currentDate = new Date();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const day = currentDate.getDate();
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

  await test.step('And I expand the `Schedule an appointment` section', async () => {
    await formBuilderPage.page.getByRole('button', { name: /Schedule an appointment/i }).click();
    await formBuilderPage.page.getByRole('button', { name: /Add conditional logic/i }).click();
  });

  await test.step('And I create a `failsWhenExpression` logic', async () => {
    await formBuilderPage.page
      .getByLabel('Target field')
      .getByRole('combobox', { name: /Select a field/i })
      .click();
    await formBuilderPage.page
      .getByLabel('Target field')
      .getByText(/Appointment Date/i)
      .click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select condition/i }).click();
    await formBuilderPage.page.getByText(/Is Date Before/i).click();
    await formBuilderPage.page.getByPlaceholder('dd/mm/yyyy').click();
    await formBuilderPage.page.getByPlaceholder('dd/mm/yyyy').fill('01/08/2024');
    await formBuilderPage.page.getByPlaceholder('dd/mm/yyyy').press('Tab');
    await formBuilderPage.page.getByRole('combobox', { name: /Select an action/i }).click();
    await formBuilderPage.page.getByText(/Fail/i).click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select a field/i }).click();
    await formBuilderPage.page
      .getByRole('option', { name: /Appointment Date/i })
      .locator('div')
      .click();
    await formBuilderPage.page
      .getByPlaceholder('Enter error message to be')
      .fill('Cannot schedule an appointment in the past. Please select a future date.');
  });

  await test.step('And I navigate to form preview tab', async () => {
    await formBuilderPage.page.getByRole('tab', { name: /Preview/i }).click();
    await formBuilderPage.page.waitForTimeout(4000);
  });

  await test.step('And I select a past date in `Appointment Date` field', async () => {
    await formBuilderPage.page.locator('#appointment').getByText('mm/dd/yyyy').click();
    await formBuilderPage.page.getByLabel('Decrease').click();
    await formBuilderPage.page.getByRole('gridcell', { name: `${monthName} ${day},` }).click();
  });

  await test.step('And I see a warning message', async () => {
    await expect(
      formBuilderPage.page
        .getByLabel('Preview', { exact: true })
        .getByText('Cannot schedule an appointment in the past. Please select a future date.'),
    ).toBeVisible();
  });

  await test.step('When I change the `Appointment Date` to future, Then I see the warning message is vanished', async () => {
    await formBuilderPage.page.getByRole('button', { name: 'Calendar Appointment Date' }).click();
    await formBuilderPage.page.getByLabel('Increase').click();
    await formBuilderPage.page.getByRole('gridcell', { name: `${monthName} ${day},` }).click();
    await expect(
      formBuilderPage.page
        .getByLabel('Preview', { exact: true })
        .getByText('Cannot schedule an appointment in the past. Please select a future date.'),
    ).toBeHidden();
  });
});
