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
  form = await createForm(api, true);
  const valueReference = await createValueReference(api);
  await addFormResources(api, valueReference, form.uuid);
});

test("Should be able to unpublish a form", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await formBuilderPage.gotoFormBuilder();

  await page.getByTestId(`editSchema${form.uuid}`).click();
  await formBuilderPage.unpublishFormButton().click();
  await formBuilderPage.unpublishFormConfirmationButton().click();

  await expect(page.getByText("Form unpublished")).toBeVisible();
  await expect(formBuilderPage.publishFormButton()).toBeVisible();
});

test.afterEach(async ({ api }) => {
  if (form) {
    await deleteForm(api, form.uuid);
  }
});
