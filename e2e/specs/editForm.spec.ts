import { test } from "../core";
import { expect } from "@playwright/test";
import {
  createForm,
  createValueReference,
  addFormResources,
  deleteForm,
} from "../commands/formOperations";
import { FormBuilderPage } from "../pages";
import { Form } from "../../src/types";

let form: Form = null;
test.beforeEach(async ({ api }) => {
  form = await createForm(api);
  const valueReference = await createValueReference(api);
  await addFormResources(api, valueReference, form.uuid);
});

test("Should be able to edit a form", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await formBuilderPage.gotoFormBuilder();
  // Click on the edit schema button
  await page.getByTestId(`editSchema${form.uuid}`).click();
  await formBuilderPage.saveFormButton().click();
  await formBuilderPage.updateExistingFormButton().click();
  await formBuilderPage.formSaveButton().click();
  await expect(page.getByText("Success!")).toBeVisible();
});

test.afterEach(async ({ api }) => {
  if (form) {
    await deleteForm(api, form.uuid);
  }
});
