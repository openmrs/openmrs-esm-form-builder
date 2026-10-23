import { nestableQuestionTypes } from '@constants';
import type { QuestionType } from '@constants';
import type { FormField } from '@openmrs/esm-form-engine-lib';

/**
 * Returns the question as it should be saved: without nested questions unless its type can
 * group them. The editor keeps children in the draft while the question type is being
 * changed, so switching back to a grouping type restores them; this makes sure the saved
 * schema doesn't keep orphaned children, e.g. an `obs` carrying the questions of a former
 * `obsGroup`.
 */
export function withoutOrphanedQuestions(formField: FormField): FormField {
  if (nestableQuestionTypes.includes(formField.type as QuestionType)) {
    return formField;
  }
  const { questions, ...fieldWithoutNestedQuestions } = formField;
  return fieldWithoutNestedQuestions;
}
