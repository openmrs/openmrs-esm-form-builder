import React, { useCallback } from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { showSnackbar } from '@openmrs/esm-framework';
import { type Action, type Condition, type FormRule } from './rule-builder.component';
import { type Schema } from '../../types';
import { findQuestionIndices } from '../utils';
import styles from '../modals.scss';

interface DeleteConditionalLogicModalProps {
  closeModal: () => void;
  questionId?: string;
  questionLabel: string;
  ruleId?: string;
  currentRule: FormRule;
  rules?: Array<FormRule>;
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  handleAddLogic?: (fieldId: string) => void;
  setConditions?: React.Dispatch<React.SetStateAction<Array<Condition>>>;
  setActions?: React.Dispatch<React.SetStateAction<Array<Action>>>;
  setCurrentRule?: React.Dispatch<React.SetStateAction<FormRule>>;
  setRules: React.Dispatch<React.SetStateAction<Array<FormRule>>>;
  deleteAll?: boolean; // Flag to determine if all conditional logic should be deleted
  setRuleDeleted: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteConditionalLogicModal: React.FC<DeleteConditionalLogicModalProps> = ({
  closeModal,
  questionId,
  questionLabel,
  currentRule,
  schema,
  onSchemaChange,
  handleAddLogic,
  setConditions,
  setActions,
  setCurrentRule,
  setRules,
  rules,
  deleteAll = false,
  setRuleDeleted,
}) => {
  const { t } = useTranslation();

  const deleteQuestionHideProperty = useCallback(
    (schema: Schema, pageIndex: number, sectionIndex: number, questionIndex: number) => {
      const updatedSchema = { ...schema };
      delete updatedSchema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].hide;
      onSchemaChange(updatedSchema);
      return updatedSchema;
    },
    [onSchemaChange],
  );

  const deleteValidatorProperty = useCallback(
    (schema: Schema, pageIndex: number, sectionIndex: number, questionIndex: number, errorMessage: string) => {
      if (!errorMessage) return;
      const updatedSchema = { ...schema };
      const validatorIndex = currentRule?.validatorIndex;
      const question = updatedSchema.pages[pageIndex].sections[sectionIndex].questions[questionIndex];
      const validators = question.validators;
      const questionId = question.id;
      const existingValidator =
        validatorIndex >= 1
          ? updatedSchema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].validators[
              validatorIndex - 1
            ]
          : undefined;
      const existingValidatorIndex = validators.findIndex((validator) => validator === existingValidator);
      if (existingValidatorIndex !== -1) {
        validators?.splice(existingValidatorIndex, 1);
      }
      setRules((prevRules) => {
        const updatedRules = prevRules.map((rule) => {
          const updatedRule = { ...rule };
          if (updatedRule.actions[0]?.actionField === questionId && validatorIndex < updatedRule.validatorIndex) {
            updatedRule.validatorIndex -= 1;
          }
          return updatedRule;
        });
        return updatedRules;
      });
      onSchemaChange(updatedSchema);
      return updatedSchema;
    },
    [currentRule?.validatorIndex, onSchemaChange, setRules],
  );

  const deleteRuleFromSchema = useCallback(
    (schema: Schema, rule: FormRule) => {
      const { pageIndex, sectionIndex, questionIndex } = findQuestionIndices(schema, rule?.actions[0]?.actionField);

      if (pageIndex === -1 || sectionIndex === -1 || questionIndex === -1) {
        return schema;
      }

      const action = rule?.actions[0];
      let updatedSchema = { ...schema };

      switch (action?.actionCondition) {
        case 'Hide':
          updatedSchema = deleteQuestionHideProperty(updatedSchema, pageIndex, sectionIndex, questionIndex);
          break;
        case 'Fail':
          updatedSchema = deleteValidatorProperty(
            updatedSchema,
            pageIndex,
            sectionIndex,
            questionIndex,
            action?.errorMessage,
          );
          break;
      }

      return updatedSchema;
    },
    [deleteQuestionHideProperty, deleteValidatorProperty],
  );

  const deleteAllConditionalLogic = useCallback(() => {
    try {
      if (handleAddLogic && questionId) handleAddLogic(questionId);
      if (setConditions) setConditions([]);
      if (setActions) setActions([]);
      if (setCurrentRule) setCurrentRule({ id: uuid(), question: questionId });
      setRules((prevRule: Array<FormRule>) => prevRule.filter((rule) => rule.question !== questionId));

      showSnackbar({
        title: t(
          'conditionalLogicDeletedMessage',
          'Conditional logic for the question "{{- questionLabel}}" has been deleted',
          { questionLabel: questionLabel },
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

  const deleteSpecificConditionalLogic = useCallback(() => {
    try {
      setRules((prevRule: Array<FormRule>) => {
        const newRule = [...prevRule];
        const elementIndex = rules?.findIndex((e) => e.id === currentRule?.id);
        if (elementIndex !== -1) {
          newRule.splice(elementIndex, 1);
        }
        return newRule;
      });

      const updatedSchema = deleteRuleFromSchema(schema, currentRule);
      onSchemaChange(updatedSchema);
      setRuleDeleted(true);
      showSnackbar({
        title: t(
          'targetedConditionalLogicDeletedMessage',
          'The specific conditional logic associated with "{{- questionLabel}}" has been successfully deleted.',
          { questionLabel: questionLabel },
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
  }, [
    setRules,
    deleteRuleFromSchema,
    schema,
    currentRule,
    onSchemaChange,
    setRuleDeleted,
    t,
    questionLabel,
    rules,
    closeModal,
  ]);

  const deleteLogic = deleteAll ? deleteAllConditionalLogic : deleteSpecificConditionalLogic;

  return (
    <div>
      <ModalHeader
        className={styles.modalHeader}
        closeModal={closeModal}
        title={
          deleteAll
            ? t('deleteConditionalLogicConfirmation', 'Are you sure you want to delete this logic?')
            : t(
                'deleteTargetedConditionalLogicConfirmation',
                'Are you sure you want to delete the selected conditional logic?',
              )
        }
      />
      <ModalBody>
        <p>
          {deleteAll
            ? t(
                'deleteConditionalLogicExplainerText',
                'Deleting this logic will delete all the conditional logics associated with it. This action cannot be undone.',
              )
            : t(
                'deleteTargetedConditionalLogicExplainerText',
                'Deleting this selected conditional logic will permanently delete it from the field. This action cannot be undone.',
              )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={deleteLogic}>
          <span>
            {deleteAll
              ? t('deleteConditionalLogic', 'Delete conditional logic?')
              : t('confirmDeleteSpecificConditionalLogic', 'Delete selected conditional logic?')}
          </span>
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteConditionalLogicModal;
