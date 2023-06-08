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
  await formBuilderPage.gotoFormBuilder();

  // Test the filter functionality
  await page
    .getByRole("button", { name: "Filter by publish status: All Open menu" })
    .click();
  await page.getByText("Unpublished").click();

  // Locate the table
  await page.locator(".cds--data-table-container");

  // Assert that only published forms are displayed in the table
  const filteredTableRows = await page.$$eval(
    ".cds--data-table tbody tr",
    (rows) => rows
  );

  expect(filteredTableRows.length).toBeGreaterThanOrEqual(1);

  // Expect the publish status to be "No"
  const tagElement = await await page.$(`[data-testid="no-tag"]`);

  // Get the inner text of the tag element
  const innerText = await tagElement.innerText();

  // Assert that the inner text is "No"
  expect(innerText).toBe("No");
});

test("should search forms by name", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);
  await formBuilderPage.gotoFormBuilder();

  await page.getByPlaceholder("Search this list").click();
  await page.getByPlaceholder("Search this list").fill("ui select");

  // Wait for the table to update with filtered results
  await page.locator(".cds--data-table-container");

  const searchedTableRows = await page.$$eval(
    ".cds--data-table tbody tr",
    (rows) => rows
  );

  expect(searchedTableRows.length).toBeGreaterThanOrEqual(1);
  const formNameElement = await page.locator("tr:nth-child(1) > td").nth(0);

  const innerNameText = await formNameElement.innerText();
  expect(innerNameText).toContain("UI Select");
});

test.afterEach(async ({ api }) => {
  if (form) {
    await deleteForm(api, form.uuid);
  }
});
