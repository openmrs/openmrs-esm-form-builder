/**
 * Returns the localStorage key under which the editor keeps the draft schema of a form.
 * Forms that haven't been saved yet share the `new` key.
 */
export function getDraftSchemaKey(formUuid?: string) {
  return `formJSON:${formUuid ?? 'new'}`;
}
