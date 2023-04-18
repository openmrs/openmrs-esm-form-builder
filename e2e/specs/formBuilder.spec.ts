import { expect } from "@playwright/test";
import { test } from "../core";
import { HomePage } from "../pages";

test("Should create form with dummy schema data", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.gotoFormBuilder();
  await expect(page).toHaveURL("form-builder");
  await expect(
    page.getByRole("heading", { name: "Form Builder" })
  ).toBeVisible();
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

  await homePage.createForm();
  await expect(page).toHaveURL("form-builder/new");
  await expect(page.getByRole("tablist")).toContainText([
    "Schema Editor",
    "PreviewInteractive Builder",
  ]);
  await expect(homePage.schemaEditor()).toBeTruthy();

  await homePage.inputDummySchema();
});

const dummySchemaData = () => ({
  encounterType: "",
  name: "Sample Form",
  pages: [
    {
      label: "First Page",
      sections: [
        {
          label: "A Section",
          isExpanded: "true",
          questions: [
            {
              label: "A Question of type obs that renders a text input",
              type: "obs",
              questionOptions: {
                rendering: "text",
                concept: "a-system-defined-concept-uuid",
              },
              id: "sampleQuestion",
            },
          ],
        },
        {
          label: "Another Section",
          isExpanded: "true",
          questions: [
            {
              label:
                "Another Question of type obs whose answers get rendered as radio inputs",
              type: "obs",
              questionOptions: {
                rendering: "radio",
                concept: "system-defined-concept-uuid",
                answers: [
                  {
                    concept: "another-system-defined-concept-uuid",
                    label: "Choice 1",
                    conceptMappings: [],
                  },
                  {
                    concept: "yet-another-system-defined-concept-uuid",
                    label: "Choice 2",
                    conceptMappings: [],
                  },
                  {
                    concept: "yet-one-more-system-defined-concept-uuid",
                    label: "Choice 3",
                    conceptMappings: [],
                  },
                ],
              },
              id: "anotherSampleQuestion",
            },
          ],
        },
      ],
    },
  ],
  processor: "EncounterFormProcessor",
  referencedForms: [],
  uuid: "xxx",
});
