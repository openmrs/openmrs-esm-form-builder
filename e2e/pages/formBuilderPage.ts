import { Page } from "@playwright/test";

export class FormBuilderPage {
  constructor(readonly page: Page) {}

  readonly createNewFormButton = () =>
    this.page.getByRole("button", { name: "Create a new form" });
  readonly schemaInput = () => this.page.locator(".ace_text-input");
  readonly renderChangesButton = () =>
    this.page.getByRole("button", { name: "Render changes" });
  readonly inputDummySchemaButton = () =>
    this.page.getByRole("button", { name: "Input dummy schema" });
  readonly saveFormButton = () =>
    this.page.getByRole("button", { name: "Save Form" });
  readonly formNameInput = () => this.page.getByLabel("Form name");
  readonly formVersionInput = () => this.page.getByLabel("Version");
  readonly formDescriptionInput = () => this.page.getByLabel("Description");
  readonly formEncounterType = () =>
    this.page.getByRole("combobox", { name: "Encounter Type" });
  readonly formSaveButton = () =>
    this.page.getByRole("dialog").getByRole("button", { name: "Save" });
  readonly formSavedToast = () => this.page.getByText("Form created");

  async gotoFormBuilder() {
    await this.page.goto("form-builder");
  }

  async saveForm() {
    const formName = `test form ${Math.floor(Math.random() * 10000)}`;

    await this.saveFormButton().click();
    await this.formNameInput().click();
    await this.formNameInput().fill(formName);
    await this.formVersionInput().click();
    await this.formVersionInput().fill("1.0");
    await this.formDescriptionInput().click();
    await this.formDescriptionInput().fill("this is test form description");
    await this.formEncounterType().selectOption("Admission");
    await this.formSaveButton().click();
  }
}
