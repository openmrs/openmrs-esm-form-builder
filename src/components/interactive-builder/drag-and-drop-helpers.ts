import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { Schema } from '../../types';

export interface DragQuestionData {
  type: 'question' | 'obsQuestion';
  question: {
    pageIndex: number;
    sectionIndex: number;
    questionIndex: number;
    subQuestionIndex?: number;
    question: FormField;
  };
}

/**
 * Atomically moves a question from one location to another within the schema.
 * Deep-clones the schema first so the original is never mutated.
 * Returns the new schema on success, or undefined if either step fails.
 */
export function moveQuestion(
  schema: Schema,
  activeQuestion: DragQuestionData,
  overQuestion: DragQuestionData,
  overId: string | number,
): Schema | undefined {
  if (!activeQuestion.question.question) {
    return undefined;
  }

  const clonedSchema: Schema = JSON.parse(JSON.stringify(schema));

  // Clone the question being moved so the returned schema shares no
  // references with the original.
  const clonedActive: DragQuestionData = {
    ...activeQuestion,
    question: {
      ...activeQuestion.question,
      question: JSON.parse(JSON.stringify(activeQuestion.question.question)),
    },
  };

  const afterDelete = deleteFromSource(clonedSchema, clonedActive);
  if (!afterDelete) {
    return undefined;
  }

  const afterInsert = addToDestination(afterDelete, clonedActive, overQuestion, overId);
  if (!afterInsert) {
    return undefined;
  }

  return afterInsert;
}

function deleteFromSource(schema: Schema, activeQuestion: DragQuestionData): Schema | undefined {
  const { pageIndex, sectionIndex } = activeQuestion.question;

  if (activeQuestion.type === 'obsQuestion') {
    const targetQuestion =
      schema.pages[pageIndex]?.sections[sectionIndex]?.questions?.[activeQuestion.question.questionIndex];
    if (!targetQuestion?.questions) {
      return undefined;
    }
    const removed = targetQuestion.questions.splice(activeQuestion.question.subQuestionIndex, 1);
    return removed.length > 0 ? schema : undefined;
  }

  if (activeQuestion.type === 'question') {
    const questions = schema.pages[pageIndex]?.sections[sectionIndex]?.questions;
    if (!questions) {
      return undefined;
    }
    const removed = questions.splice(activeQuestion.question.questionIndex, 1);
    return removed.length > 0 ? schema : undefined;
  }

  return undefined;
}

function addToDestination(
  schema: Schema,
  activeQuestion: DragQuestionData,
  overQuestion: DragQuestionData,
  overId: string | number,
): Schema | undefined {
  const { pageIndex, sectionIndex } = overQuestion.question;

  if (activeQuestion.type === 'question') {
    const questions = schema.pages[pageIndex]?.sections[sectionIndex]?.questions;
    if (!questions) {
      return undefined;
    }
    const questionIndex = questions.findIndex((q) => q.id === overId);

    if (questionIndex === -1) {
      return undefined;
    }

    if (
      activeQuestion.question.pageIndex === overQuestion.question.pageIndex &&
      overQuestion.question.sectionIndex === activeQuestion.question.sectionIndex
    ) {
      if (activeQuestion.question.questionIndex > overQuestion.question.questionIndex) {
        questions.splice(questionIndex, 0, activeQuestion.question.question);
      } else {
        questions.splice(questionIndex + 1, 0, activeQuestion.question.question);
      }
    } else {
      questions.splice(questionIndex, 0, activeQuestion.question.question);
    }

    return schema;
  } else if (activeQuestion.type === 'obsQuestion') {
    if (overQuestion.type === 'question') {
      const targetQuestion =
        schema.pages[pageIndex]?.sections[sectionIndex]?.questions?.[overQuestion.question.questionIndex];
      if (!targetQuestion?.questions) {
        return undefined;
      }
      targetQuestion.questions.unshift(activeQuestion.question.question);
      return schema;
    }
    if (overQuestion.type === 'obsQuestion') {
      const parentQuestion =
        schema.pages[pageIndex]?.sections[sectionIndex]?.questions?.[overQuestion.question.questionIndex];
      if (!parentQuestion?.questions) {
        return undefined;
      }
      parentQuestion.questions.splice(overQuestion.question.subQuestionIndex, 0, activeQuestion.question.question);
      return schema;
    }
  }

  return undefined;
}
