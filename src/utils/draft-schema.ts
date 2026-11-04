/** Key the editor used for every form's draft before drafts were kept per form. */
const legacyDraftKey = 'formJSON';

/**
 * Returns the localStorage key under which the editor keeps the draft schema of a form.
 * Forms that haven't been saved yet share the `new` key.
 */
export function getDraftSchemaKey(formUuid?: string) {
  return `formJSON:${formUuid ?? 'new'}`;
}

/**
 * Returns the stored draft for a form, if there is one. A draft written under the old shared key is
 * moved to the form's own key when its `uuid` shows it belongs to this form.
 */
export function getDraftSchema(formUuid?: string): string | null {
  const draftKey = getDraftSchemaKey(formUuid);
  const draft = localStorage.getItem(draftKey);
  if (draft || !formUuid) {
    return draft;
  }

  const legacyDraft = localStorage.getItem(legacyDraftKey);
  if (!legacyDraft) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(legacyDraft);
    if (typeof parsed === 'object' && parsed !== null && (parsed as { uuid?: string }).uuid === formUuid) {
      localStorage.setItem(draftKey, legacyDraft);
      localStorage.removeItem(legacyDraftKey);
      return legacyDraft;
    }
  } catch {
    // Not JSON, so not a draft worth carrying over.
  }
  return null;
}
