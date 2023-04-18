import { expect } from "@playwright/test";
import { test } from "../core";
import { HomePage } from "../pages";
import { CreateForm } from "../pages/createFormPage";

test("Should go to form builder", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.gotoFormBuilder();
  await expect(page).toHaveURL("form-builder");
  await expect(page.getByText("Form Builder")).toBeVisible();
  await expect(homePage.publishStatusFilter()).toBeDefined();

  // Expect the table to have specific headers
  const headerNames = [
    "Name",
    "Version",
    "Published",
    "Retired",
    "Schema actions",
  ];
  const headers = await page.locator("thead > tr > th");
  await expect(headers).toContainText(headerNames);
});

test("Should create a new form", async ({ page }) => {
  const newFormPage = new CreateForm(page);

  await newFormPage.createForm();
  expect(page).toHaveURL("form-builder/new");
  expect(page.getByRole("tablist")).toBeVisible();
  expect(newFormPage.schemaEditor()).toBeTruthy();
});

test("Should input dummy schema data", async ({ page }) => {
  const newFormPage = new CreateForm(page);
  await newFormPage.inputDummySchema();
});
