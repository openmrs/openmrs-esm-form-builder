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

test("should filter forms based on publish status and the search value", async ({
  page,
}) => {
  const formBuilderPage = new FormBuilderPage(page);
  await test.step("When I Visit the form builder dashboard", async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  // Test the filter functionality
  await test.step("Then I click the publish filter dropdown and click Unpublished", async () => {
    await page
      .getByRole("button", { name: "Filter by publish status: All Open menu" })
      .click();
    await page.getByText("Unpublished").click();
  });

  // Locate the table
  await test.step("When I locate the table", async () =>
    await page.locator(".cds--data-table-container"));

  // Assert that only published forms are displayed in the table
  const filteredTableRows = await page.$$eval(
    ".cds--data-table tbody tr",
    (rows) => rows
  );

  // Expect the publish status to be "No"
  const tagElement = await await page.$(`[data-testid="no-tag"]`);

  // Get the inner text of the tag element
  const innerText = await tagElement.innerText();
  await test.step("Then the table should have row greater or equal to 1 and the Publish tag should be No", () => {
    expect(filteredTableRows.length).toBeGreaterThanOrEqual(1);
    expect(innerText).toBe("No");
  });
});

test("should search forms by name", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);
  await test.step("When I Visit the form builder dashboard", async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step("Then I click the search button and type 'form created' in the search field", async () => {
    await page.getByPlaceholder("Search this list").click();
    await page.getByPlaceholder("Search this list").fill("form created");
  });

  // Wait for the table to update with filtered results
  await page.locator(".cds--data-table-container");

  const searchedTableRows = await page.$$eval(
    ".cds--data-table tbody tr",
    (rows) => rows
  );

  const formNameElement = await page.locator("tr:nth-child(1) > td").nth(0);
  const innerNameText = await formNameElement.innerText();

  await test.step("When I locate the table, it should have atleast 1 row with the form name containing 'Form created'", () => {
    expect(searchedTableRows.length).toBeGreaterThanOrEqual(1);
    expect(innerNameText).toContain("Form created");
  });
});

test.afterEach(async ({ api }) => {
  if (form) {
    await deleteForm(api, form.uuid);
  }
});
