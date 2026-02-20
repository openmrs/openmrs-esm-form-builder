import dischargeSummaryTemplate from '../templates/discharge-summary-template.json';
import type { Schema } from '@types';

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  schema: Schema;
}

/**
 * Available form templates that users can use to quickly create forms
 */
export const formTemplates: FormTemplate[] = [
  {
    id: 'discharge-summary',
    name: 'Discharge Summary',
    description:
      'Comprehensive discharge summary form for documenting patient hospital stay and post-discharge care instructions',
    category: 'Clinical',
    schema: dischargeSummaryTemplate as Schema,
  },
  // Add more templates here as needed
];

/**
 * Get a form template by ID
 * @param templateId The ID of the template to retrieve
 * @returns The form template or undefined if not found
 */
export function getFormTemplate(templateId: string): FormTemplate | undefined {
  return formTemplates.find((template) => template.id === templateId);
}

/**
 * Get all form templates for a specific category
 * @param category The category to filter by
 * @returns Array of form templates in the specified category
 */
export function getFormTemplatesByCategory(category: string): FormTemplate[] {
  return formTemplates.filter((template) => template.category === category);
}

/**
 * Get all available template categories
 * @returns Array of unique category names
 */
export function getTemplateCategories(): string[] {
  return [...new Set(formTemplates.map((template) => template.category))];
}
