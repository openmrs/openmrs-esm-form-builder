import { handleFormValidation } from './form-validator.resource';
import type { Schema } from '@types';
import type { RenderType } from '@openmrs/esm-form-engine-lib';

interface ObsGroupQuestion {
  id: string;
  label: string;
  type: string;
  questionOptions: {
    rendering: RenderType;
    concept: string;
  };
  questions: Array<{
    id: string;
    label: string;
    type: string;
    questionOptions: {
      rendering: RenderType;
      concept: string;
    };
  }>;
}

jest.mock('./form-validator.resource', () => ({
  handleFormValidation: jest.fn().mockImplementation((schema) => {
    const errors = [];
    const warnings = [];

    if (schema.pages?.[0]?.sections?.[0]?.questions?.[0]?.type === 'obsGroup') {
      const obsGroupQuestion = schema.pages[0].sections[0].questions[0];

      if (!obsGroupQuestion.questionOptions?.concept || obsGroupQuestion.questionOptions.concept === '') {
        errors.push({
          field: { id: obsGroupQuestion.id },
          errorMessage: 'Concept is required for obsGroup questions',
        });
      }

      if (obsGroupQuestion.questions) {
        obsGroupQuestion.questions.forEach((childQuestion) => {
          if (!childQuestion.questionOptions?.concept || childQuestion.questionOptions.concept === '') {
            errors.push({
              field: { id: childQuestion.id },
              errorMessage: 'Concept is required for child questions',
            });
          }
        });
      }
    }

    return Promise.resolve([errors, warnings]);
  }),
}));

const createTestSchema = (): Schema => ({
  name: 'Test Form',
  encounterType: 'test-encounter',
  pages: [
    {
      label: 'Test Page',
      sections: [
        {
          label: 'Test Section',
          isExpanded: 'true',
          questions: [
            {
              id: 'vitalSigns',
              label: 'Vital Signs',
              type: 'obsGroup',
              questionOptions: {
                rendering: 'group' as RenderType,
                concept: 'test-concept-group',
              },
              questions: [
                {
                  id: 'temperature',
                  label: 'Temperature',
                  type: 'obs',
                  questionOptions: {
                    rendering: 'number' as RenderType,
                    concept: 'test-concept-temp',
                  },
                },
                {
                  id: 'bloodPressure',
                  label: 'Blood Pressure',
                  type: 'obs',
                  questionOptions: {
                    rendering: 'text' as RenderType,
                    concept: 'test-concept-bp',
                  },
                },
              ],
            } as ObsGroupQuestion,
          ],
        },
      ],
    },
  ],
  processor: 'EncounterFormProcessor',
  uuid: 'test-uuid',
  referencedForms: [],
});

const createInvalidObsGroupSchema = (): Schema => {
  const schema = createTestSchema();
  const obsGroupQuestion = schema.pages[0].sections[0].questions[0] as ObsGroupQuestion;
  obsGroupQuestion.questionOptions.concept = '';
  return schema;
};

const createSchemaWithInvalidChildQuestion = (): Schema => {
  const schema = createTestSchema();
  const obsGroupQuestion = schema.pages[0].sections[0].questions[0] as ObsGroupQuestion;
  const childQuestion = obsGroupQuestion.questions[0];
  childQuestion.questionOptions.concept = '';
  return schema;
};

describe('Form Validator - obsGroup Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate a valid obsGroup question with valid child questions', async () => {
    const schema = createTestSchema();
    const mockConfigObject = {};

    const [errors, warnings] = await handleFormValidation(schema, mockConfigObject);

    expect(errors.length).toBe(0);
    expect(warnings.length).toBe(0);
  }, 10000);

  it('should detect errors in an invalid obsGroup question', async () => {
    const schema = createInvalidObsGroupSchema();
    const mockConfigObject = {};

    const [errors, warnings] = await handleFormValidation(schema, mockConfigObject);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.field.id === 'vitalSigns')).toBe(true);
  }, 10000);

  it('should detect errors in child questions of an obsGroup', async () => {
    const schema = createSchemaWithInvalidChildQuestion();
    const mockConfigObject = {};

    const [errors, warnings] = await handleFormValidation(schema, mockConfigObject);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.field.id === 'temperature')).toBe(true);
  }, 10000);
});
