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
 * Mapping of allowed top‑level property keys for each question type.
 * Adjust these keys as needed for your implementation.
 */
const allowedPropertiesMapping: Record<string, string[]> = {
  control: ['id', 'label', 'type', 'questionOptions'],
  encounterDatetime: ['id', 'label', 'type', 'questionOptions', 'datePickerFormat'],
  encounterLocation: ['id', 'label', 'type', 'questionOptions'],
  encounterProvider: ['id', 'label', 'type', 'questionOptions'],
  encounterRole: ['id', 'label', 'type', 'questionOptions'],
  obs: ['id', 'label', 'type', 'questionOptions'],
  obsGroup: ['id', 'label', 'type', 'questionOptions', 'questions'],
  patientIdentifier: ['id', 'label', 'type', 'questionOptions'],
  testOrder: ['id', 'label', 'type', 'questionOptions'],
  programState: ['id', 'label', 'type', 'questionOptions'],
};

/**
 * Mapping of allowed keys for the nested questionOptions object per question type.
 */
const allowedQuestionOptionsMapping: Record<string, string[]> = {
  control: ['rendering', 'minLength', 'maxLength'],
  encounterDatetime: ['rendering'],
  encounterLocation: ['rendering'],
  encounterProvider: ['rendering'],
  encounterRole: ['rendering', 'isSearchable'],
  obs: ['rendering', 'concept'],
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
  const cleaned: Partial<FormField> = {} as Partial<FormField>;

  // Copy only allowed top‑level properties.
  (allowedKeys as (keyof FormField)[]).forEach((key) => {
    if (key in field) {
      (cleaned as any)[key] = field[key];
    }
  });

  // If questionOptions is allowed and exists, clean it using the nested mapping.
  if (cleaned.questionOptions && typeof cleaned.questionOptions === 'object') {
    cleaned.questionOptions = cleanQuestionOptionsForType(cleaned.questionOptions, newType);
  }

  return { ...cleaned, type: newType } as FormField;
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

      // Return true if ID occurs more than once
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

  // Updated deletion: filter out the question by its id.
  const deleteObsGroupQuestion = useCallback(
    (id: string) => {
      setFormField((prevFormField) => ({
        ...prevFormField,
        questions: prevFormField.questions?.filter((q) => q.id !== id) || [],
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
        <ModalBody hasScrollingContent>
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
                          onClick={() => deleteObsGroupQuestion(question.id)}
                          className={styles.deleteObsGroupQuestionButton}
                        >
                          {t('deleteQuestion', 'Delete')}
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
