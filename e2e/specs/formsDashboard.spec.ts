import { test } from "../core";
import { expect } from "@playwright/test";
import { FormBuilderPage } from "../pages";
import {
  createForm,
  createValueReference,
  addFormResources,
  deleteForm,
} from "../commands/formOperations";
import { Form } from "../../src/types";

let form: Form = null;
test.beforeEach(async ({ api }) => {
  form = await createForm(api);
  const valueReference = await createValueReference(api);
  await addFormResources(api, valueReference, form.uuid);
});

test("Filter forms based on publish status", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);
  await test.step("When I Visit the form builder dashboard", async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  // Test the filter functionality
  await test.step("Then I click the publish filter dropdown", async () => {
    await page
      .getByRole("button", { name: "Filter by publish status: All Open menu" })
      .click();
  });

  await test.step("And I click the Unplished option", async () =>
    await page.getByText("Unpublished").click());

  // Locate the table
  await page.$('[data-testid ="forms-table"]');

  // Expect the publish status to be "No"
  const tagElement = await await page.$(`[data-testid="no-tag"]`);

  // Get the inner text of the tag element
  const innerText = await tagElement.innerText();
  await test.step("Then the form table should have only the unpublished forms", () => {
    expect(innerText).toBe("No");
  });
});

test("Search forms by name", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);
  await test.step("When I Visit the form builder dashboard", async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step("Then I click the search button", async () => {
    await page.getByPlaceholder("Search this list").click();
  });

  await test.step("And I type 'form created'", async () =>
    await page.getByPlaceholder("Search this list").fill("form created"));

  // Wait for the table to update with filtered results
  await page.$('[data-testid ="forms-table"]');

  const formNameElement = await page.locator("tr:nth-child(1) > td").nth(0);
  const innerNameText = await formNameElement.innerText();

  await test.step("Then the form table should show only the forms containing the name 'Form created'", () => {
    expect(innerNameText).toContain("Form created");
  });
});

test.afterEach(async ({ api }) => {
  if (form) {
    await deleteForm(api, form.uuid);
  }
});
