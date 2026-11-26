import type { SchemaObject } from 'ajv';
import formSchema from '../form.schema.json';

// Bundled rather than fetched from https://json.openmrs.org/form.schema.json, because OpenMRS must work without
// internet access and the reference application's Content Security Policy blocks requests to other origins.
export function useStandardFormSchema(): { schema: SchemaObject; schemaProperties: Record<string, unknown> } {
  return {
    schema: formSchema,
    schemaProperties: formSchema.properties,
  };
}
