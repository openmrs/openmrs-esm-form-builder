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

test("should filter forms based on publish status", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);
  await formBuilderPage.gotoFormBuilder();

  // Select the "unPublished" filter option
  await formBuilderPage.publishStatusDropdownButton().click();

  await formBuilderPage.unPublishedOption().click();

  // Wait for the table to update with filtered results
  await page.locator(".cds--data-table-container");

  const tableRows = await page.$$eval(
    '[data-testid^="form-row-"]',
    (rows) => rows
  );

  expect(tableRows.length).toBeGreaterThan(1);

  const row = await page.$(`[data-testid="form-row-0"]`);
  const thirdTdElement = await row.$("td:nth-child(3)");

  const publishStatusTag = await thirdTdElement.$(".cds--tag");

  // Get the text content of the publish status tag
  const publishStatusText = await publishStatusTag.$eval(
    "span",
    (spanElement) => spanElement.textContent
  );

  // Expect the publish status to be "No"
  expect(publishStatusText).toBe("No");
});

test("should search forms by name", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);
  await formBuilderPage.gotoFormBuilder();

  await formBuilderPage.searchbox().type("UI Select Form Test");

  await page.locator(".cds--data-table-container");

  const tableRows = await page.$$eval(
    '[data-testid^="form-row-"]',
    (rows) => rows
  );

  expect(tableRows.length).toBeGreaterThan(1);
  const searchBoxValue = await formBuilderPage
    .searchbox()
    .getAttribute("value");
  expect(searchBoxValue).toBe("UI Select Form Test");

  const tableRow = await page.$(`[data-testid="form-row-1"]`);
  const tdElement = await tableRow.$("td");
  const tdNameTextContent = await tdElement.textContent();

  // Expect the form name to be "UI Select Form Test"
  expect(tdNameTextContent).toBe("UI Select Form Test");
});

test.afterEach(async ({ api }) => {
  if (form) {
    await deleteForm(api, form.uuid);
  }
});
