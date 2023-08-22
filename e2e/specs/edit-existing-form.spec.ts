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
  form = await createForm(api, false);
  const valueReference = await createValueReference(api);
  await addFormResources(api, valueReference, form.uuid);
});

test("Editing an existing form", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step("When I visit the form builder", async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step("And I search for the form I need to edit", async () => {
    await formBuilderPage.searchForm(form.name);
  });

  await test.step("And I click the `Edit` button on the form I need to edit", async () => {
    await page
      .getByRole("row", { name: form.name })
      .getByLabel("Edit Schema")
      .click();
  });

  await test.step("Then I click the `Save Form` button then the `Update existing version` button, and finally the `Save` button", async () => {
    await formBuilderPage.saveFormButton().click();
    await formBuilderPage.updateExistingFormButton().click();
    await formBuilderPage.formSaveButton().click();
  });

  await test.step("Then I should see a success message", async () => {
    await expect(page.getByText("Success!")).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  if (form) {
    await deleteForm(api, form.uuid);
  }
});
