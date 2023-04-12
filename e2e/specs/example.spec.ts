import { test, expect } from "@playwright/test";
import { HomePage } from "../pages";

test("Should go to form builder", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.gotoFormBuilder();
});
