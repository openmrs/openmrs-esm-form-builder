import { test } from '../core';
import { expect } from '@playwright/test';
import { deleteForm } from '../commands/form-operations';
import { FormBuilderPage } from '../pages';

let formUuid = '';

test('Create a form using the interactive builder', async ({ page, context }) => {
  const formBuilderPage = new FormBuilderPage(page);
  const formDetails = {
    name: 'Covid-19 Screening',
    pages: [
      {
        label: 'Screening',
        sections: [
          {
            label: 'Testing history',
            isExpanded: 'true',
            questions: [
              {
                label: 'Have you been ever been tested for COVID-19?',
                type: 'obs',
                required: true,
                id: 'everTestedForCovid19',
                questionOptions: {
                  rendering: 'radio',
                  concept: '89c5bc03-8ce2-40d8-a77d-20b5a62a1ca1',
                  answers: [
                    {
                      concept: '1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                      label: 'No',
                    },
                    {
                      concept: '1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                      label: 'Yes',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
    processor: 'EncounterFormProcessor',
    encounterType: '',
    referencedForms: [],
    uuid: '',
    description: 'A test form for recording COVID-19 screening information',
  };

  await test.step('When I visit the form builder', async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step('And click the `Create New Form` button', async () => {
    await formBuilderPage.createNewFormButton().click();
  });

  await test.step('And then I go to the interactive builder tab', async () => {
    await formBuilderPage.interactiveBuilderTab().click();
  });

  await test.step('And I click on `Start Building`', async () => {
    await formBuilderPage.startBuildingButton().click();
  });

  await test.step('And then I fill in the form name', async () => {
    await formBuilderPage.interactiveFormNameInput().fill(formDetails.name);
  });

  await test.step('And then I fill in the form description', async () => {
    await formBuilderPage.interactiveFormDescriptionInput().fill(formDetails.description);
  });

  await test.step('And then I click on `Create Form`', async () => {
    await expect(formBuilderPage.createFormButton()).toBeEnabled();
    await formBuilderPage.createFormButton().click();
    await expect(formBuilderPage.page.getByText(/form created/i)).toBeVisible();
    expect(JSON.parse(await formBuilderPage.schemaEditorContent().textContent())).toEqual({
      ...formDetails,
      pages: [],
    });
  });

  await test.step('And then I click on `Create a new page`', async () => {
    await formBuilderPage.addPageButton().click();
  });

  await test.step('And then I fill in the page title', async () => {
    await formBuilderPage.pageNameInput().fill(formDetails.pages[0].label);
  });

  await test.step('And then I click on `Save`', async () => {
    await expect(formBuilderPage.savePageButton()).toBeEnabled();
    await formBuilderPage.savePageButton().click();
    await expect(formBuilderPage.page.getByText(/new page created/i)).toBeVisible();
    expect(JSON.parse(await formBuilderPage.schemaEditorContent().textContent())).toEqual({
      ...formDetails,
      pages: [
        {
          label: 'Screening',
          sections: [],
        },
      ],
    });
  });

  await test.step('And then I click on `Create a new section`', async () => {
    await formBuilderPage.addSectionButton().click();
  });

  await test.step('And then I fill in the section title', async () => {
    await formBuilderPage.sectionNameInput().fill(formDetails.pages[0].sections[0].label);
  });

  await test.step('And then I click on `Save`', async () => {
    await expect(formBuilderPage.saveQuestionButton()).toBeEnabled();
    await formBuilderPage.saveSectionButton().click();
    await expect(formBuilderPage.page.getByText(/new section created/i)).toBeVisible();
    expect(JSON.parse(await formBuilderPage.schemaEditorContent().textContent())).toEqual({
      ...formDetails,
      pages: [
        {
          label: 'Screening',
          sections: [
            {
              label: 'Testing history',
              isExpanded: 'true',
              questions: [],
            },
          ],
        },
      ],
    });
  });

  await test.step('And then I expand the section', async () => {
    await formBuilderPage.page.getByRole('button', { name: /^testing history$/i }).click();
  });

  await test.step('And then I click on `Add Question`', async () => {
    await formBuilderPage.addQuestionButton().click();
  });

  await test.step('And then I type in the question id', async () => {
    await formBuilderPage.questionIdInput().fill(formDetails.pages[0].sections[0].questions[0].id);
  });

  await test.step('And then I set the question type to obs', async () => {
    await formBuilderPage.questionTypeDropdown().selectOption('obs');
  });

  await test.step('And then I set the rendering type to be radio', async () => {
    await formBuilderPage.renderingTypeDropdown().selectOption('radio');
  });

  await test.step('And then I type in the question label', async () => {
    await formBuilderPage.questionLabelInput().fill(formDetails.pages[0].sections[0].questions[0].label);
  });

  await test.step('And then I set the question type to required', async () => {
    await formBuilderPage.page
      .getByRole('group', { name: /Is this question a required/i })
      .locator('span')
      .nth(2)
      .click();
  });

  await test.step('And then I select the concept to be `Tested for COVID 19`', async () => {
    await formBuilderPage.conceptSearchInput().fill('Tested for COVID 19');
    await formBuilderPage.conceptSearchInput().press('Enter');
    await formBuilderPage.page.getByRole('menuitem', { name: /tested for covid 19/i }).click();
  });

  await test.step('And then I select `Yes` and `No` as the answers to display', async () => {
    await formBuilderPage.selectAnswersDropdown().click();
    await formBuilderPage.page.getByRole('option', { name: 'No' }).click();
    await formBuilderPage.page.getByRole('option', { name: 'Yes' }).click();
  });

  await test.step('And then I click on `Save`', async () => {
    await expect(formBuilderPage.saveQuestionButton()).toBeEnabled();
    await formBuilderPage.saveQuestionButton().click();
    await expect(formBuilderPage.page.getByText(/new question created/i)).toBeVisible();
  });

  await test.step('Then the JSON schema should have the question object', async () => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await formBuilderPage.page.getByRole('button', { name: /Copy schema/i }).click();
    const handle = await page.evaluateHandle(() => navigator.clipboard.readText());
    const clipboardContent = await handle.jsonValue();
    expect(JSON.parse(clipboardContent)).toEqual(formDetails);
  });

  await test.step('Then I click the `Save Form` button', async () => {
    await formBuilderPage.saveFormButton().click();
  });

  await test.step('And then I fill in the form name', async () => {
    await formBuilderPage.formNameInput().click();
    await formBuilderPage.formNameInput().fill('A sample form');
  });

  await test.step('And then I fill in the version number', async () => {
    await formBuilderPage.formVersionInput().click();
    await formBuilderPage.formVersionInput().fill('1.0');
  });

  await test.step('And then I fill in the form description', async () => {
    await formBuilderPage.formDescriptionInput().fill('This is a test form');
  });

  await test.step('And then I select the encounter type', async () => {
    await formBuilderPage.formEncounterType().selectOption('Admission');
  });

  await test.step("And then I click on the 'Save' button", async () => {
    await formBuilderPage.formSaveButton().click();
  });

  await test.step('And I should get a success message and be redirected to the edit page for the new form', async () => {
    // Checks whether the user has been redirected to the edit page
    const editFormPageURLRegex = new RegExp('/edit/');
    await expect(formBuilderPage.page.getByText('Form created')).toBeVisible();
    await page.waitForURL(editFormPageURLRegex);
    const editFormPageURL = page.url();
    formUuid = editFormPageURL.split('/').slice(-1)[0];
  });
});

test.afterEach(async ({ api }) => {
  if (formUuid) {
    await deleteForm(api, formUuid);
  }
});
