import { moveQuestion, type DragQuestionData } from './drag-and-drop-helpers';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { Schema } from '../../types';

const dummyFormField = { id: '_', label: '_', type: 'obs', questionOptions: { rendering: 'text' } } as FormField;

function makeSchema(): Schema {
  return {
    name: 'Test Form',
    pages: [
      {
        label: 'Page 1',
        sections: [
          {
            label: 'Section A',
            isExpanded: 'true',
            questions: [
              { id: 'q1', label: 'Question 1', type: 'obs', questionOptions: { rendering: 'text', concept: 'c1' } },
              { id: 'q2', label: 'Question 2', type: 'obs', questionOptions: { rendering: 'text', concept: 'c2' } },
              { id: 'q3', label: 'Question 3', type: 'obs', questionOptions: { rendering: 'text', concept: 'c3' } },
            ],
          },
        ],
      },
    ],
    processor: 'EncounterFormProcessor',
    uuid: 'test-uuid',
    encounterType: '',
    referencedForms: [],
    version: '1.0',
  } as unknown as Schema;
}

function makeSchemaWithObsGroup(): Schema {
  return {
    name: 'Test Form',
    pages: [
      {
        label: 'Page 1',
        sections: [
          {
            label: 'Section A',
            isExpanded: 'true',
            questions: [
              {
                id: 'obsGroup1',
                label: 'Obs Group 1',
                type: 'obsGroup',
                questionOptions: { rendering: 'group', concept: 'cg1' },
                questions: [
                  { id: 'sub1', label: 'Sub 1', type: 'obs', questionOptions: { rendering: 'text', concept: 'cs1' } },
                  { id: 'sub2', label: 'Sub 2', type: 'obs', questionOptions: { rendering: 'text', concept: 'cs2' } },
                  { id: 'sub3', label: 'Sub 3', type: 'obs', questionOptions: { rendering: 'text', concept: 'cs3' } },
                ],
              },
              {
                id: 'obsGroup2',
                label: 'Obs Group 2',
                type: 'obsGroup',
                questionOptions: { rendering: 'group', concept: 'cg2' },
                questions: [
                  { id: 'sub4', label: 'Sub 4', type: 'obs', questionOptions: { rendering: 'text', concept: 'cs4' } },
                ],
              },
            ],
          },
        ],
      },
    ],
    processor: 'EncounterFormProcessor',
    uuid: 'test-uuid',
    encounterType: '',
    referencedForms: [],
    version: '1.0',
  } as unknown as Schema;
}

describe('moveQuestion', () => {
  it('should return undefined and leave the source schema unchanged for an invalid drop target', () => {
    const schema = makeSchema();
    const original = JSON.parse(JSON.stringify(schema));

    const activeQuestion: DragQuestionData = {
      type: 'question',
      question: {
        pageIndex: 0,
        sectionIndex: 0,
        questionIndex: 0,
        question: schema.pages[0].sections[0].questions[0] as FormField,
      },
    };

    const overQuestion: DragQuestionData = {
      type: 'question',
      question: {
        pageIndex: 0,
        sectionIndex: 99, // invalid section index
        questionIndex: 0,
        question: dummyFormField,
      },
    };

    const result = moveQuestion(schema, activeQuestion, overQuestion, 'nonexistent-id');

    expect(result).toBeUndefined();
    expect(schema).toEqual(original);
  });

  it('should remove the source question and insert it at the destination on a valid move', () => {
    const schema = makeSchema();

    // Move q1 (index 0) to after q3 (index 2) within the same section
    const activeQuestion: DragQuestionData = {
      type: 'question',
      question: {
        pageIndex: 0,
        sectionIndex: 0,
        questionIndex: 0,
        question: schema.pages[0].sections[0].questions[0] as FormField,
      },
    };

    const overQuestion: DragQuestionData = {
      type: 'question',
      question: {
        pageIndex: 0,
        sectionIndex: 0,
        questionIndex: 2,
        question: schema.pages[0].sections[0].questions[2] as FormField,
      },
    };

    // After deleteFromSource removes q1, the array becomes [q2, q3].
    // q3 is now at index 1 with id 'q3'. addToDestination finds q3 by overId,
    // and since activeQuestion.questionIndex (0) < overQuestion.questionIndex (2),
    // it inserts after q3.
    const result = moveQuestion(schema, activeQuestion, overQuestion, 'q3');

    expect(result).toBeDefined();
    const questionIds = result.pages[0].sections[0].questions.map((q) => q.id);
    expect(questionIds).toEqual(['q2', 'q3', 'q1']);

    // Original schema must be untouched (immutability)
    const originalIds = schema.pages[0].sections[0].questions.map((q) => q.id);
    expect(originalIds).toEqual(['q1', 'q2', 'q3']);

    // The moved question must not share a reference with the original
    const movedQuestion = result.pages[0].sections[0].questions[2];
    const originalQuestion = schema.pages[0].sections[0].questions[0];
    expect(movedQuestion).not.toBe(originalQuestion);
    expect(movedQuestion).toEqual(originalQuestion);
  });

  it('should reorder obsQuestion sub-questions within the same parent', () => {
    const schema = makeSchemaWithObsGroup();
    const subQuestions = schema.pages[0].sections[0].questions[0].questions;

    // Move sub1 (subQuestionIndex 0) to position of sub3 (subQuestionIndex 2)
    const activeQuestion: DragQuestionData = {
      type: 'obsQuestion',
      question: {
        pageIndex: 0,
        sectionIndex: 0,
        questionIndex: 0,
        subQuestionIndex: 0,
        question: subQuestions[0] as FormField,
      },
    };

    const overQuestion: DragQuestionData = {
      type: 'obsQuestion',
      question: {
        pageIndex: 0,
        sectionIndex: 0,
        questionIndex: 0,
        subQuestionIndex: 2,
        question: subQuestions[2] as FormField,
      },
    };

    const result = moveQuestion(schema, activeQuestion, overQuestion, 'sub3');

    expect(result).toBeDefined();
    const subIds = result.pages[0].sections[0].questions[0].questions.map((q) => q.id);
    // After delete of sub1: [sub2, sub3]. Insert at subQuestionIndex 2 puts sub1 at end.
    expect(subIds).toEqual(['sub2', 'sub3', 'sub1']);

    // Original untouched
    const originalSubIds = schema.pages[0].sections[0].questions[0].questions.map((q) => q.id);
    expect(originalSubIds).toEqual(['sub1', 'sub2', 'sub3']);
  });

  it('should move an obsQuestion to a different parent question (obsQuestion -> question)', () => {
    const schema = makeSchemaWithObsGroup();
    const subQuestions = schema.pages[0].sections[0].questions[0].questions;

    // Move sub1 from obsGroup1 onto obsGroup2 (drop target is the parent question itself)
    const activeQuestion: DragQuestionData = {
      type: 'obsQuestion',
      question: {
        pageIndex: 0,
        sectionIndex: 0,
        questionIndex: 0,
        subQuestionIndex: 0,
        question: subQuestions[0] as FormField,
      },
    };

    const overQuestion: DragQuestionData = {
      type: 'question',
      question: {
        pageIndex: 0,
        sectionIndex: 0,
        questionIndex: 1, // obsGroup2
        question: schema.pages[0].sections[0].questions[1] as FormField,
      },
    };

    const result = moveQuestion(schema, activeQuestion, overQuestion, 'obsGroup2');

    expect(result).toBeDefined();

    // sub1 removed from obsGroup1
    const group1Ids = result.pages[0].sections[0].questions[0].questions.map((q) => q.id);
    expect(group1Ids).toEqual(['sub2', 'sub3']);

    // sub1 unshifted to front of obsGroup2
    const group2Ids = result.pages[0].sections[0].questions[1].questions.map((q) => q.id);
    expect(group2Ids).toEqual(['sub1', 'sub4']);

    // Original untouched
    expect(schema.pages[0].sections[0].questions[0].questions.map((q) => q.id)).toEqual(['sub1', 'sub2', 'sub3']);
    expect(schema.pages[0].sections[0].questions[1].questions.map((q) => q.id)).toEqual(['sub4']);
  });

  it('should return undefined when subQuestionIndex is out of bounds (stale obsQuestion index)', () => {
    const schema = makeSchemaWithObsGroup();
    const original = JSON.parse(JSON.stringify(schema));
    const subQuestions = schema.pages[0].sections[0].questions[0].questions;

    const activeQuestion: DragQuestionData = {
      type: 'obsQuestion',
      question: {
        pageIndex: 0,
        sectionIndex: 0,
        questionIndex: 0,
        subQuestionIndex: 99, // out of bounds
        question: subQuestions[0] as FormField,
      },
    };

    const overQuestion: DragQuestionData = {
      type: 'obsQuestion',
      question: {
        pageIndex: 0,
        sectionIndex: 0,
        questionIndex: 0,
        subQuestionIndex: 1,
        question: subQuestions[1] as FormField,
      },
    };

    const result = moveQuestion(schema, activeQuestion, overQuestion, 'sub2');

    expect(result).toBeUndefined();
    expect(schema).toEqual(original);
  });

  it('should return undefined when the source questionIndex is out of bounds (stale index)', () => {
    const schema = makeSchema();
    const original = JSON.parse(JSON.stringify(schema));

    const activeQuestion: DragQuestionData = {
      type: 'question',
      question: {
        pageIndex: 0,
        sectionIndex: 0,
        questionIndex: 99, // out of bounds — splice would be a no-op
        question: schema.pages[0].sections[0].questions[0] as FormField,
      },
    };

    const overQuestion: DragQuestionData = {
      type: 'question',
      question: {
        pageIndex: 0,
        sectionIndex: 0,
        questionIndex: 1,
        question: schema.pages[0].sections[0].questions[1] as FormField,
      },
    };

    const result = moveQuestion(schema, activeQuestion, overQuestion, 'q2');

    expect(result).toBeUndefined();
    expect(schema).toEqual(original);
  });
});
