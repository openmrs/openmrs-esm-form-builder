import React, { useCallback } from 'react';
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
  subQuestionIndex?: number;
  resetIndices: () => void;
}

const getAllQuestionIds = (questions?: FormField[]): string[] => {
  if (!questions) return [];
  return flattenDeep(questions.map((question) => [question.id, getAllQuestionIds(question.questions)]));
};

const QuestionModalContent: React.FC<QuestionModalProps> = ({
  formField: formFieldProp,
  closeModal,
  schema,
  pageIndex,
  sectionIndex,
  questionIndex,
  subQuestionIndex,
  onSchemaChange,
}) => {
  const { t } = useTranslation();
  const { formField, setFormField, isConceptValid } = useFormField();

  /**
   * NOTE - this does not support nested obsGroup questions
   */
  const checkIfQuestionIdExists = useCallback(
    (idToTest: string): boolean => {
      // Get all IDs from the schema
      const schemaIds: string[] =
        schema?.pages?.flatMap((page) => page?.sections?.flatMap((section) => getAllQuestionIds(section.questions))) ||
        [];

      // Get all IDs from the obsGroup questions
      const formFieldIds: string[] = formField?.questions ? getAllQuestionIds(formField.questions) : [];

      // The main question's id
      formFieldIds.push(formField.id);

      const originalFormFieldQuestionIds =
        formFieldProp && formFieldProp.id !== '' ? getAllQuestionIds(formFieldProp.questions) : [];

      if (formFieldProp && formFieldProp.id !== '') originalFormFieldQuestionIds.push(formFieldProp.id);

      // Remove the ids from the original question from the schema ids
      const filteredSchemaIds = schemaIds.slice(); // Create a copy to modify
      originalFormFieldQuestionIds.forEach((idToRemove) => {
        const indexToRemove = filteredSchemaIds.indexOf(idToRemove);
        if (indexToRemove !== -1) {
          filteredSchemaIds.splice(indexToRemove, 1);
        }
      });

      // Combine both arrays, along with the parent question ID and count occurrences of the ID
      const allIds = [...filteredSchemaIds, ...formFieldIds];
      const occurrences = allIds.filter((id) => id === idToTest).length;

      return occurrences > 1;
    },
    [schema, formField, formFieldProp],
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
        if(subQuestionIndex !== undefined && subQuestionIndex !== null) {
          schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].questions[subQuestionIndex] = formField;
        } else {
          schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex] = formField;
        }
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
        closeModal={closeModal}
        title={formFieldProp ? t('editQuestion', 'Edit question') : t('createNewQuestion', 'Create a new question')}
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
                      open={index === formField.questions?.length - 1}
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
              !isConceptValid ||
              (formField.type === 'obs' &&
                (!formField.questionOptions?.concept || formField.questionOptions?.concept === '')) ||
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
      <FormFieldProvider
        initialFormField={props.formField ?? { type: 'control', questionOptions: { rendering: 'text' }, id: '' }}
      >
        <QuestionModalContent {...props} />
      </FormFieldProvider>
    </>
  );
};

export default QuestionModal;
