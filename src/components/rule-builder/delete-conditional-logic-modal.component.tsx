import { ModalHeader } from '@carbon/react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalBody } from '@carbon/react';
import { ModalFooter } from '@carbon/react';
import { Button } from '@carbon/react';
import { type Action, type Condition, type formRule } from './rule-builder.component';
import { v4 as uuid } from 'uuid';
import { showSnackbar } from '@openmrs/esm-framework';

interface DeleteConditionalLogicModalProps {
  closeModal: () => void;
  questionId: string;
  questionLabel: string;
  handleAddLogic: (fieldId: string) => void;
  setConditions: React.Dispatch<React.SetStateAction<Array<Condition>>>;
  setActions: React.Dispatch<React.SetStateAction<Array<Action>>>;
  setCurrentRule: React.Dispatch<React.SetStateAction<formRule>>;
  setRules: React.Dispatch<React.SetStateAction<Array<formRule>>>;
}

const DeleteConditionalLogic = ({
  closeModal,
  questionLabel,
  questionId,
  handleAddLogic,
  setConditions,
  setActions,
  setCurrentRule,
  setRules,
}: DeleteConditionalLogicModalProps) => {
  const { t } = useTranslation();
  const deleteConditionalLogic = useCallback(() => {
    try {
      handleAddLogic(questionId);
      setConditions([]);
      setActions([]);
      setCurrentRule({ id: uuid(), question: questionId });
      setRules((prevRule: Array<formRule>) => {
        return prevRule.filter((rule) => rule.question !== questionId);
      });
      showSnackbar({
        title: t(
          'conditionalLogicDeletedMessage',
          'Conditional logic for the question "{{- questionLabel}}" has been deleted',
          {
            questionLabel: questionLabel,
          },
        ),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorDeletingConditionalLogic', 'Error deleting conditional logic'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    } finally {
      closeModal();
    }
  }, [closeModal, questionLabel, handleAddLogic, questionId, setActions, setConditions, setCurrentRule, setRules, t]);
  return (
    <div>
      <ModalHeader
        closeModal={closeModal}
        title={t('deleteConditionalLogicConfirmation', 'Are you sure you want to delete this logic ?')}
      />
      <ModalBody>
        <p>
          {t(
            'deleteConditionalLogicExplainerText',
            'Deleting this logic will delete all the conditional logics associated with it. This action cannot be undone.',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          kind="danger"
          onClick={() => {
            deleteConditionalLogic();
          }}
        >
          <span>{t('deleteConditionalLogic', 'Delete conditional logic')}</span>
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteConditionalLogic;
