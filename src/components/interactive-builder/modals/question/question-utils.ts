import type { FormField } from '@openmrs/esm-form-engine-lib';
import { allowedPropertiesMapping, allowedQuestionOptionsMapping } from '@constants';

/**
 * Cleans the given questionOptions object by retaining only allowed keys for the new type.
 */
function cleanQuestionOptionsForType(options: any, newType: string): any {
  const allowedOpts = allowedQuestionOptionsMapping[newType] || [];
  const cleanedOpts = Object.fromEntries(Object.entries(options).filter(([optKey]) => allowedOpts.includes(optKey)));
  cleanedOpts.rendering = options.rendering;
  return cleanedOpts;
}

/**
 * Cleans the given form field by retaining only allowed top‑level properties for the new type.
 * Also cleans nested questionOptions using the nested mapping.
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
    cleaned.questionOptions = cleanQuestionOptionsForType(cleaned.questionOptions, newType);
  }

  cleaned.type = newType;
  return cleaned as FormField;
}
