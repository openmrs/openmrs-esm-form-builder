import { ModalHeader, ModalBody, ModalFooter, Button } from '@carbon/react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { type Action, type Condition, type FormRule } from './rule-builder.component';
import { v4 as uuid } from 'uuid';
import { showSnackbar } from '@openmrs/esm-framework';
import { type Schema } from '../../types';

interface DeleteConditionalLogicModalProps {
  closeModal: () => void;
  questionId?: string;
  questionLabel: string;
  ruleId?: string;
  currentRule: FormRule;
  rules?: Array<FormRule>;
  validatorIndex: number;
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  handleAddLogic?: (fieldId: string) => void;
  setvalidatorIndex: React.Dispatch<React.SetStateAction<number>>;
  setConditions?: React.Dispatch<React.SetStateAction<Array<Condition>>>;
  setActions?: React.Dispatch<React.SetStateAction<Array<Action>>>;
  setCurrentRule?: React.Dispatch<React.SetStateAction<FormRule>>;
  setRules: React.Dispatch<React.SetStateAction<Array<FormRule>>>;
  deleteAll?: boolean; // Flag to determine if all conditional logic should be deleted
}

const DeleteConditionalLogicModal = ({
  closeModal,
  questionId,
  questionLabel,
  ruleId,
  currentRule,
  schema,
  validatorIndex,
  onSchemaChange,
  handleAddLogic,
  setConditions,
  setActions,
  setCurrentRule,
  setRules,
  rules,
  deleteAll = false,
}: DeleteConditionalLogicModalProps) => {
  const { t } = useTranslation();

  const findQuestionIndexes = (schema: Schema, actionField: string) => {
    let pageIndex = -1,
      sectionIndex = -1,
      questionIndex = -1;
    schema.pages.forEach((page, pIndex) => {
      page.sections?.forEach((section, sIndex) => {
        section.questions.forEach((question, qIndex) => {
          if (question.id === actionField) {
            pageIndex = pIndex;
            sectionIndex = sIndex;
            questionIndex = qIndex;
          }
        });
      });
    });
    return { pageIndex, sectionIndex, questionIndex };
  };

  const deleteQuestionHideProperty = (
    schema: Schema,
    pageIndex: number,
    sectionIndex: number,
    questionIndex: number,
  ) => {
    delete schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].hide;
  };

  const deleteValidatorProperty = useCallback(
    (schema: Schema, pageIndex: number, sectionIndex: number, questionIndex: number, errorMessage: string) => {
      if (!errorMessage) return;

      const validators = schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].validators;
      const existingValidator =
        validatorIndex >= 1
          ? schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].validators[validatorIndex - 1]
          : undefined;
      const existingValidatorIndex = validators.findIndex((validator) => validator === existingValidator);
      if (existingValidatorIndex !== -1) {
        validators?.splice(existingValidatorIndex, 1);
      }
    },
    [validatorIndex],
  );

  const deleteRuleFromSchema = useCallback(
    (schema: Schema, rule: FormRule) => {
      const { pageIndex, sectionIndex, questionIndex } = findQuestionIndexes(schema, rule?.actions[0]?.actionField);

      if (pageIndex === -1 || sectionIndex === -1 || questionIndex === -1) {
        return schema;
      }

      const action = rule?.actions[0];
      const newSchema = { ...schema };

      switch (action?.actionCondition) {
        case 'Hide':
          deleteQuestionHideProperty(newSchema, pageIndex, sectionIndex, questionIndex);
          break;
        case 'Fail':
          deleteValidatorProperty(newSchema, pageIndex, sectionIndex, questionIndex, action?.errorMessage);
          break;
        default:
          break;
      }

      return newSchema;
    },
    [deleteValidatorProperty],
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
        const elementIndex = rules?.findIndex((e) => e.id === ruleId);
        if (elementIndex !== -1) {
          newRule.splice(elementIndex, 1);
        }
        return newRule;
      });
      const updatedSchema = deleteRuleFromSchema(schema, currentRule);
      onSchemaChange(updatedSchema);
      setCurrentRule({ id: uuid(), question: questionId });
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
    setCurrentRule,
    questionId,
    t,
    questionLabel,
    rules,
    ruleId,
    closeModal,
  ]);

  const deleteLogic = deleteAll ? deleteAllConditionalLogic : deleteSpecificConditionalLogic;

  return (
    <div>
      <ModalHeader
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
        <Button
          kind="danger"
          onClick={() => {
            deleteLogic();
          }}
        >
          <span>
            {deleteAll
              ? t('deleteConditionalLogic', 'Delete conditional logic')
              : t('confirmDeleteSpecificConditionalLogic', 'Delete selected conditional logic?')}
          </span>
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteConditionalLogicModal;
