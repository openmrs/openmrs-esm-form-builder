import { Page } from "@playwright/test";
export class HomePage {
  constructor(readonly page: Page) {}

  readonly formsTable = () => this.page.locator("table");
  readonly publishStatusFilter = () =>
    this.page.locator("#publishStatusFilter");
  readonly creatFormButton = () =>
    this.page.getByRole("button", { name: "Create a new form" });
  readonly schemaEditor = () => this.page.getByTestId("schemaEditor");
  readonly dummySchemaButton = () =>
    this.page.getByRole("button", { name: "Input dummy schema" });
  readonly renderChangesButton = () =>
    this.page.getByRole("button", { name: "Render changes" });
  readonly saveFormButton = () =>
    this.page.getByRole("button", { name: "Save Form" });

  async gotoFormBuilder() {
    await this.page.goto("form-builder");
  }

  async createForm() {
    await this.creatFormButton().click();
  }

  async inputDummySchema() {
    await this.dummySchemaButton().click();
  }

  async renderChanges() {
    await this.renderChangesButton().click();
  }

  async saveForm() {
    await this.saveFormButton().click();
  }
}
