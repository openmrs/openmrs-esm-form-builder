import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import flattenDeep from 'lodash-es/flattenDeep';
import {
  ModalHeader,
  Form,
  ModalBody,
  FormGroup,
  Button,
  Stack,
  ModalFooter,
  Accordion,
  AccordionItem,
} from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import Question from './question-form/question/question.component';
import { FormFieldProvider, useFormField } from './form-field-context';
import type { FormField, FormSchema } from '@openmrs/esm-form-engine-lib';
import styles from './question.scss';

interface QuestionModalProps {
  schema: FormSchema;
  formField?: FormField;
  closeModal: () => void;
  onSchemaChange: (schema: FormSchema) => void;
  pageIndex: number;
  sectionIndex: number;
  questionIndex: number;
  resetIndices: () => void;
}

/**
 * Common properties that are required for all question types.
 */
const requiredProperties: Array<keyof FormField> = ['id', 'label', 'type', 'questionOptions'];

/**
 * Type-specific properties.
 */
const typeSpecificProperties: Record<string, Array<keyof FormField>> = {
  control: [],
  encounterDatetime: ['datePickerFormat'],
  encounterLocation: [],
  encounterProvider: [],
  encounterRole: [],
  obs: ['required'],
  obsGroup: ['questions'],
  patientIdentifier: [],
  testOrder: [],
  programState: [],
};

/**
 * Merge required properties with type-specific ones.
 */
const allowedPropertiesMapping: Record<string, string[]> = Object.fromEntries(
  Object.entries(typeSpecificProperties).map(([type, props]) => {
    const mergedProps = new Set<string>([...requiredProperties, ...props]);
    return [type, Array.from(mergedProps)];
  }),
);

/**
 * Mapping of allowed keys for the nested questionOptions object per question type.
 */
const allowedQuestionOptionsMapping: Record<string, string[]> = {
  control: ['rendering', 'minLength', 'maxLength'],
  encounterDatetime: ['rendering'],
  encounterLocation: ['rendering'],
  encounterProvider: ['rendering'],
  encounterRole: ['rendering', 'isSearchable'],
  obs: ['rendering', 'concept', 'answers'],
  obsGroup: ['rendering', 'concept'],
  patientIdentifier: ['rendering', 'identifierType', 'minLength', 'maxLength'],
  testOrder: ['rendering'],
  programState: ['rendering', 'programUuid', 'workflowUuid', 'answers'],
};

/**
 * Cleans the given questionOptions object by retaining only allowed keys for the new type.
 */
function cleanQuestionOptionsForType(options: any, newType: string): any {
  const allowedOpts = allowedQuestionOptionsMapping[newType] || [];
  const cleanedOpts = Object.fromEntries(Object.entries(options).filter(([optKey]) => allowedOpts.includes(optKey)));
  // Ensure required property 'rendering' exists if present in the original options.
  if (!('rendering' in cleanedOpts) && options.rendering) {
    cleanedOpts.rendering = options.rendering;
  }
  return cleanedOpts;
}

/**
 * Cleans the given form field by retaining only allowed top‑level properties for the new type.
 * Also cleans nested questionOptions using the nested mapping.
 */
function cleanFormFieldForType(field: FormField, newType: string): FormField {
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

const QuestionModalContent: React.FC<QuestionModalProps> = ({
  formField: formFieldProp,
  closeModal,
  schema,
  pageIndex,
  sectionIndex,
  questionIndex,
  onSchemaChange,
}) => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();
  useEffect(() => {
    if (formField && formField.type) {
      const cleaned = cleanFormFieldForType(formField, formField.type);
      if (JSON.stringify(cleaned) !== JSON.stringify(formField)) {
        setFormField(cleaned);
      }
    }
  }, [formField?.type, formField, setFormField]);

  const getAllQuestionIds = useCallback((questions?: FormField[]): string[] => {
    if (!questions) return [];
    return flattenDeep(questions.map((question) => [question.id, getAllQuestionIds(question.questions)]));
  }, []);

  const checkIfQuestionIdExists = useCallback(
    (idToTest: string): boolean => {
      // Get all IDs from the schema
      const schemaIds: string[] =
        schema?.pages?.flatMap((page) => page?.sections?.flatMap((section) => getAllQuestionIds(section.questions))) ||
        [];

      // Get all IDs from the current formField's questions array
      const formFieldIds: string[] = formField?.questions ? getAllQuestionIds(formField.questions) : [];

      // Combine both arrays, along with the parent question ID and count occurrences of the ID
      const allIds = [...schemaIds, ...formFieldIds];
      if (!formFieldProp || formFieldProp.id !== formField.id) {
        allIds.push(formField.id);
      }
      const occurrences = allIds.filter((id) => id === idToTest).length;
      return occurrences > 1;
    },
    [schema, getAllQuestionIds, formField, formFieldProp],
  );

  const addObsGroupQuestion = useCallback(() => {
    const emptyQuestion: FormField = {
      type: '',
      questionOptions: undefined,
      id: '',
    };
    setFormField((prevFormField) => ({
      ...prevFormField,
      questions: prevFormField.questions ? [...prevFormField.questions, emptyQuestion] : [emptyQuestion],
    }));
  }, [setFormField]);

  const deleteObsGroupQuestion = useCallback(
    (index: number) => {
      setFormField((prevFormField) => ({
        ...prevFormField,
        questions: prevFormField.questions?.filter((_, i) => i !== index) || [],
      }));
    },
    [setFormField],
  );

  const saveQuestion = () => {
    try {
      if (formFieldProp) {
        schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex] = formField;
      } else {
        schema.pages[pageIndex]?.sections?.[sectionIndex]?.questions?.push(formField);
      }

      onSchemaChange({ ...schema });

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: formFieldProp
          ? t('questionUpdated', 'Question updated')
          : t('questionCreated', 'New question created'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorSavingQuestion', 'Error saving question'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
    closeModal();
  };

  const handleUpdateParentFormField = useCallback(
    (updatedFormField: FormField, index: number) => {
      setFormField((prevFormField) => {
        const updatedQuestions = [...prevFormField.questions];
        updatedQuestions[index] = updatedFormField;
        return { ...prevFormField, questions: updatedQuestions };
      });
    },
    [setFormField],
  );

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        title={formFieldProp ? t('editQuestion', 'Edit question') : t('createNewQuestion', 'Create a new question')}
        closeModal={closeModal}
      />
      <Form className={styles.form} onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <FormGroup>
            <Stack gap={5}>
              <Question checkIfQuestionIdExists={checkIfQuestionIdExists} />
              {formField.questions?.length >= 1 && (
                <Accordion size="lg">
                  {formField.questions.map((question, index) => (
                    <AccordionItem
                      key={`Question ${index + 1}`}
                      title={question.label ?? `Question ${index + 1}`}
                      open={index === formField.questions.length - 1}
                      className={styles.obsGroupQuestionContent}
                    >
                      <FormFieldProvider
                        initialFormField={question}
                        isObsGrouped={true}
                        updateParentFormField={(updatedFormField) =>
                          handleUpdateParentFormField(updatedFormField, index)
                        }
                      >
                        <Question checkIfQuestionIdExists={checkIfQuestionIdExists} />
                        <Button
                          kind="danger"
                          onClick={() => deleteObsGroupQuestion(index)}
                          className={styles.deleteObsGroupQuestionButton}
                        >
                          {t('deleteQuestion', 'Delete question')}
                        </Button>
                      </FormFieldProvider>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
              {formField.type === 'obsGroup' && (
                <Button onClick={addObsGroupQuestion}>
                  <span>{t('addObsGroupQuestion', 'Add a grouped question')}</span>
                </Button>
              )}
            </Stack>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button onClick={closeModal} kind="secondary">
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            disabled={
              !formField ||
              !formField.id ||
              (!formField.questions && checkIfQuestionIdExists(formField.id)) ||
              !formField.questionOptions?.rendering
            }
            onClick={saveQuestion}
          >
            <span>{t('save', 'Save')}</span>
          </Button>
        </ModalFooter>
      </Form>
    </>
  );
};

const QuestionModal: React.FC<QuestionModalProps> = (props) => {
  return (
    <>
      <FormFieldProvider initialFormField={props.formField ?? { type: 'control', questionOptions: undefined, id: '' }}>
        <QuestionModalContent {...props} />
      </FormFieldProvider>
    </>
  );
};

export default QuestionModal;
