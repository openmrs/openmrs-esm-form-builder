import { test } from "../core";
import { deleteForm } from "../commands/formOperations";
import { FromBuilderPage } from "../pages";
import customSchema from "../support/customSchema.json";

let formUuid = "";

test("Should be able to create a form using custom schema", async ({
  page,
}) => {
  const fromBuilderPage = new FromBuilderPage(page);
  await fromBuilderPage.gotoFormBuilder();

  const formName = `test form ${Math.floor(Math.random() * 10000)}`;

  await page.getByRole("button", { name: "Create a new form" }).click();
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
  const url = await page.url();
  const regex = new RegExp("/edit/");
  formUuid = url.split("/").slice(-1)[0];
  await page.waitForURL(regex);
});

test.afterAll(async ({ api }) => {
  await deleteForm(api, formUuid);
});
