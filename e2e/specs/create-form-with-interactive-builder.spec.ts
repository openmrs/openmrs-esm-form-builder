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
                validators: [],
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
    await expect(formBuilderPage.saveButton()).toBeEnabled();
    await formBuilderPage.saveButton().click();
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
    await expect(formBuilderPage.saveButton()).toBeEnabled();
    await formBuilderPage.saveButton().click();
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
    await expect(formBuilderPage.saveButton()).toBeEnabled();
    await formBuilderPage.saveButton().click();
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

  await test.step('Then I click the `Edit` button on the form name I need to edit', async () => {
    await formBuilderPage.editFormButton().click();
  });

  await test.step('And then I fill in the updated form name', async () => {
    await formBuilderPage.editFormNameInput().click();
    await formBuilderPage.editFormNameInput().fill('An edited form');
  });

  await test.step('And then I click the `save` button', async () => {
    await formBuilderPage.saveButton().click();
  });

  await test.step('Then I should get a success message and the form name should be renamed', async () => {
    await expect(formBuilderPage.page.getByText(/form renamed/i)).toBeVisible();
    await expect(formBuilderPage.page.getByRole('heading', { level: 1, name: /an edited form/i })).toBeVisible();
  });

  await test.step('Then I click the `Edit` button on the page I need to edit', async () => {
    await formBuilderPage.editPageButton().click();
  });

  await test.step('And then I fill in the updated page name', async () => {
    await formBuilderPage.editPageNameInput().fill('An edited page');
  });

  await test.step('Then I click the `Save` button', async () => {
    await formBuilderPage.saveButton().click();
  });

  await test.step('Then I should get a success message and the page name should be renamed', async () => {
    await expect(formBuilderPage.page.getByText(/page renamed/i)).toBeVisible();
    await expect(formBuilderPage.page.getByRole('heading', { level: 1, name: /an edited page/i })).toBeVisible();
  });

  await test.step('Then I click the `Edit` button on the section I need to edit', async () => {
    await formBuilderPage.editSectionButton().click();
  });

  await test.step('And then I fill in the updated section name', async () => {
    await formBuilderPage.editSectionNameInput().fill('An edited section');
  });

  await test.step('Then I click the `Save` button', async () => {
    await formBuilderPage.saveButton().click();
  });

  await test.step('Then I should get a success message and the section name should be renamed', async () => {
    await expect(formBuilderPage.page.getByText(/section renamed/i)).toBeVisible();
    await expect(formBuilderPage.page.getByRole('heading', { level: 1, name: /an edited section/i })).toBeVisible();
  });

  await test.step('Then I click the `Edit` button on the question I need to edit', async () => {
    await formBuilderPage.editQuestionButton().click();
  });

  await test.step('And then I type in the updated question label', async () => {
    await formBuilderPage.questionLabelInput().fill('An edited question label');
  });

  await test.step('Then I click the `Save` button', async () => {
    await formBuilderPage.saveButton().click();
  });

  await test.step('Then I should get a success message and the question name should be renamed', async () => {
    await expect(formBuilderPage.page.getByText(/question edited/i)).toBeVisible();
    await expect(formBuilderPage.page.locator('p').getByText(/an edited question label/i)).toBeVisible();
  });

  await test.step('Then I click the `Duplicate` button on the question I need to duplicate', async () => {
    await formBuilderPage.duplicateQuestionButton().click();
  });

  await test.step('Then I should get a success message and a duplicate quesion should be added', async () => {
    await expect(formBuilderPage.page.getByText(/question duplicated/i)).toBeVisible();
    await expect(formBuilderPage.page.locator('p').getByText(/an edited question label/i)).toHaveCount(2);
  });

  await test.step('Then I click the `Delete` button on the question I need to delete', async () => {
    await formBuilderPage.deleteQuestionButton().click();
  });

  await test.step('And then I click the `Delete` button on the modal', async () => {
    await formBuilderPage.page.getByRole('button', { name: /danger delete question/i }).click();
  });

  await test.step('Then I should get a success message and a question should be deleted', async () => {
    await expect(formBuilderPage.page.getByText(/question deleted/i)).toBeVisible();
    await expect(formBuilderPage.page.locator('p').getByText(/an edited question label/i)).toHaveCount(1);
  });

  await test.step('Then I click the `Delete` button on the section I need to delete', async () => {
    await formBuilderPage.deleteSectionButton().click();
  });

  await test.step('And then I click the `Delete` button on the modal', async () => {
    await formBuilderPage.page.getByRole('button', { name: /danger delete section/i }).click();
  });

  await test.step('Then I should get a success message and the section should be deleted', async () => {
    await expect(formBuilderPage.page.getByText(/section deleted/i)).toBeVisible();
    await expect(formBuilderPage.page.getByRole('heading', { level: 1, name: /an edited section/i })).toHaveCount(0);
  });

  await test.step('Then I click the `Delete` button on the page I need to delete', async () => {
    await formBuilderPage.deletePageButton().click();
  });

  await test.step('And then I click the `Delete` button on the modal', async () => {
    await formBuilderPage.page.getByRole('button', { name: /danger delete page/i }).click();
  });

  await test.step('Then I should get a success message and the page should be deleted', async () => {
    await expect(formBuilderPage.page.getByText(/page deleted/i)).toBeVisible();
    await expect(formBuilderPage.page.getByRole('heading', { level: 1, name: /an edited page/i })).toHaveCount(0);
  });
});

test.afterEach(async ({ api }) => {
  if (formUuid) {
    await deleteForm(api, formUuid);
  }
});
