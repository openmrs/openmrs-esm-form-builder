import type { FormField, RenderType } from '@openmrs/esm-form-engine-lib';
import { allowedPropertiesMapping, allowedQuestionOptionsMapping, allowedRenderingOptionsMapping } from '@constants';

/**
 * Cleans the given questionOptions object by retaining only allowed keys for the new type.
 * It combines allowed keys from both the question type and the rendering type.
 */
function cleanQuestionOptionsForType(options: any, questionType: string, rendering: RenderType): any {
  const allowedByType = allowedQuestionOptionsMapping[questionType] || [];
  const allowedByRendering = allowedRenderingOptionsMapping[rendering] || [];
  const allowedOpts = new Set(['rendering', ...allowedByType, ...allowedByRendering]);
  const cleanedOpts = Object.fromEntries(Object.entries(options).filter(([key]) => allowedOpts.has(key)));
  cleanedOpts.rendering = options.rendering;
  return cleanedOpts;
}

/**
 * Cleans the given form field by retaining only allowed top‑level properties for the new type.
 * Also cleans nested questionOptions using the combined mappings for question type and rendering type.
 */
export function cleanFormFieldForType(field: FormField, newType: string): FormField {
  const allowedKeys = allowedPropertiesMapping[newType] || [];
  const cleaned: Partial<FormField> = {};

  allowedKeys.forEach((key) => {
    if (key in field) {
      (cleaned as any)[key] = field[key as keyof FormField];
    }
  });

  // If questionOptions is allowed and exists, clean it using the nested mapping.
  if (cleaned.questionOptions && typeof cleaned.questionOptions === 'object') {
    cleaned.questionOptions = cleanQuestionOptionsForType(
      cleaned.questionOptions,
      newType,
      cleaned.questionOptions.rendering as RenderType,
    );
  }
  cleaned.type = newType;
  return cleaned as FormField;
}
