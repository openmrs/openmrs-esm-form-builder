import { test } from '../core';
import { expect } from '@playwright/test';
import { createForm, createValueReference, addFormResources, deleteForm } from '../commands/form-operations';
import { FormBuilderPage } from '../pages';
import type { Form } from '@types';

let form: Form = null;
const formDetails = {
  name: 'Covid-19 Screening',
  description: 'A test form for recording COVID-19 screening information',
  version: '1.0',
  published: true,
};
let updatedForm = {
  encounterType: 'e22e39fd-7db2-45e7-80f1-60fa0d5a4378',
  name: 'An edited form',
  pages: [
    {
      label: 'UI Select Test',
      sections: [
        {
          label: 'Visit Details',
          isExpanded: 'true',
          questions: [
            {
              label: 'Select Provider',
              type: 'obs',
              questionOptions: { rendering: 'text', concept: 'a-system-defined-concept-uuid' },
              id: 'sampleQuestion',
            },
          ],
        },
      ],
    },
  ],
  processor: 'EncounterFormProcessor',
  referencedForms: [],
  uuid: 'xxx',
  version: '1',
  description: 'This is test description',
};
test.beforeEach(async ({ api }) => {
  form = await createForm(api, false, formDetails);
  const valueReference = await createValueReference(api);
  await addFormResources(api, valueReference, form.uuid);
});

test('Edit a form using the interactive builder', async ({ page, context }) => {
  const formBuilderPage = new FormBuilderPage(page);
  const formDetails = {
    encounterType: 'e22e39fd-7db2-45e7-80f1-60fa0d5a4378',
    name: 'UI Select Form Test',
    pages: [
      {
        label: 'UI Select Test',
        sections: [
          {
            label: 'Visit Details',
            isExpanded: 'true',
            questions: [
              {
                label: 'Select Provider',
                type: 'obs',
                questionOptions: {
                  rendering: 'text',
                  concept: '104677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                id: 'sampleQuestion',
              },
            ],
          },
        ],
      },
    ],
    processor: 'EncounterFormProcessor',
    referencedForms: [],
    uuid: 'xxx',
    version: '1',
    description: 'This is test description',
  };

  await test.step('When I visit the form builder', async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step('And I search for the form I need to edit', async () => {
    await formBuilderPage.searchForForm(form.name);
  });

  await test.step('And I click the `Edit` button on the form I need to edit', async () => {
    await formBuilderPage.page.getByRole('row', { name: form.name }).getByLabel('Edit Schema').first().click();
  });

  await test.step('And then I click the `Interactive Builder` tab', async () => {
    await formBuilderPage.interactiveBuilderTab().click();
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
    const formTextContent = await formBuilderPage.schemaEditorContent().textContent();
    expect(JSON.parse(formTextContent)).toEqual(updatedForm);
  });

  await test.step('Then I click the `Edit` button on the page I need to edit', async () => {
    await formBuilderPage.editPageButton().click();
  });

  await test.step('And then I fill in the updated page name', async () => {
    await formBuilderPage.editPageNameInput().fill('An edited page');
    updatedForm.pages[0].label = 'An edited page';
  });

  await test.step('Then I click the `Save` button', async () => {
    await formBuilderPage.saveButton().click();
  });

  await test.step('Then I should get a success message and the page name should be renamed', async () => {
    await expect(formBuilderPage.page.getByText(/page renamed/i)).toBeVisible();
    await expect(formBuilderPage.page.getByRole('heading', { level: 1, name: /an edited page/i })).toBeVisible();
    const formTextContent = await formBuilderPage.schemaEditorContent().textContent();
    expect(JSON.parse(formTextContent)).toEqual(updatedForm);
  });

  await test.step('Then I click the section accordian button on the section I need to edit', async () => {
    await formBuilderPage.page.getByRole('button', { name: /visit details/i }).click();
  });

  await test.step('And then I click the `Edit` button on the section I need to edit', async () => {
    await formBuilderPage.editSectionButton().click();
  });

  await test.step('And then I fill in the updated section name', async () => {
    await formBuilderPage.sectionNameInput().fill('An edited section');
    updatedForm.pages[0].sections[0].label = 'An edited section';
  });

  await test.step('And then I check the expand section checkbox', async () => {
    await page.evaluate(() => {
      const checkbox = document.querySelector(
        'input[data-testid="keep-section-expanded-checkbox"]',
      ) as HTMLInputElement;
      if (checkbox) {
        checkbox.click();
      }
    });
    updatedForm.pages[0].sections[0].isExpanded = 'false';
  });

  await test.step('Then I click the `Save` button', async () => {
    await expect(formBuilderPage.saveButton()).toBeEnabled();
    await formBuilderPage.saveButton().click();
  });

  await test.step('Then I should get a success message and the section name should be renamed', async () => {
    await expect(formBuilderPage.page.getByText(/section edited/i)).toBeVisible();
    await expect(formBuilderPage.page.getByRole('heading', { level: 1, name: /an edited section/i })).toBeVisible();
    const formTextContent = await formBuilderPage.schemaEditorContent().textContent();
    expect(JSON.parse(formTextContent)).toEqual(updatedForm);
  });

  await test.step('Then I click the `Edit` button on the question I need to edit', async () => {
    await formBuilderPage.editQuestionButton().click();
  });

  await test.step('And then I type in the updated question label', async () => {
    await formBuilderPage.questionLabelInput().fill('An edited question label');
    updatedForm.pages[0].sections[0].questions[0] = {
      ...updatedForm.pages[0].sections[0].questions[0],
      label: 'An edited question label',
    };
  });

  await test.step('Then I click the `Save` button', async () => {
    await formBuilderPage.saveButton().click();
  });

  await test.step('Then I should get a success message and the question name should be renamed', async () => {
    await expect(formBuilderPage.page.getByText(/question updated/i)).toBeVisible();
    await expect(formBuilderPage.page.locator('p').getByText(/an edited question label/i)).toBeVisible();
    const formTextContent = await formBuilderPage.schemaEditorContent().textContent();
    expect(JSON.parse(formTextContent)).toEqual(updatedForm);
  });

  await test.step('Then I click the `Duplicate` button on the question I need to duplicate', async () => {
    await formBuilderPage.duplicateQuestionButton().click();
    updatedForm.pages[0].sections[0].questions.push({
      ...updatedForm.pages[0].sections[0].questions[0],
      id: 'sampleQuestionDuplicate',
    });
  });

  await test.step('Then I should get a success message and a duplicate quesion should be added', async () => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await formBuilderPage.page.getByRole('button', { name: /Copy schema/i }).click();
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    await expect(formBuilderPage.page.getByText(/question duplicated/i)).toBeVisible();
    await expect(formBuilderPage.page.locator('p').getByText(/an edited question label/i)).toHaveCount(2);
    expect(JSON.parse(clipboardContent)).toEqual(updatedForm);
  });

  await test.step('Then I click the `Delete` button on the first question I need to delete', async () => {
    await formBuilderPage.deleteQuestionButton().click();
  });

  await test.step('And then I click the `Delete` button on the modal', async () => {
    await formBuilderPage.page.getByRole('button', { name: /danger delete question/i }).click();
    updatedForm.pages[0].sections[0].questions = updatedForm.pages[0].sections[0].questions.filter(
      (q) => q.id !== 'sampleQuestion',
    );
  });

  await test.step('Then I should get a success message and a question should be deleted', async () => {
    await expect(formBuilderPage.page.getByText(/question deleted/i)).toBeVisible();
    await expect(formBuilderPage.page.locator('p').getByText(/an edited question label/i)).toHaveCount(1);
    const formTextContent = await formBuilderPage.schemaEditorContent().textContent();
    expect(JSON.parse(formTextContent)).toEqual(updatedForm);
  });

  await test.step('Then I click the `Delete` button on the section I need to delete', async () => {
    await formBuilderPage.deleteSectionButton().click();
  });

  await test.step('And then I click the `Delete` button on the modal', async () => {
    await formBuilderPage.page.getByRole('button', { name: /danger delete section/i }).click();
    updatedForm.pages[0].sections = [];
  });

  await test.step('Then I should get a success message and the section should be deleted', async () => {
    await expect(formBuilderPage.page.getByText(/section deleted/i)).toBeVisible();
    await expect(formBuilderPage.page.getByRole('heading', { level: 1, name: /an edited section/i })).toHaveCount(0);
    const formTextContent = await formBuilderPage.schemaEditorContent().textContent();
    expect(JSON.parse(formTextContent)).toEqual(updatedForm);
  });

  await test.step('Then I click the `Delete` button on the page I need to delete', async () => {
    await formBuilderPage.deletePageButton().click();
  });

  await test.step('And then I click the `Delete` button on the modal', async () => {
    await formBuilderPage.page.getByRole('button', { name: /danger delete page/i }).click();
    updatedForm.pages = [];
  });

  await test.step('Then I should get a success message and the page should be deleted', async () => {
    await expect(formBuilderPage.page.getByText(/page deleted/i)).toBeVisible();
    await expect(formBuilderPage.page.getByRole('heading', { level: 1, name: /an edited page/i })).toHaveCount(0);
    const formTextContent = await formBuilderPage.schemaEditorContent().textContent();
    expect(JSON.parse(formTextContent)).toEqual(updatedForm);
  });
});

test.afterEach(async ({ api }) => {
  if (form) {
    await deleteForm(api, form.uuid);
  }
});
