import { test, expect } from "@playwright/test";
import { FromBuilderPage } from "../pages";
import customSchema from "../support/customSchema.json";

test("Should be able to create a form using custom schema", async ({
  page,
}) => {
  const fromBuilderPage = new FromBuilderPage(page);
  await fromBuilderPage.gotoFormBuilder();

  await page.getByRole("button", { name: "Create a new form" }).click();
  await page.locator(".ace_content").fill(customSchema.toString());
  await page.getByRole("textbox").press("Meta+a");

  // Save the form
  await page.getByRole("button", { name: "Save Form" }).click();
  await page.getByLabel("Form name").click();
  await page.getByLabel("Form name").fill("test form");
  await page.getByLabel("Version").click();
  await page.getByLabel("Version").fill("1.0");
  await page.getByLabel("Description").click();
  await page.getByLabel("Description").fill("this is test form description");
  await page
    .getByRole("combobox", { name: "Encounter Type" })
    .selectOption("Admission");
  await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();

  await fromBuilderPage.gotoFormBuilder();
});
