/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Page } from '@playwright/test';

export class FormBuilderPage {
  constructor(readonly page: Page) {}

  readonly schemaEditorContent = () => this.page.locator('#schemaEditor div .ace_content');
  readonly createNewFormButton = () => this.page.getByRole('button', { name: /create a new form/i });
  readonly schemaInput = () => this.page.locator('.ace_text-input');
  readonly renderChangesButton = () => this.page.getByRole('button', { name: /render changes/i });
  readonly inputDummySchemaButton = () => this.page.getByRole('button', { name: /input dummy schema/i });
  readonly saveFormButton = () => this.page.getByRole('button', { name: /save form/i });
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
  readonly addPageButton = () => this.page.getByRole('button', { name: /add page/i });
  readonly pageNameInput = () =>
    this.page.getByRole('textbox', {
      name: /enter a title for your new page/i,
    });
  readonly savePageButton = () => this.page.getByRole('button', { name: /^save$/i, exact: true });
  readonly pageCreatedMessage = () => this.page.getByText(/new page created/i);
  readonly addSectionButton = () => this.page.getByRole('button', { name: /add section/i });
  readonly sectionNameInput = () => this.page.getByRole('textbox', { name: /enter a section title/i });
  readonly saveSectionButton = () => this.page.getByRole('button', { name: /^save$/i, exact: true });
  readonly sectionCreatedMessage = () => this.page.getByText(/new section created/i);
  readonly addQuestionButton = () => this.page.getByRole('button', { name: /add question/i });
  readonly questionLabelInput = () => this.page.getByRole('textbox', { name: /label/i });
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
  readonly saveQuestionButton = () => this.page.getByRole('button', { name: /^save$/i, exact: true });

  async gotoFormBuilder() {
    await this.page.goto('form-builder');
  }

  async searchForForm(formName: string) {
    await this.page.getByRole('searchbox').fill(formName);
  }
}
