/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Page } from '@playwright/test';
import customSchema from '../support/validation-custom-schema.json';
export class FormBuilderPage {
  constructor(readonly page: Page) {}

  readonly schemaEditorContent = () => this.page.locator('#schemaEditor div .ace_content');
  readonly createNewFormButton = () => this.page.getByRole('button', { name: /create a new form/i });
  readonly schemaInput = () => this.page.locator('.ace_text-input');
  readonly renderChangesButton = () => this.page.getByRole('button', { name: /render changes/i });
  readonly inputDummySchemaButton = () => this.page.getByRole('button', { name: /input dummy schema/i });
  readonly saveFormButton = () => this.page.getByRole('button', { name: /save form/i });
  readonly editFormButton = () => this.page.getByRole('button', { name: /edit schema/i });
  readonly deleteFormConfirmationButton = () => this.page.getByRole('button', { name: /danger delete/i });
  readonly publishFormButton = () => this.page.getByRole('button', { name: /^publish form$/i });
  readonly unpublishFormButton = () => this.page.getByRole('button', { name: /unpublish form/i });
  readonly unpublishFormConfirmationButton = () =>
    this.page.getByRole('button', { name: /^danger unpublish$/i, exact: true });
  readonly updateExistingFormButton = () => this.page.getByRole('button', { name: /update existing version/i });
  readonly formNameInput = () => this.page.getByLabel(/form name/i);
  readonly formVersionInput = () => this.page.getByLabel(/version/i);
  readonly formDescriptionInput = () => this.page.getByLabel(/description/i);
  readonly formEncounterType = () => this.page.getByRole('combobox', { name: /encounter type/i });
  readonly formSaveButton = () => this.page.getByRole('dialog').getByRole('button', { name: /save/i });

  readonly previewTab = () => this.page.getByRole('tab', { name: /preview/i });
  readonly interactiveBuilderTab = () => this.page.getByRole('tab', { name: /interactive builder/i });
  readonly startBuildingButton = () => this.page.getByRole('button', { name: /start building/i });
  readonly interactiveFormNameInput = () => this.page.getByRole('textbox', { name: /form name/i });
  readonly interactiveFormDescriptionInput = () => this.page.getByRole('textbox', { name: /form description/i });
  readonly createFormButton = () => this.page.getByRole('button', { name: /create form/i });
  readonly editFormNameInput = () => this.page.locator('#formNameInput');
  readonly addPageButton = () => this.page.getByRole('button', { name: /add page/i });
  readonly pageNameInput = () =>
    this.page.getByRole('textbox', {
      name: /enter a title for your new page/i,
    });
  readonly editPageButton = () => this.page.getByRole('button', { name: /edit page/i });
  readonly editPageNameInput = () => this.page.locator('#pageNameInput');
  readonly deletePageButton = () => this.page.getByRole('button', { name: /delete page/i });
  readonly saveButton = () => this.page.getByRole('button', { name: /^save$/i, exact: true });
  readonly pageCreatedMessage = () => this.page.getByText(/new page created/i);
  readonly addSectionButton = () => this.page.getByRole('button', { name: /add section/i });
  readonly sectionNameInput = () => this.page.getByRole('textbox', { name: /enter a section title/i });
  readonly isExpandedCheckbox = () => this.page.getByTestId('keep-section-expanded-checkbox');
  readonly editSectionButton = () => this.page.getByRole('button', { name: /edit section/i });
  readonly editSectionNameInput = () => this.page.locator('#sectionNameInput');
  readonly deleteSectionButton = () => this.page.getByRole('button', { name: /delete section/i });
  readonly sectionCreatedMessage = () => this.page.getByText(/new section created/i);
  readonly addQuestionButton = () => this.page.getByRole('button', { name: /add question/i });
  readonly editQuestionButton = () => this.page.getByRole('button', { name: /edit question/i });
  readonly duplicateQuestionButton = () => this.page.getByRole('button', { name: /duplicate question/i });
  readonly deleteQuestionButton = () => this.page.getByRole('button', { name: /delete question/i }).nth(0);
  readonly questionLabelInput = () => this.page.locator('#questionLabel');
  readonly questionTypeDropdown = () =>
    this.page.getByRole('combobox', {
      name: /question type/i,
    });
  readonly renderingTypeDropdown = () =>
    this.page.getByRole('combobox', {
      name: /rendering type/i,
    });
  readonly conceptSearchInput = () => this.page.getByPlaceholder(/search using a concept name or uuid/i);
  readonly selectAnswersDropdown = () => this.page.getByText(/select answers to display/i);
  readonly answer = () => this.page.getByRole('menuitem', { name: /tested for covid 19/i });
  readonly questionIdInput = () => this.page.getByRole('textbox', { name: /question id/i });
  readonly questionCreatedMessage = () => this.page.getByText(/new question created/i);

  readonly implementorTools = () => this.page.getByTestId('globalImplementerToolsButton').getByRole('button');
  readonly featureFlags = () => this.page.getByRole('tab', { name: 'Feature flags' });
  readonly validationRuleBuilder = () => this.page.locator('.cds--toggle__switch');
  readonly closeImplementorTools = () => this.page.getByRole('button', { name: 'Close', exact: true });

  async gotoFormBuilder() {
    await this.page.goto('form-builder');
  }

  async formBuilderSetupForRuleBuilder() {
    await this.createNewFormButton().click();
    await this.implementorTools().click();
    await this.featureFlags().click();
    await this.validationRuleBuilder().click();
    await this.closeImplementorTools().click();
    await this.schemaInput().fill(JSON.stringify(customSchema, null, 2));
    await this.renderChangesButton().click();
  }

  async searchForForm(formName: string) {
    await this.page.getByRole('searchbox').fill(formName);
  }
}
