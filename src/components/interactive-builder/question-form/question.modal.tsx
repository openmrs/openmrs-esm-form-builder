import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import flattenDeep from 'lodash-es/flattenDeep';
import { ModalHeader, Form, ModalBody, FormGroup, Button, Stack, ModalFooter } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import Question from './question/question.component';
import type { FormField, FormSchema } from '@openmrs/esm-form-engine-lib';
import styles from './question-modal.scss';

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
  onSchemaChange,
}) => {
  const { t } = useTranslation();
  const [formField, setFormField] = useState<FormField>(
    formFieldProp ?? { type: '', questionOptions: undefined, id: '' },
  );

  const checkIfQuestionIdExists = (idToTest: string) => {
    const nestedIds = schema?.pages?.map((page) => {
      return page?.sections?.map((section) => {
        return section?.questions?.map((question) => {
          return question.id;
        });
      });
    });

    const questionIds: Array<string> = flattenDeep(nestedIds);
    return questionIds.includes(idToTest);
  };

  const addObsGroupQuestion = () => {
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
  };

  const createQuestion = () => {
    try {
      schema.pages[pageIndex]?.sections?.[sectionIndex]?.questions?.push(formField);

      onSchemaChange({ ...schema });

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('questionCreated', 'New question created'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorCreatingQuestion', 'Error creating question'),
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
              <Question formField={formField} setFormField={updateFormField} schema={schema} />
              {formField.questions?.length > 1 &&
                formField.questions.map((question) => (
                  <Question formField={question} setFormField={updateFormField} schema={schema} />
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
            onClick={createQuestion}
          >
            <span>{t('save', 'Save')}</span>
          </Button>
        </ModalFooter>
      </Form>
    </>
  );
};

export default QuestionModal;
