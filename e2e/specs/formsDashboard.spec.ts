import { test } from "../core";
import { expect } from "@playwright/test";
import { FormBuilderPage } from "../pages";
import { deleteForm } from "../commands/formOperations";

let formUuid = null;

test("should filter forms based on publish status", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);
  await formBuilderPage.gotoFormBuilder();

  await formBuilderPage.createNewFormButton().click();

  // Inputs the dummy schema
  await formBuilderPage.inputDummySchemaButton().click();
  // await formBuilderPage.renderChangesButton().click();

  // Save the form
  await formBuilderPage.saveForm();
  await formBuilderPage.publishFormButton().click();
  await formBuilderPage.gotoFormBuilder();

  // Select the "Published" filter option
  await formBuilderPage.publishStatusDropdownButton().click();

  await formBuilderPage.publishedOption().click();

  // Wait for the table to update with filtered results
  await formBuilderPage.tableContainer();

  // Assert that only published forms are displayed in the table
  const tableRows = await page.$$eval(
    ".cds--data-table tbody tr",
    (rows) => rows
  );

  expect(tableRows.length).toBeGreaterThan(1);

  const tableRow = await page.$(".cds--data-table tbody tr");
  const thirdTdElement = await tableRow.evaluateHandle((row) =>
    row.querySelector("td:nth-child(3)")
  );

  // Locate the <div> element with the publish status tag
  const publishStatusTag = await thirdTdElement.$(".cds--tag");

  // Get the text content of the publish status tag
  const publishStatusText = await publishStatusTag.$eval(
    "span",
    (spanElement) => spanElement.textContent
  );

  // Expect the publish status to be "Yes"
  expect(publishStatusText).toBe("Yes");
});

test("should search forms by name", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);
  await formBuilderPage.gotoFormBuilder();

  await formBuilderPage.createNewFormButton().click();

  // Inputs the custom schema
  await formBuilderPage.inputDummySchemaButton().click();

  // Save the form
  await formBuilderPage.saveForm();
  await formBuilderPage.publishFormButton().click();

  const editFormPageURLRegex = new RegExp("/edit/");
  await page.waitForURL(editFormPageURLRegex);
  const editFormPageURL = await page.url();
  formUuid = editFormPageURL.split("/").slice(-1)[0];

  await formBuilderPage.gotoFormBuilder();

  await formBuilderPage.searchbox().type("Sample Form");

  await formBuilderPage.tableContainer();

  // Assert that only published forms are displayed in the table
  const tableRows = await page.$$eval(
    ".cds--data-table tbody tr",
    (rows) => rows
  );

  expect(tableRows.length).toBeGreaterThan(1);
  const searchBoxValue = await formBuilderPage
    .searchbox()
    .getAttribute("value");
  expect(searchBoxValue).toBe("Sample Form");

  const tableRow = await page.$(".cds--data-table tbody tr");
  const tdElement = await tableRow.$("td");
  const tdNameTextContent = await tdElement.textContent();

  // Expect the form name to be "test form"
  expect(tdNameTextContent).toBe("Sample Form");
});

test.afterEach(async ({ api }) => {
  if (formUuid) {
    await deleteForm(api, formUuid);
  }
});
