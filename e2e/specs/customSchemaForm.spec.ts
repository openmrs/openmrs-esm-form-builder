import { test, expect } from "@playwright/test";
import { FromBuilderPage } from "../pages";
import customSchema from "../support/customSchema.json";

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

  await fromBuilderPage.gotoFormBuilder();
  await expect(page.getByTestId("formsTable")).toContain(formName);
});
