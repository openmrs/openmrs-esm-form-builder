import { test } from "../core";
import { expect } from "@playwright/test";
import {
  createForm,
  createValueReference,
  addFormResources,
  deleteForm,
} from "../commands/form-operations";
import { FormBuilderPage } from "../pages";
import type { Form } from "../../src/types";

let form: Form = null;
test.beforeEach(async ({ api }) => {
  form = await createForm(api, true);
  const valueReference = await createValueReference(api);
  await addFormResources(api, valueReference, form.uuid);
});

test("Unpublish a form", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step("When I visit the form builder", async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step("And I search for the form I need to unpublish", async () => {
    await formBuilderPage.searchForm(form.name);
  });

  await test.step("And I click on a form I need to unpublish", async () => {
    await page.getByRole('row', { name: form.name }).getByRole('button').first().click();
  });

  await test.step("Then I click on the unpublish form button and confirms the unpublication", async () => {
    await formBuilderPage.unpublishFormButton().click();
    await formBuilderPage.unpublishFormConfirmationButton().click();
  });

  await test.step("Then I should see the form unpublished notification and the publish form button", async () => {
    await expect(page.getByText("Form unpublished")).toBeVisible();
    await expect(formBuilderPage.publishFormButton()).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  if (form) {
    await deleteForm(api, form.uuid);
  }
});
