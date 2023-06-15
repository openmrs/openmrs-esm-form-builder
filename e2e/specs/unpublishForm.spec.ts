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

test("Unpublish a form", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await test.step("When I visit the form builder page", async () => {
    await formBuilderPage.gotoFormBuilder();
  });

  await test.step("And I click on a form I need to unpublish", async () => {
    await page.getByTestId(`editSchema${form.uuid}`).click();
  });

  await test.step("Then I click on the unpublish form button and confirms the unpublication", async () => {
    await formBuilderPage.unpublishFormButton().click();
    await formBuilderPage.unpublishFormConfirmationButton().click();
  });

  await test.step("The I should see the form unpublished notification and the publish form button", async () => {
    await expect(page.getByText("Form unpublished")).toBeVisible();
    await expect(formBuilderPage.publishFormButton()).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  if (form) {
    await deleteForm(api, form.uuid);
  }
});
