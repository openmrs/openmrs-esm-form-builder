import { test, expect } from "@playwright/test";
import { FormBuilderPage } from "../pages";

test("should be able to create a schema using the interactive builder", async ({
  page,
}) => {
  const formBuilderPage = new FormBuilderPage(page);
  await formBuilderPage.gotoFormBuilder();
  await formBuilderPage.createNewFormButton().click();
  await formBuilderPage.buildFormInteractively();

  await expect(page.getByText(/new question created/i)).toBeVisible();
  await expect(
    page
      .getByRole("tabpanel", { name: "Schema Editor" })
      .locator("div")
      .filter({
        hasText: '{ "name": "Covid-19 Screening"',
      })
      .nth(2)
  ).toBeVisible();
});
