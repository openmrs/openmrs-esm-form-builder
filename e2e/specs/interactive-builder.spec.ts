import { test, expect } from "@playwright/test";
import { FormBuilderPage } from "../pages";

test("should be able to create a schema using the interactive builder", async ({
  page,
}) => {
  const formBuilderPage = new FormBuilderPage(page);
  await formBuilderPage.gotoFormBuilder();
  await formBuilderPage.createNewFormButton().click();

  await expect(page.getByRole("tab", { name: /preview/i })).toBeVisible();
  await expect(
    page.getByRole("tab", { name: /interactive builder/i })
  ).toBeVisible();

  await page.getByRole("tab", { name: /interactive builder/i }).click();
  await page.getByRole("button", { name: /start building/i }).click();

  const formNameInput = page.getByRole("textbox", { name: /form name/i });
  formNameInput.fill("Covid-19 Patient Screening");
  await page.getByRole("button", { name: /create form/i }).click();
  await expect(
    page.getByRole("heading", { name: /covid-19 patient screening/i })
  ).toBeVisible();
  await page.getByRole("button", { name: /add page/i }).click();
  await page
    .getByRole("textbox", { name: /enter a title for your new page/i })
    .fill("Screening");
  await page.getByRole("button", { name: /^save$/i, exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /^screening$/i, exact: true })
  ).toBeVisible();

  await page.getByRole("button", { name: /add section/i }).click();
  await page
    .getByRole("textbox", { name: /enter a section title/i })
    .fill("Testing history");
  await page.getByRole("button", { name: /^save$/i, exact: true }).click();

  await page.getByRole("button", { name: /^testing history$/i }).click();
  await expect(
    page.getByRole("button", { name: /add question/i })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /add question/i })
  ).toBeVisible();
  await page.getByRole("button", { name: /add question/i }).click();

  await expect(page.getByRole("textbox", { name: /label/i })).toBeVisible();
  await expect(page.getByRole("radio", { name: /optional/i })).toBeChecked();
  await expect(
    page.getByRole("radio", { name: /required/i })
  ).not.toBeChecked();
  await expect(
    page.getByRole("combobox", { name: /field type/i })
  ).toBeVisible();
  await expect(
    page.getByPlaceholder(/search using a concept name or uuid/i)
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: /question id/i })
  ).toBeVisible();

  await page
    .getByRole("textbox", { name: /label/i })
    .fill("Have you ever been tested for COVID-19?");

  expect(await page.getByLabel("required").isChecked()).not.toBeTruthy();

  await page
    .getByRole("combobox", { name: /question type/i })
    .selectOption("obs");
  await page
    .getByRole("combobox", { name: /field type/i })
    .selectOption("radio");
  await page
    .getByRole("textbox", { name: /question id/i })
    .fill("everTestedForCovid");
  await page.getByRole("searchbox").type("Tested for COVID 19");
  await page.getByRole("searchbox").press("Enter");
  await page.getByRole("menuitem", { name: "Tested for COVID 19" }).click();
  // TODO add logic that select the answers to display
  await expect(
    page.getByRole("button", { name: /^save$/i })
  ).not.toBeDisabled();
  await page.getByRole("button", { name: /^save$/i }).click();
});
