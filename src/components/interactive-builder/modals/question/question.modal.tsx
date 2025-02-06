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
  resetIndices: () => void;
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

  const checkIfQuestionIdExists = useCallback(
    (idToTest: string): boolean => {
      if (formFieldProp) return false;
      const nestedIds = schema?.pages?.map((page) => {
        return page?.sections?.map((section) => {
          return section?.questions?.map((question) => {
            question.questions?.map((nestedQuestion) => {
              return nestedQuestion.id;
            });
            return question.id;
          });
        });
      });
      const questionIds: Array<string> = flattenDeep(nestedIds);
      return questionIds.includes(idToTest);
    },
    [formFieldProp, schema],
  );

  const addObsGroupQuestion = useCallback(() => {
    const emptyQuestion: FormField = {
      type: '',
      questionOptions: undefined,
      id: '', // new question without an id initially
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
                      key={question.id || index}
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
              checkIfQuestionIdExists(formField.id) ||
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
