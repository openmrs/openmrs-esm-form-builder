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
  form = await createForm(api, false);
  const valueReference = await createValueReference(api);
  await addFormResources(api, valueReference, form.uuid);
});

test("Should be able to publish a form", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await formBuilderPage.gotoFormBuilder();

  await page.getByTestId(`editSchema${form.uuid}`).click();
  await formBuilderPage.publishFormButton().click();
  await expect(page.getByText("Form published")).toBeVisible();
  await expect(formBuilderPage.unpublishFormButton()).toBeVisible();
});

test.afterEach(async ({ api }) => {
  if (form) {
    await deleteForm(api, form.uuid);
  }
});
