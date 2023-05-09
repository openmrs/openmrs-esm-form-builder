import { Page } from "@playwright/test";

export class FormBuilderPage {
  constructor(readonly page: Page) {}

  async gotoFormBuilder() {
    await this.page.goto("form-builder");
  }

  async clickCreateNewFormButton() {
    await this.page.getByRole("button", { name: "Create a new form" }).click();
  }
}
