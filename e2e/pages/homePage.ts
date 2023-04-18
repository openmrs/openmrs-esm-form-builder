import { Page } from "@playwright/test";
export class HomePage {
  constructor(readonly page: Page) {}

  readonly formsTable = () => this.page.locator("table");
  readonly publishStatusFilter = () =>
    this.page.locator("#publishStatusFilter");

  async gotoFormBuilder() {
    await this.page.goto("form-builder");
  }
}
