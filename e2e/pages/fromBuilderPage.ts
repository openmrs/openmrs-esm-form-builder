import { Page } from "@playwright/test";

export class FromBuilderPage {
  constructor(readonly page: Page) {}

  async gotoFormBuilder() {
    await this.page.goto("form-builder");
  }
}
