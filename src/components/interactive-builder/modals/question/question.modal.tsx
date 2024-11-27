import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import flattenDeep from 'lodash-es/flattenDeep';
import { ModalHeader, Form, ModalBody, FormGroup, Button, Stack, ModalFooter } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import Question from './question-form/question/question.component';
import type { FormField, FormSchema } from '@openmrs/esm-form-engine-lib';
import styles from './question.scss';

interface QuestionModalProps {
  formField?: FormField;
  closeModal: () => void;
  onSchemaChange: (schema: FormSchema) => void;
  pageIndex: number;
  questionIndex: number;
  resetIndices: () => void;
  schema: FormSchema;
  sectionIndex: number;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  formField: formFieldProp,
  closeModal,
  schema,
  pageIndex,
  sectionIndex,
  questionIndex,
  onSchemaChange,
}) => {
  const { t } = useTranslation();
  const [formField, setFormField] = useState<FormField>(
    formFieldProp ?? { type: '', questionOptions: undefined, id: '' },
  );

  const checkIfQuestionIdExists = useCallback(
    (idToTest: string): boolean => {
      if (formFieldProp) return false;
      else {
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
      }
    },
    [formFieldProp, schema],
  );

  const addObsGroupQuestion = useCallback(() => {
    const emptyQuestion: FormField = {
      type: '',
      questionOptions: undefined,
      id: '',
    };
    const newFormField: FormField = {
      ...formField,
      questions: formField.questions ? [...formField.questions, emptyQuestion] : [emptyQuestion],
    };
    setFormField(newFormField);
  }, [formField, setFormField]);

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

  const updateFormField = useCallback(
    (updatedFormField: FormField) => {
      setFormField(updatedFormField);
    },
    [setFormField],
  );

  const updateObsGroupQuestion = useCallback(
    (updatedObsGroupFormField: FormField) => {
      const formFieldCopy = { ...formField };
      if (formFieldCopy.questions.length === 1 && formFieldCopy.questions[0].id === '') {
        formFieldCopy.questions[0] = updatedObsGroupFormField;
      } else {
        formFieldCopy.questions.push(updatedObsGroupFormField);
      }
      setFormField(formFieldCopy);
    },
    [formField, setFormField],
  );

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        title={t('createNewQuestion', 'Create a new question')}
        closeModal={closeModal}
      />
      <Form className={styles.form} onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody hasScrollingContent>
          <FormGroup>
            <Stack gap={5}>
              <Question
                formField={formField}
                setFormField={updateFormField}
                checkIfQuestionIdExists={checkIfQuestionIdExists}
              />
              {formField.questions?.length > 1 &&
                formField.questions.map((question) => (
                  <Question
                    formField={question}
                    setFormField={updateObsGroupQuestion}
                    checkIfQuestionIdExists={checkIfQuestionIdExists}
                  />
                ))}
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

export default QuestionModal;
