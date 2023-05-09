import { test } from "../core";
import { deleteForm } from "../commands/formOperations";
import { FormBuilderPage } from "../pages";
import customSchema from "../support/customSchema.json";

let formUuid = "";

test("Should be able to create a form using custom schema", async ({
  page,
}) => {
  const formBuilderPage = new FormBuilderPage(page);
  const formName = `test form ${Math.floor(Math.random() * 10000)}`;

  await formBuilderPage.gotoFormBuilder();
  await formBuilderPage.clickCreateNewFormButton();

  // Inputs the custom schema and render changes
  await page.locator(".ace_text-input").fill(JSON.stringify(customSchema));
  await page.getByRole("button", { name: "Render changes" }).click();

  // Save the form
  await page.getByRole("button", { name: "Save Form" }).click();
  await page.getByLabel("Form name").click();
  await page.getByLabel("Form name").fill(formName);
  await page.getByLabel("Version").click();
  await page.getByLabel("Version").fill("1.0");
  await page.getByLabel("Description").click();
  await page.getByLabel("Description").fill("this is test form description");
  await page
    .getByRole("combobox", { name: "Encounter Type" })
    .selectOption("Admission");
  await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();

  // Checks whether the user has been redirected to the edit page
  const regex = new RegExp("/edit/");
  await page.waitForURL(regex);
  const url = await page.url();
  formUuid = url.split("/").slice(-1)[0];
});

test.afterEach(async ({ api }) => {
  await deleteForm(api, formUuid);
});
