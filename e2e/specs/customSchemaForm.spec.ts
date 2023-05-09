import { test } from "../core";
import { deleteForm } from "../commands/formOperations";
import { FormBuilderPage } from "../pages";
import customSchema from "../support/customSchema.json";

let formUuid = null;

test("Should be able to create a form using custom schema", async ({
  page,
}) => {
  const formBuilderPage = new FormBuilderPage(page);
  const formName = `test form ${Math.floor(Math.random() * 10000)}`;

  await formBuilderPage.gotoFormBuilder();
  await formBuilderPage.createNewFormButton().click();

  // Inputs the custom schema and render changes
  await formBuilderPage.schemaInput().fill(JSON.stringify(customSchema));
  await formBuilderPage.renderChangesButton().click();

  // Save the form
  await formBuilderPage.saveForm(formName);

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
