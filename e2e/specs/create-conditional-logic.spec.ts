/* eslint-disable playwright/no-force-option */
/* eslint-disable playwright/no-wait-for-timeout */
import { test } from '../core';
import { expect } from '@playwright/test';
import { FormBuilderPage } from '../pages';

test('check the toggle functionality', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + 1);
  const day = newDate.getDate().toString().padStart(2, '0');
  const month = (newDate.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11, so add 1
  const year = newDate.getFullYear();

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

  await test.step('And I make the `name` field as required', async () => {
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
    await formBuilderPage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await formBuilderPage.page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(formBuilderPage.page.getByText(/Field is mandatory/i)).toBeVisible();
  });

  // Error messages do not go away when the input is dirty again
  // await test.step('And I enter the `OpenMRS` in `name` field, Then the warning message is disappears', async () => {
  //   await formBuilderPage.page.locator('input[name="name"]').click();
  //   await formBuilderPage.page.locator('input[name="name"]').fill('OpenMRS');
  //   await formBuilderPage.page
  //     .getByLabel(/Preview/i, { exact: true })
  //     .getByText('Name')
  //     .click();
  //   await expect(formBuilderPage.page.getByText(/Field is mandatory/i)).toBeHidden();
  // });

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
    await formBuilderPage.dateInput('Date of birth').click();
    await formBuilderPage.dateDayInput('Date of birth').fill(day.toString());
    await formBuilderPage.dateMonthInput('Date of birth').fill(month.toString());
    await formBuilderPage.dateYearInput('Date of birth').fill(year.toString());
    await formBuilderPage.page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(formBuilderPage.page.getByText(/future dates not allowed/i)).toBeVisible();
  });

  // Error messages do not go away when the input is dirty again
  // test.skip('When I select a past date, the warning message disappears', async () => {
  //   const newDate = new Date();
  //   newDate.setDate(newDate.getDate() - 1);
  //   const day = newDate.getDate().toString().padStart(2, '0');
  //   const month = (newDate.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11, so add 1
  //   const year = newDate.getFullYear();
  //   await formBuilderPage.page.getByRole('button', { name: /Calendar Date of Birth/i }).click();
  //   await formBuilderPage.dateInput('Date of birth').click();
  //   await formBuilderPage.dateDayInput('Date of birth').fill(day.toString());
  //   await formBuilderPage.dateMonthInput('Date of birth').fill(month.toString());
  //   await formBuilderPage.dateYearInput('Date of birth').fill(year.toString());
  //   await expect(formBuilderPage.page.getByText(/Future dates not allowed/i)).toBeHidden();
  // });

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
    await formBuilderPage.page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(formBuilderPage.page.getByText(/Decimal values are not allowed for this field/i)).toBeVisible();
  });

  // Error messages do not go away when the input is dirty again
  // test.skip('Then I change the `age` value as `20`, the warning message disappears', async () => {
  //   await formBuilderPage.page.getByLabel('Age', { exact: true }).click();
  //   await formBuilderPage.page.getByLabel('Age', { exact: true }).fill('20');
  //   await formBuilderPage.page.getByLabel('Preview', { exact: true }).getByText('Age', { exact: true }).click();
  //   await expect(formBuilderPage.page.getByText(/Decimal values are not allowed for this field/i)).toBeHidden();
  // });
});

test('create `hideWhenExpression` logic', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I visit the form builder', async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step('And I enable the validation rule builder feature in implementor tools', async () => {
    await formBuilderPage.formBuilderSetupForRuleBuilder();
  });

  await test.step('And I navigate to the interactive builder tab', async () => {
    await formBuilderPage.page.getByRole('tab', { name: /Interactive Builder/i }).click();
  });

  await test.step('And I expand the `Covid Experience` section', async () => {
    await formBuilderPage.page.getByRole('button', { name: /Covid Experience/i }).click();
  });

  await test.step('And I expand the validation rule builder for `Covid Experience` section', async () => {
    await formBuilderPage.page
      .getByRole('button', { name: /Add conditional logic/i })
      .first()
      .click();
  });

  await test.step('And I select the target field', async () => {
    await formBuilderPage.page.getByRole('combobox', { name: /target field/i }).click();
    await formBuilderPage.page.getByRole('option', { name: 'Are you affected by COVID ?' }).locator('div').click();
  });

  await test.step('And I select the condition', async () => {
    await formBuilderPage.page.getByRole('combobox', { name: /Target condition/i }).click();
    await formBuilderPage.page.getByText('Equals', { exact: true }).click();
  });

  await test.step('And I select the target value', async () => {
    await formBuilderPage.page.getByPlaceholder(/Target value/i).click();
    await formBuilderPage.page.getByRole('option', { name: /Yes/i }).click();
  });

  await test.step('And I select the action', async () => {
    await formBuilderPage.page.getByRole('combobox', { name: 'Trigger action' }).click();
    await formBuilderPage.page.getByText('Hide', { exact: true }).click();
  });

  await test.step('And I select the field to hide', async () => {
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

test.fixme('create calculation logic', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I visit the form builder', async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step('And I enable the validation rule builder feature in implementor tools', async () => {
    await formBuilderPage.formBuilderSetupForRuleBuilder();
  });

  await test.step('And I navigate to the interactive builder tab', async () => {
    await formBuilderPage.page.getByRole('tab', { name: /Interactive Builder/i }).click();
  });

  await test.step('And I expand the `Vitals and Biomterics` section, and create conditional logic', async () => {
    await formBuilderPage.page.getByRole('button', { name: /Vitals and Biomterics/i }).click();
    await formBuilderPage.page.getByRole('button', { name: 'Add conditional logic' }).nth(2).click();
  });

  await test.step('And I create the calculation logic for the `BSA` field', async () => {
    await formBuilderPage.page.getByRole('combobox', { name: /target field/i }).click();
    await formBuilderPage.page
      .getByRole('option', { name: /height/i })
      .locator('div')
      .click();
    await formBuilderPage.page.getByRole('combobox', { name: /target condition/i }).click();
    await formBuilderPage.page.getByText(/not empty/i).click();
    await formBuilderPage.page.getByTestId('condition-options-menu').click();
    await formBuilderPage.page.getByLabel('Add condition', { exact: true }).click();
    await formBuilderPage.page
      .getByText(/select a fieldOpen menu/i)
      .nth(0)
      .click();
    await formBuilderPage.page
      .getByRole('option', { name: /Weight/i })
      .locator('div')
      .click();
    await formBuilderPage.page
      .getByText(/select conditionOpen menu/i)
      .nth(0)
      .click();
    await formBuilderPage.page
      .getByRole('option', { name: /not empty/i })
      .locator('div')
      .click();
    await formBuilderPage.page.getByRole('combobox', { name: 'Trigger action' }).click();
    await formBuilderPage.page.getByText('Calculate', { exact: true }).click();
    await formBuilderPage.page.getByRole('combobox', { name: /Select Calculate Expression/i }).click();
    await formBuilderPage.page.getByRole('option', { name: /BSA/i }).locator('div').click();
  });

  await test.step('And I navigate to the form preview tab', async () => {
    await formBuilderPage.page.waitForTimeout(4000); // Adds delay to render the form
    await formBuilderPage.page.getByRole('tab', { name: 'Preview' }).click();
  });

  await test.step('And I fill value for `Height` as 40 and `Weight` as 40, then `BSA` has been calculated automatically', async () => {
    await formBuilderPage.page.getByLabel(/Height/i).fill('40');
    await formBuilderPage.page.getByLabel(/Weight/i).fill('40');
    await formBuilderPage.page.getByLabel('Preview', { exact: true }).getByText('BSA').click();
    await expect(formBuilderPage.page.getByLabel('BSA')).toHaveValue('0.67');
  });
});

test.fixme('create calculation logic for `Expected delivery date`', async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I visit the form builder', async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step('And I enable the validation rule builder feature in implementor tools', async () => {
    await formBuilderPage.formBuilderSetupForRuleBuilder();
  });

  await test.step('And I navigate to the interactive builder tab', async () => {
    await formBuilderPage.page.getByRole('tab', { name: /Interactive Builder/i }).click();
  });

  await test.step('And I expand the `Delivery Dates` section, and expand conditional logic', async () => {
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
  await test.step('And I navigate to form preview tab', async () => {
    await formBuilderPage.page.waitForTimeout(4000); // Adds delay to render the form
    await formBuilderPage.page.getByRole('tab', { name: /Preview/i }).click();
  });

  await test.step('When I select a date in `LMP` field, Then I see the `EDD` has been calculated', async () => {
    await formBuilderPage.page.getByRole('spinbutton', { name: 'month, Last Mensuration' }).fill('08');
    await formBuilderPage.page.getByRole('spinbutton', { name: 'day, Last Mensuration' }).fill('01');
    await formBuilderPage.page.getByRole('spinbutton', { name: 'year, Last Mensuration' }).fill('2024');
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

  await test.step('And I navigate to the interactive builder tab', async () => {
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
    await formBuilderPage.page.getByRole('combobox', { name: /target field/i }).click();
    await formBuilderPage.page
      .getByRole('option', { name: /viral load count/i })
      .locator('div')
      .click();
    await formBuilderPage.page.getByRole('combobox', { name: /target condition/i }).click();
    await formBuilderPage.page.getByText(/not empty/i).click();
    await formBuilderPage.page.getByRole('combobox', { name: 'Trigger action' }).click();
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

  await test.step('And I fill value for the `Viral Load Count` as `35`', async () => {
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

test('create validation logic for date field', async ({ page }) => {
  const currentDate = new Date();
  const weekDay = currentDate.toLocaleString('default', { weekday: 'long' });
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const day = currentDate.getDate();
  const formBuilderPage = new FormBuilderPage(page);

  await test.step('When I visit the form builder', async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step('And I enable the validation rule builder feature in implementor tools', async () => {
    await formBuilderPage.formBuilderSetupForRuleBuilder();
  });

  await test.step('And I navigate to the interactive builder tab', async () => {
    await formBuilderPage.page.getByRole('tab', { name: 'Interactive Builder' }).click();
  });

  await test.step('And I expand the `Schedule an appointment` section', async () => {
    await formBuilderPage.page.getByRole('button', { name: /schedule an appointment/i }).click();
    await formBuilderPage.page.getByRole('button', { name: /add conditional logic/i }).click();
  });

  await test.step('And I create a `failsWhenExpression` logic', async () => {
    await formBuilderPage.page.getByRole('combobox', { name: /target field/i }).click();
    await formBuilderPage.page
      .getByRole('option', { name: /appointment date/i })
      .locator('div')
      .click();
    await formBuilderPage.page.getByRole('combobox', { name: /target condition/i }).click();
    await formBuilderPage.page.getByRole('option', { name: /is date before/i }).click();
    await formBuilderPage.page.getByPlaceholder('dd/mm/yyyy').click();
    await formBuilderPage.page.getByPlaceholder('dd/mm/yyyy').fill('01/08/2024');
    await formBuilderPage.page.getByPlaceholder('dd/mm/yyyy').press('Tab');
    await formBuilderPage.page.getByRole('combobox', { name: /trigger action/i }).click();
    await formBuilderPage.page.getByText(/fail/i).click();
    await formBuilderPage.page.getByRole('combobox', { name: /select a field/i }).click();
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
    await formBuilderPage.dateInput('Appointment Date').click();
    await formBuilderPage.dateDayInput('Appointment Date').fill('31');
    await formBuilderPage.dateMonthInput('Appointment Date').fill('07');
    await formBuilderPage.dateYearInput('Appointment Date').fill('2024');
  });

  await test.step('And I see a warning message', async () => {
    await expect(
      formBuilderPage.page
        .getByLabel('Preview', { exact: true })
        .getByText('Cannot schedule an appointment in the past. Please select a future date.'),
    ).toBeVisible();
  });

  // Error messages do not go away when the input is dirty again
  // test.skip('When I change the date from past to future in `Appointment Date` field, Then I see the warning message disappears', async () => {
  //   await formBuilderPage.page.getByRole('button', { name: 'Calendar Appointment Date' }).click();
  //   await formBuilderPage.page.getByLabel('Increase').click();
  //   await formBuilderPage.page.getByRole('gridcell', { name: `${monthName} ${day},` }).click();
  //   await expect(
  //     formBuilderPage.page
  //       .getByLabel('Preview', { exact: true })
  //       .getByText('Cannot schedule an appointment in the past. Please select a future date.'),
  //   ).toBeHidden();
  // });
});
