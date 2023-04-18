import { Accordion } from "@carbon/react";
import { Page } from "@playwright/test";

export class CreateForm {
  constructor(readonly page: Page) {}

  readonly creatFormButton = () =>
    this.page.getByRole("button", { name: "Create a new form" });
  readonly schemaEditor = () => this.page.getByTestId("schemaEditor");
  readonly dummySchemaButton = () => this.page.getByText("Input dummy schema");
  readonly renderChangesButton = () =>
    this.page.getByRole("button", { name: "Render changes" });

  async createForm() {
    await this.creatFormButton().click();
  }

  async inputDummySchema() {
    await this.dummySchemaButton().click();
  }

  async renderChanges() {
    await this.renderChangesButton().click();
  }
}
