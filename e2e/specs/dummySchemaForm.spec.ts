import { test } from "../core";
import { deleteForm } from "../commands/formOperations";
import { FormBuilderPage } from "../pages";

let formUuid = null;

test("Should be able to create a form using dummy schema", async ({ page }) => {
  const formBuilderPage = new FormBuilderPage(page);

  await formBuilderPage.gotoFormBuilder();
  await formBuilderPage.createNewFormButton().click();

  // Inputs the dummy schema
  await formBuilderPage.inputDummySchemaButton().click();

  // Save the form
  await formBuilderPage.saveForm();

  // Checks whether the user has been redirected to the edit page
  const editFormPageURLRegex = new RegExp("/edit/");
  await page.waitForURL(editFormPageURLRegex);
  const editFormPageURL = await page.url();
  formUuid = editFormPageURL.split("/").slice(-1)[0];
});

test.afterEach(async ({ api }) => {
  if (formUuid) {
    await deleteForm(api, formUuid);
  }
});
