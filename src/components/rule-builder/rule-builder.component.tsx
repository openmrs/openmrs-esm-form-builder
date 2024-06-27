import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { OverflowMenuItem, OverflowMenu, Layer, TextArea, Toggle, Dropdown } from '@carbon/react';
import { Flash, FlowConnection, Link, Help } from '@carbon/react/icons';
import { ConfigurableLink, showModal, useLayoutType, useDebounce } from '@openmrs/esm-framework';
import {
  ActionType,
  ConditionType,
  LogicalOperatorType,
  RenderingType,
  RuleElementType,
  TriggerType,
  type CalculationFunctions,
  type ComparisonOperators,
  type Page,
  type Question,
  type Schema,
  type Section,
} from '../../types';
import { useFormRule } from '../../hooks/useFormRule';
import InputSelectionBox from './input-selection-box.component';
import {
  arrContains,
  calculateFunctions,
  comparisonOperators,
  dateBasedCalculationFunctions,
  emptyStates,
  heightAndWeightBasedCalculationFunctions,
  helpLink,
} from '../../constants';
import styles from './rule-builder.scss';

export interface Condition {
  id: string;
  isNew: boolean;
  logicalOperator?: string;
  targetField?: string;
  targetCondition?: string;
  targetValue?: string;
  targetValues?: Array<{ concept: string; label: string }>;
}

export interface Action {
  id: string;
  isNew: boolean;
  logicalOperator?: string;
  actionCondition?: string;
  actionField?: string;
  calculateField?: string;
  errorMessage?: string;
}

export interface FormRule {
  id: string;
  question: string;
  conditions?: Array<Condition>;
  actions?: Array<Action>;
  isNewRule?: boolean;
}

interface RuleBuilderProps {
  ruleId: string;
  key: string;
  question: Question;
  pageIndex: number;
  sectionIndex: number;
  questionIndex: number;
  onSchemaChange: (schema: Schema) => void;
  isNewRule: boolean;
  schema: Schema;
  handleAddLogic: (fieldId: string) => void;
}

const RuleBuilder = React.memo(
  ({
    ruleId,
    schema,
    onSchemaChange,
    question,
    pageIndex,
    sectionIndex,
    questionIndex,
    isNewRule,
    handleAddLogic,
  }: RuleBuilderProps) => {
    const pages: Array<Page> = schema?.pages || [];
    const sections: Array<Section> = pages.flatMap((page) => page.sections || []);
    const questions: Array<Question> = sections.flatMap((section) => section.questions || []);
    const answers: Array<Record<string, string>> = questions.flatMap((question) => question.questionOptions.answers);

    const { rules, setRules } = useFormRule();
    const [isRequired, setIsRequired] = useState<boolean>(question?.required ? true : false);
    const [isAllowFutureDate, setIsAllowFutureDate] = useState<boolean>(
      question?.validators?.some((validator) =>
        validator.type === (RenderingType.DATE as string) && validator?.allowFutureDates === 'true' ? true : false,
      ),
    );
    const [isDisallowDecimals, setIsDisallowDecimals] = useState<boolean>(question?.questionOptions?.disallowDecimals);
    const [conditions, setConditions] = useState<Array<Condition>>([{ id: uuidv4(), isNew: false }]);
    const [actions, setActions] = useState<Array<Action>>([{ id: uuidv4(), isNew: false }]);
    const [currentRule, setCurrentRule] = useState<FormRule>({
      id: uuidv4(),
      question: question.id,
      actions: actions,
      conditions: conditions,
      isNewRule: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isToggleVisible, setIsToggleVisible] = useState<boolean>(isNewRule);
    const isTablet = useLayoutType() === 'tablet';
    const responsiveSize = isTablet ? 'lg' : 'sm';
    const handleRequiredChange = useCallback(() => {
      if (question) {
        const newSchema = { ...schema };
        newSchema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].required = !question.required;
        onSchemaChange(newSchema);
        setIsRequired((p) => !p);
      }
    }, [pageIndex, sectionIndex, questionIndex, onSchemaChange, question, schema]);

    const checkIfDateValidatorExists = useCallback(() => {
      return schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].validators.some(
        (item) => item['type'] === (RenderingType.DATE as string),
      );
    }, [pageIndex, questionIndex, schema.pages, sectionIndex]);

    const handleAllowFutureDateChange = useCallback(() => {
      const doesValidatorExist = checkIfDateValidatorExists();
      const newSchema = { ...schema };
      const validators = newSchema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].validators;
      const futureDateSchema = { type: 'date', allowFutureDates: 'true' };
      if (!doesValidatorExist) {
        validators.push(futureDateSchema);
        onSchemaChange(newSchema);
        setIsAllowFutureDate(true);
      } else {
        validators?.map((validator) =>
          validator?.type === (RenderingType.DATE as string)
            ? (validator['allowFutureDates'] = isAllowFutureDate ? 'false' : 'true')
            : null,
        );
        onSchemaChange(newSchema);
        isAllowFutureDate ? setIsAllowFutureDate(false) : setIsAllowFutureDate(true);
      }
    }, [checkIfDateValidatorExists, isAllowFutureDate, onSchemaChange, pageIndex, questionIndex, schema, sectionIndex]);

    const checkIfDecimalValidatorExists = useCallback(() => {
      return !!schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].questionOptions.disallowDecimals;
    }, [pageIndex, questionIndex, schema.pages, sectionIndex]);

    const handleDisallowDecimalValueChange = useCallback(() => {
      const doesValidatorExist = checkIfDecimalValidatorExists();
      const updatedSchema = { ...schema };
      const questionOptions =
        updatedSchema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].questionOptions;
      questionOptions.disallowDecimals = doesValidatorExist ? !questionOptions?.disallowDecimals : true;
      setIsDisallowDecimals(questionOptions.disallowDecimals);
      onSchemaChange(updatedSchema);
    }, [checkIfDecimalValidatorExists, onSchemaChange, pageIndex, questionIndex, schema, sectionIndex]);

    const shouldDeleteForHideAction = (action: Action) => {
      return action.calculateField?.length || action.errorMessage?.length || action.actionField?.length;
    };

    const shouldDeleteForFailAction = (action: Action) => {
      return action.calculateField?.length || action.actionField?.length;
    };

    const shouldDeleteForCalculateAction = (action: Action) => {
      return action.actionField?.length || action.errorMessage?.length;
    };

    const deleteProperties = (element: Action | Condition, properties: Array<string>) => {
      properties.forEach((property) => {
        delete element[property];
      });
    };

    const [validatorIndex, setvalidatorIndex] = useState<number>();
    const getSchemaCondition = (
      condition: string,
      targetField?: string,
      answer?: string,
      selectedAnswers?: Array<{
        concept: string;
        label: string;
      }>,
    ) => {
      const selectedConcepts = selectedAnswers?.map((item) => `'${item.concept}'`).join(', ');
      switch (condition) {
        case 'Is Empty':
          return `isEmpty(${targetField})`;
        case 'Not Empty':
          return `!isEmpty(${targetField})`;
        case 'Greater than or equal to':
          return `${targetField} >= ${answer}`;
        case 'Less than or equal to':
          return `${targetField} <= ${answer}`;
        case 'Equals':
          return `${targetField} === '${answer}'`;
        case 'not Equals':
          return `${targetField} !== '${answer}'`;
        case 'Does not match expression':
          return `doesNotMatchExpression('${answer}', ${targetField})`;
        case 'Contains':
          return `arrContains('${targetField}', '${answer}')`;
        case 'Does not contains':
          return `!arrContains('${targetField}', '${answer}')`;
        case 'Contains any':
          return `arrContainsAny(${targetField}, [${selectedConcepts}])`;
        case 'Does not contains any':
          return `!arrContainsAny(${targetField}, ${selectedConcepts})`;
      }
    };

    const getCalculateExpression = (expression: string, height?: string, weight?: string, dateField?: string) => {
      switch (expression) {
        case 'BMI':
          return `calcBMI('${height}', '${weight}')`;
        case 'BSA':
          return `calcBSA('${height}', '${weight}')`;
        case 'Height For Age Zscore':
          return `calcHeightForAgeZscore('${height}', '${weight}')`;
        case 'BMI For Age Zscore':
          return `calcBMIForAgeZscore('${height}', '${weight}')`;
        case 'Weight For Height Zscore':
          return `calcWeightForHeightZscore('${height}', ${weight}})`;
        case 'Expected Delivery Date':
          return `calcEDD('${dateField}')`;
        case 'Months On ART':
          return `calcMonthsOnART('${dateField}')`;
        case 'Age Based On Date':
          return `calcAgeBasedOnDate('${dateField}')`;
      }
    };
    const getLogicalOperator = (logicalOperator: string) => {
      switch (logicalOperator) {
        case 'and':
          return ' && ';
        case 'or':
          return ' || ';
      }
    };

    const ruleHasActions = (rule: FormRule) => {
      return rule?.actions?.some(
        (action: Action) => action?.actionField !== undefined || action?.calculateField !== undefined,
      );
    };

    const ruleHasActionField = (rule: FormRule) => {
      return rule?.actions?.some((action) => action?.actionField !== undefined);
    };

    const ruleHasCalculateField = (rule: FormRule) => {
      return rule?.actions?.some((action) => action?.calculateField !== undefined);
    };

    const buildConditionSchema = useCallback((rule: FormRule) => {
      let conditionSchema = '';
      rule?.conditions?.forEach((condition) => {
        const { targetField, targetCondition, targetValue, logicalOperator, targetValues } = condition;
        const operator = getLogicalOperator(logicalOperator);
        conditionSchema += operator ? operator : '';
        const result = getSchemaCondition(targetCondition, targetField, targetValue, targetValues);
        conditionSchema += result ? result : '';
      });
      return conditionSchema;
    }, []);

    const addOrUpdateValidator = useCallback(
      (
        schema: Schema,
        pageIndex: number,
        sectionIndex: number,
        questionIndex: number,
        conditionSchema: string,
        errorMessage: string,
      ) => {
        const validators = schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].validators;
        const existingValidator =
          validatorIndex >= 1
            ? schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].validators[validatorIndex - 1]
            : undefined;
        if (existingValidator) {
          existingValidator.failsWhenExpression = conditionSchema;
          existingValidator.message = errorMessage;
        } else {
          validators.push({
            type: 'js_expression',
            failsWhenExpression: conditionSchema,
            message: errorMessage,
          });
          setvalidatorIndex(validators.length);
        }
      },
      [validatorIndex],
    );

    const processActionFields = useCallback(
      (rule: FormRule, newSchema: Schema, conditionSchema: string) => {
        rule?.actions?.forEach((action: Action) => {
          const { actionField, actionCondition, errorMessage } = action;
          const { pageIndex, sectionIndex, questionIndex } = findQuestionIndexes(newSchema, actionField);

          if (pageIndex !== -1 && sectionIndex !== -1 && questionIndex !== -1) {
            if (actionCondition === (TriggerType.HIDE as string)) {
              newSchema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].hide = {
                hideWhenExpression: conditionSchema,
              };
            } else if (actionCondition === (TriggerType.FAIL as string) && errorMessage) {
              addOrUpdateValidator(newSchema, pageIndex, sectionIndex, questionIndex, conditionSchema, errorMessage);
            }
          }
        });
      },
      [addOrUpdateValidator],
    );

    const isQuestionIndexValid = (pageIndex: number, sectionIndex: number, questionIndex: number) => {
      return pageIndex !== -1 && sectionIndex !== -1 && questionIndex !== -1;
    };

    const applyCalculationExpressionToSchema = useCallback(
      (rule: FormRule, schema: Schema, height: string, weight: string, dateField?: string, renderingType?: string) => {
        rule?.actions?.forEach((action: Action) => {
          if (action?.actionCondition !== (TriggerType.CALCULATE as string)) return;

          const isDateBased = dateBasedCalculationFunctions.includes(action?.calculateField);
          const isHeightAndWeightBased = heightAndWeightBasedCalculationFunctions.includes(action?.calculateField);

          let calculateExpression = '';
          if (isDateBased) {
            calculateExpression = getCalculateExpression(action?.calculateField, '', '', dateField);
          } else if (isHeightAndWeightBased) {
            calculateExpression = getCalculateExpression(action?.calculateField, height, weight);
          }

          if (!calculateExpression) return;

          const shouldApplyCalculation =
            renderingType === (RenderingType.DATE as string) ||
            isQuestionIndexValid(pageIndex, sectionIndex, questionIndex);
          if (shouldApplyCalculation) {
            schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].questionOptions.calculate = {
              calculateExpression,
            };
          }
        });
      },
      [pageIndex, questionIndex, sectionIndex],
    );

    const removeCalculationExpressionFromSchema = useCallback(
      (schema: Schema) => {
        if (isQuestionIndexValid(pageIndex, sectionIndex, questionIndex)) {
          delete schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].questionOptions?.calculate;
        }
      },
      [pageIndex, questionIndex, sectionIndex],
    );

    const isValidForCalculation = useCallback(
      (
        validConditionsCount: number,
        conditionSchema: string,
        height: string,
        weight: string,
        logicalOperator: string,
      ) => {
        const expectedCondition1 = `!isEmpty(${height}) ${logicalOperator} !isEmpty(${weight})`;
        const expectedCondition2 = `!isEmpty(${weight}) ${logicalOperator} !isEmpty(${height})`;
        return (
          validConditionsCount === 2 &&
          (conditionSchema === expectedCondition1 || conditionSchema === expectedCondition2)
        );
      },
      [],
    );

    const getRenderingType = useCallback(
      (rule: FormRule): string => {
        return rule?.conditions
          ?.map((condition: Condition) => {
            const { pageIndex, sectionIndex, questionIndex } = findQuestionIndexes(schema, condition?.targetField);
            const renderingType: string =
              schema.pages[pageIndex]?.sections[sectionIndex]?.questions[questionIndex]?.questionOptions?.rendering;
            return renderingType;
          })
          .join(',');
      },
      [schema],
    );

    const evaluateConditionsForCalculation = useCallback((rule: FormRule, renderingType: string) => {
      let validConditionsCount = 0;
      let height = '',
        weight = '',
        dateField = '';

      const updateForDateType = (condition: Condition) => {
        dateField = condition.targetField;
      };

      const updateForOtherTypes = (condition: Condition, index: number) => {
        if (condition.targetField !== '') {
          validConditionsCount++;
          if (index === 0) height = condition.targetField;
          else if (index === 1) weight = condition.targetField;
        }
      };

      if (renderingType === (RenderingType.DATE as string)) {
        rule?.conditions?.forEach(updateForDateType);
      } else {
        rule?.conditions?.forEach(updateForOtherTypes);
      }

      return { validConditionsCount, height, weight, dateField };
    }, []);

    const isValidForDateCalculation = useCallback((conditionSchema: string, dateField: string) => {
      return conditionSchema.includes(`!isEmpty(${dateField})`);
    }, []);

    const processCalculateFields = useCallback(
      (rule: FormRule, newSchema: Schema, conditionSchema: string) => {
        const renderingType = getRenderingType(rule);
        const { validConditionsCount, height, weight, dateField } = evaluateConditionsForCalculation(
          rule,
          renderingType,
        );

        if (renderingType === (RenderingType.DATE as string) && isValidForDateCalculation(conditionSchema, dateField)) {
          applyCalculationExpressionToSchema(rule, newSchema, '', '', dateField, renderingType);
          onSchemaChange(newSchema);
          return;
        }

        if (isValidForCalculation(validConditionsCount, conditionSchema, height, weight, '&&')) {
          applyCalculationExpressionToSchema(rule, newSchema, height, weight, '', renderingType);
        } else {
          removeCalculationExpressionFromSchema(newSchema);
        }

        onSchemaChange(newSchema);
      },
      [
        applyCalculationExpressionToSchema,
        evaluateConditionsForCalculation,
        getRenderingType,
        isValidForCalculation,
        isValidForDateCalculation,
        onSchemaChange,
        removeCalculationExpressionFromSchema,
      ],
    );

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

    const handleElementChange = useCallback(
      (
        id: string,
        field: string,
        value: string | Array<{ concept: string; label: string }>,
        index: number,
        element: Array<Condition | Action>,
        setElement: React.Dispatch<React.SetStateAction<Array<Condition | Action>>>,
        elementKey: string,
      ) => {
        const updateElement = (prevElement: Array<Condition | Action>) => {
          const newElement: Array<Condition | Action> = [...prevElement];
          newElement[index] = { ...newElement[index], [field]: value };

          if (elementKey === (RuleElementType.ACTIONS as string) && field === (ActionType.ACTION_CONDITION as string)) {
            updateActionsBasedOnTriggerType(newElement, index, value as string);
          } else if (
            elementKey === (RuleElementType.CONDITIONS as string) &&
            field === (ConditionType.TARGET_CONDITION as string)
          ) {
            updateConditionsBasedOnTargetCondition(newElement, index, value as string);
          }

          clearTargetValueIfEmptyState(newElement, index, elementKey);

          return newElement;
        };

        const updateActionsBasedOnTriggerType = (actions: Array<Action>, index: number, value: string) => {
          const action = actions[index];
          const propertiesToDelete = getPropertiesToDeleteForAction(value, action);
          deleteProperties(action, propertiesToDelete);
          setActions(actions);
        };

        const getPropertiesToDeleteForAction = (triggerType: string, action: Action): Array<string> => {
          switch (triggerType) {
            case TriggerType.HIDE as string:
              return shouldDeleteForHideAction(action)
                ? [ActionType.CALCULATE_FIELD, ActionType.ACTION_FIELD, ActionType.ERROR_MESSAGE]
                : [];
            case TriggerType.FAIL as string:
              return shouldDeleteForFailAction(action) ? [ActionType.CALCULATE_FIELD, ActionType.ACTION_FIELD] : [];
            case TriggerType.CALCULATE as string:
              return shouldDeleteForCalculateAction(action) ? [ActionType.ACTION_FIELD, ActionType.ERROR_MESSAGE] : [];
            default:
              return [];
          }
        };

        const updateConditionsBasedOnTargetCondition = (conditions: Array<Condition>, index: number, value: string) => {
          const condition = conditions[index];
          const propertiesToDelete = arrContains.includes(value)
            ? [ConditionType.TARGET_VALUE]
            : [ConditionType.TARGET_VALUES];
          deleteProperties(condition, propertiesToDelete);
          setConditions(conditions);
        };

        const clearTargetValueIfEmptyState = (
          elements: Array<Condition | Action>,
          index: number,
          elementKey: string,
        ) => {
          if (elementKey === (RuleElementType.CONDITIONS as string)) {
            const condition = elements[index] as Condition;
            if (emptyStates.includes(condition?.targetCondition) && condition?.targetValue) {
              delete condition.targetValue;
            }
          }
        };

        setElement(updateElement);
        setCurrentRule((prevRule) => {
          const newRule = { ...prevRule };
          newRule[elementKey] = updateElement(newRule[elementKey] as Array<Condition>);
          return newRule;
        });
      },
      [],
    );

    const handleActionChange = useCallback(
      (id: string, field: string, value: string, index: number) => {
        handleElementChange(id, field, value, index, actions, setActions, RuleElementType.ACTIONS);
      },
      [actions, handleElementChange],
    );

    const handleConditionChange = useCallback(
      (id: string, field: string, value: string | Array<{ concept: string; label: string }>, index: number) =>
        handleElementChange(id, field, value, index, conditions, setConditions, RuleElementType.CONDITIONS),
      [handleElementChange, conditions],
    );

    const addElement = useCallback(
      (
        elements: Array<Condition | Action>,
        setElements: React.Dispatch<React.SetStateAction<Array<Condition | Action>>>,
        elementKey: string,
        handleElementChange: (id: string, field: string, value: string, index: number) => void,
      ) => {
        const newElement = { id: uuidv4(), isNew: true };
        setElements((prevElements) => [...prevElements, newElement] as Array<Condition>);
        setCurrentRule((prevRule) => {
          const newRule = { ...prevRule };
          newRule[elementKey][elements.length] = newElement;
          return newRule;
        });
        handleElementChange(
          newElement?.id as string,
          ConditionType.LOGICAL_OPERATOR,
          LogicalOperatorType.AND,
          elements.length,
        );
      },
      [],
    );

    const addNewConditionalLogic = useCallback(() => {
      const newRule: FormRule = {
        id: uuidv4(),
        question: question.id,
        actions: [{ id: uuidv4(), isNew: false }],
        conditions: [{ id: uuidv4(), isNew: false }],
        isNewRule: true,
      };
      setRules((prevRule: Array<FormRule>) => {
        const updatedRule = [...prevRule, newRule];
        return updatedRule;
      });
    }, [setRules, question.id]);

    const launchDeleteConditionalLogicModal = useCallback(
      (deleteAll: boolean) => {
        const dispose = showModal('delete-conditional-logic-modal', {
          closeModal: () => dispose(),
          questionId: question?.id,
          questionLabel: question?.label,
          schema,
          onSchemaChange,
          ruleId,
          rules,
          currentRule,
          validatorIndex,
          handleAddLogic,
          setvalidatorIndex,
          setConditions,
          setActions,
          setCurrentRule,
          setRules,
          deleteAll: deleteAll ? true : false,
        });
      },
      [
        question?.id,
        question?.label,
        schema,
        onSchemaChange,
        ruleId,
        rules,
        currentRule,
        validatorIndex,
        handleAddLogic,
        setRules,
      ],
    );

    const launchDeleteConditionsOrActions = useCallback(
      (
        elementId: string,
        element: Array<Condition | Action>,
        setElement: React.Dispatch<React.SetStateAction<Array<Condition | Action>>>,
        elementKey: string,
      ) => {
        const dispose = showModal('delete-conditions-or-actions-modal', {
          closeModal: () => dispose(),
          questionLabel: question?.label,
          elementId,
          element,
          setElement,
          elementKey,
          setCurrentRule,
          currentRule,
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [question?.label],
    );

    useEffect(() => {
      const newSchema = { ...schema };
      const rule = currentRule;

      if (ruleHasActions(rule)) {
        const conditionSchema = buildConditionSchema(rule);
        if (ruleHasActionField(rule)) {
          processActionFields(rule, newSchema, conditionSchema);
        } else if (ruleHasCalculateField(rule)) {
          processCalculateFields(rule, newSchema, conditionSchema);
        }

        onSchemaChange(newSchema);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buildConditionSchema, currentRule, onSchemaChange, processActionFields]);

    useEffect(() => {
      if (rules) {
        const existingRule = rules.find((item) => item.id === ruleId);
        if (existingRule) {
          setCurrentRule(existingRule);
          setConditions(existingRule.conditions || []);
          setActions(existingRule.actions || []);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [question?.id]);

    useEffect(() => {
      if (!currentRule) return;
      setRules((prevRule: Array<FormRule>) => {
        if (!prevRule) return [currentRule];
        const currentRuleIndex = prevRule.findIndex((rule) => rule.id === ruleId);
        if (currentRuleIndex !== -1) {
          const updatedRules = [...prevRule];
          updatedRules[currentRuleIndex] = currentRule;
          return updatedRules;
        } else {
          return [...prevRule, currentRule];
        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setRules, currentRule]);

    const addCondition = useCallback(
      () => addElement(conditions, setConditions, RuleElementType.CONDITIONS, handleConditionChange),
      [conditions, addElement, handleConditionChange],
    );
    const addAction = useCallback(
      () => addElement(actions, setActions, RuleElementType.ACTIONS, handleActionChange),
      [actions, addElement, handleActionChange],
    );
    const deleteAction = useCallback(
      (id: string) => launchDeleteConditionsOrActions(id, actions, setActions, RuleElementType.ACTIONS),
      [actions, launchDeleteConditionsOrActions],
    );
    const deleteCondition = useCallback(
      (id: string) => launchDeleteConditionsOrActions(id, conditions, setConditions, RuleElementType.CONDITIONS),
      [conditions, launchDeleteConditionsOrActions],
    );

    return (
      <div className={styles.container}>
        <div className={styles.ruleHeaderContainer}>
          {!isToggleVisible && (
            <RuleHeader
              isRequired={isRequired}
              isAllowFutureDate={isAllowFutureDate}
              isDisallowDecimals={isDisallowDecimals}
              handleRequiredChange={handleRequiredChange}
              handleAllowFutureDateChange={handleAllowFutureDateChange}
              handleDisallowDecimalValueChange={handleDisallowDecimalValueChange}
              ruleId={ruleId}
              question={question}
            />
          )}
          {!isNewRule && <ConditionalLogicHelpLink />}
        </div>
        <div className={styles.ruleBuilderContainer}>
          <div className={styles.conditionsContainer}>
            {conditions.map((condition, index) => (
              <RuleCondition
                key={condition.id}
                fieldId={condition.id}
                questions={questions}
                answers={answers}
                responsiveSize={responsiveSize}
                isNewCondition={condition.isNew}
                isNewRule={isNewRule}
                deleteCondition={() => deleteCondition(condition.id)}
                launchDeleteConditionalLogicModal={(deleteAll: boolean) => launchDeleteConditionalLogicModal(deleteAll)}
                addCondition={addCondition}
                addNewConditionalLogic={addNewConditionalLogic}
                handleConditionChange={handleConditionChange}
                index={index}
                conditions={conditions}
              />
            ))}
          </div>
          <div className={styles.actionsContainer}>
            {actions.map((action, index) => (
              <RuleAction
                key={action.id}
                fieldId={action.id}
                questions={questions}
                responsiveSize={responsiveSize}
                isNewAction={action.isNew}
                deleteAction={() => deleteAction(action.id)}
                addAction={addAction}
                handleActionChange={handleActionChange}
                index={index}
                actions={actions}
              />
            ))}
          </div>
        </div>
      </div>
    );
  },
);

export default RuleBuilder;

export const ConditionalLogicHelpLink = () => {
  const { t } = useTranslation();
  return (
    <ConfigurableLink rel="noopener noreferrer" to={helpLink} className={styles.helpLink}>
      <span>
        <Help />
      </span>
      <p>{t('learnAboutConditionalLogic', 'Learn about conditional logic')}</p>
    </ConfigurableLink>
  );
};
interface RuleHeaderProps {
  isRequired: boolean;
  isAllowFutureDate: boolean;
  isDisallowDecimals: boolean;
  handleRequiredChange: () => void;
  handleAllowFutureDateChange: () => void;
  handleDisallowDecimalValueChange: () => void;
  ruleId: string;
  question: Question;
}
export const RuleHeader = React.memo(
  ({
    isRequired,
    isAllowFutureDate,
    isDisallowDecimals,
    handleRequiredChange,
    handleAllowFutureDateChange,
    handleDisallowDecimalValueChange,
    ruleId,
    question,
  }: RuleHeaderProps) => {
    const { t } = useTranslation();
    const renderingType = question?.questionOptions?.rendering;
    return (
      <div className={styles.toggleContainer}>
        <Toggle
          id={`toggle-required-${ruleId}`}
          labelText={t('required', 'Required')}
          hideLabel
          toggled={isRequired}
          onToggle={handleRequiredChange}
          size="sm"
        />
        {renderingType === RenderingType.DATE && (
          <Toggle
            id={`toggle-allow-future-date-${ruleId}`}
            labelText={t('allowFutureDates', 'Allow Future Dates')}
            hideLabel
            toggled={isAllowFutureDate}
            onToggle={handleAllowFutureDateChange}
            size="sm"
          />
        )}
        {renderingType === RenderingType.NUMBER && (
          <Toggle
            id={`toggle-disallow-decimal-value-${ruleId}`}
            labelText={t('disAllowDecimalValue', 'Disallow Decimal Value')}
            hideLabel
            toggled={isDisallowDecimals}
            onToggle={handleDisallowDecimalValueChange}
            size="sm"
          />
        )}
      </div>
    );
  },
);

interface RuleConditionProps {
  fieldId: string;
  questions: Array<Question>;
  answers: Array<Record<string, string>>;
  responsiveSize: string;
  launchDeleteConditionalLogicModal: (deleteAll: boolean) => void;
  deleteCondition: () => void;
  addNewConditionalLogic: () => void;
  isNewCondition: boolean;
  isNewRule: boolean;
  addCondition: () => void;
  index: number;
  handleConditionChange: (
    id: string,
    field: string,
    value: string | Array<{ concept: string; label: string }>,
    index: number,
  ) => void;
  conditions: Array<Condition>;
}

export const RuleCondition = React.memo(
  ({
    fieldId,
    responsiveSize,
    questions,
    isNewCondition,
    isNewRule,
    index,
    deleteCondition,
    addCondition,
    launchDeleteConditionalLogicModal,
    answers,
    handleConditionChange,
    conditions,
    addNewConditionalLogic,
  }: RuleConditionProps) => {
    const { t } = useTranslation();
    const filteredAnswers = answers.filter((answer) => answer !== undefined);
    const [isMultipleAnswers, setIsMultipleAnswers] = useState(Boolean(conditions[index]?.targetValues));
    const [isConditionValueVisible, setIsConditionValueVisible] = useState<boolean>(
      Boolean(conditions[index]?.targetValue),
    );
    const answer = filteredAnswers?.find((answer) => answer.concept === conditions[index]?.targetValue)?.label;
    const [inputValue, setInputValue] = useState(answer || '');
    const [selectedAnswers, setSelectedAnswers] = useState(conditions[index]?.targetValues || []);

    const handleSelectCondition = (selectedCondition: string) => {
      setIsMultipleAnswers(arrContains.includes(selectedCondition));
      setIsConditionValueVisible(!emptyStates.includes(selectedCondition));
    };

    const handleValueChange = (selectedItem: string | Array<{ concept: string; label: string }>) => {
      const isString = typeof selectedItem === 'string';
      const conditionType = isString ? ConditionType.TARGET_VALUE : ConditionType.TARGET_VALUES;

      handleConditionChange(fieldId, conditionType, selectedItem, index);

      if (isString) {
        setInputValue(selectedItem);
      }
    };

    return (
      <div className={styles.ruleSetContainer}>
        <div className={styles.sectionContainer}>
          {isNewCondition ? (
            <Dropdown
              id={`logicalOperator-${index}`}
              className={styles.logicalOperator}
              initialSelectedItem={conditions[index]?.logicalOperator || LogicalOperatorType.AND}
              defaultSelectedItem="and"
              items={['and', 'or']}
              onChange={({ selectedItem }: { selectedItem: string }) => {
                handleConditionChange(fieldId, ConditionType.LOGICAL_OPERATOR, selectedItem, index);
              }}
              size={responsiveSize}
            />
          ) : (
            <div className={styles.ruleDescriptor} id="when-rule-descriptor">
              <span className={styles.icon}>
                <FlowConnection />
              </span>
              <p className={styles.label}>{t('when', 'When')}</p>
            </div>
          )}
          <Dropdown
            id={`targetField-${index}`}
            className={styles.targetField}
            initialSelectedItem={
              questions?.find((question) => question.id === conditions[index]?.targetField) || {
                label: t('selectField', 'Select a field'),
              }
            }
            items={questions}
            itemToString={(item: Question) => (item ? item.label : '')}
            onChange={({ selectedItem }: { selectedItem: Question }) =>
              handleConditionChange(fieldId, ConditionType.TARGET_FIELD, selectedItem.id, index)
            }
            size={responsiveSize}
          />
          <Dropdown
            id={`targetCondition-${index}`}
            aria-label="target-condition"
            className={styles.targetCondition}
            selectedItem={conditions[index]?.targetCondition || 'Select Condition'}
            items={comparisonOperators.map((operator) => ({
              ...operator,
              label: t(operator.key, operator.defaultLabel),
            }))}
            onChange={({ selectedItem }: { selectedItem: ComparisonOperators }) => {
              handleConditionChange(fieldId, ConditionType.TARGET_CONDITION, selectedItem.defaultLabel, index);
              handleSelectCondition(selectedItem.defaultLabel);
            }}
            size={responsiveSize}
          />
          {(isConditionValueVisible || isMultipleAnswers) && (
            <InputSelectionBox
              id={'target-value'}
              key={'target-value'}
              value={inputValue}
              selectedAnswers={selectedAnswers}
              setSelectedAnswers={setSelectedAnswers}
              isMultipleAnswers={isMultipleAnswers}
              items={filteredAnswers}
              onChange={handleValueChange}
              size={responsiveSize}
            />
          )}
        </div>
        <Layer className={styles.layer}>
          <OverflowMenu
            aria-label={t('optionsMenu', 'Options Menu')}
            className={styles.overflowMenu}
            size={responsiveSize}
            align="left"
            flipped
          >
            <OverflowMenuItem
              className={styles.menuItem}
              id="addCondition"
              onClick={addCondition}
              itemText={t('addCondition', 'Add condition')}
              hasDivider
            />
            {!isNewCondition ? (
              <OverflowMenuItem
                className={styles.menuItem}
                id="addNewConditionalLogic"
                onClick={addNewConditionalLogic}
                itemText={t('addNewLogic', 'Add new logic')}
              />
            ) : (
              <OverflowMenuItem
                className={styles.menuItem}
                id="deleteCondition"
                onClick={deleteCondition}
                itemText={t('deleteCondition', 'Delete condition')}
                hasDivider
                isDelete
              />
            )}
            {!isNewRule && !isNewCondition && (
              <OverflowMenuItem
                className={styles.menuItem}
                id="deleteConditionalLogic"
                onClick={() => launchDeleteConditionalLogicModal(true)}
                itemText={t('deleteAllLogics', 'Delete conditional logic')}
                hasDivider
                isDelete
              />
            )}
            {!isNewCondition && (
              <OverflowMenuItem
                className={styles.menuItem}
                id="deleteSingleConditionalLogic"
                onClick={() => launchDeleteConditionalLogicModal(false)}
                itemText={t('deleteSingleLogic', 'Delete')}
                hasDivider
                isDelete
              />
            )}
          </OverflowMenu>
        </Layer>
      </div>
    );
  },
);

interface RuleActionProps {
  fieldId: string;
  questions: Array<Question>;
  responsiveSize: string;
  deleteAction: () => void;
  isNewAction: boolean;
  addAction: () => void;
  index: number;
  handleActionChange: (id: string, field: string, value: string, index: number) => void;
  actions: Array<Action>;
}

export const RuleAction = React.memo(
  ({
    fieldId,
    responsiveSize,
    questions,
    index,
    isNewAction,
    deleteAction,
    addAction,
    handleActionChange,
    actions,
  }: RuleActionProps) => {
    const { t } = useTranslation();
    const [action, setAction] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState(actions[index]?.errorMessage || '');
    const [isCalculate, setIsCalculate] = useState(false);
    const debouncedErrorMessage = useDebounce(errorMessage, 500);
    const showErrorMessageBox = action === (TriggerType.FAIL as string);
    const handleSelectAction = (selectedAction: string) => {
      setAction(selectedAction);
    };
    useEffect(() => {
      handleActionChange(fieldId, ActionType.ERROR_MESSAGE, debouncedErrorMessage, index);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedErrorMessage, fieldId, index]);

    useEffect(() => {
      if (
        actions[index]?.[ActionType.ERROR_MESSAGE] ||
        actions?.[index]?.actionCondition === (TriggerType.FAIL as string)
      ) {
        setAction(TriggerType.FAIL);
      }
      if (
        action === (TriggerType.CALCULATE as string) ||
        actions[index]?.[ActionType.ACTION_CONDITION] === (TriggerType.CALCULATE as string)
      ) {
        setIsCalculate(true);
      } else if (action !== (TriggerType.CALCULATE as string)) {
        setIsCalculate(false);
      }
    }, [actions, index, setIsCalculate, action]);
    return (
      <div>
        <div className={styles.ruleSetContainer}>
          <div className={styles.sectionContainer}>
            {isNewAction ? (
              <div className={styles.ruleDescriptor} id="and-rule-descriptor">
                <span className={styles.icon}>
                  <Link />
                </span>
                <p className={styles.label}>{t('and', 'And')}</p>
              </div>
            ) : (
              <div className={styles.ruleDescriptor} id="then-rule-descriptor">
                <span className={styles.icon}>
                  <Flash />
                </span>
                <p className={styles.label}>{t('then', 'Then')}</p>
              </div>
            )}
            <Dropdown
              id={`actionCondition-${index}`}
              aria-label="action-condition"
              className={styles.actionCondition}
              initialSelectedItem={actions[index]?.actionCondition || 'Select a action'}
              items={['Hide', 'Fail', 'Calculate']}
              onChange={({ selectedItem }: { selectedItem: string }) => {
                handleActionChange(fieldId, ActionType.ACTION_CONDITION, selectedItem, index);
                handleSelectAction(selectedItem);
              }}
              size={responsiveSize}
            />
            {!isCalculate && (
              <Dropdown
                id={`actionField-${index}`}
                className={styles.actionField}
                initialSelectedItem={
                  questions.find((question) => question.id === actions[index]?.actionField) || {
                    label: t('selectField', 'Select a field'),
                  }
                }
                items={questions}
                itemToString={(item: Question) => (item ? item.label : '')}
                onChange={({ selectedItem }: { selectedItem: Question }) => {
                  handleActionChange(fieldId, ActionType.ACTION_FIELD, selectedItem?.id, index);
                }}
                size={responsiveSize}
              />
            )}
            {isCalculate && (
              <Dropdown
                id={`calculateField-${index}`}
                className={styles.calculateField}
                selectedItem={
                  actions[index]?.calculateField || t('selectCalculateExpression', 'Select Calculate Expression')
                }
                items={calculateFunctions.map((functionItem) => ({
                  ...functionItem,
                  label: t(functionItem.key, functionItem.defaultLabel),
                }))}
                onChange={({ selectedItem }: { selectedItem: CalculationFunctions }) =>
                  handleActionChange(fieldId, ActionType.CALCULATE_FIELD, selectedItem.defaultLabel, index)
                }
                size={responsiveSize}
              />
            )}
          </div>
          <Layer className={styles.layer}>
            <OverflowMenu
              id="options-menu"
              aria-label={t('optionsMenu', 'Options menu')}
              className={styles.overflowMenu}
              align="left"
              flipped
              size={responsiveSize}
            >
              <OverflowMenuItem
                id="addAction"
                className={styles.menuItem}
                onClick={addAction}
                itemText={t('addAction', 'Add action')}
              />
              {isNewAction && (
                <OverflowMenuItem
                  id="deleteAction"
                  className={styles.menuItem}
                  onClick={deleteAction}
                  itemText={t('deleteAction', 'Delete action')}
                  hasDivider
                  isDelete
                />
              )}
            </OverflowMenu>
          </Layer>
        </div>
        {showErrorMessageBox && (
          <TextArea
            id={`error-message-${index}`}
            aria-label="error-message"
            helperText="Error message"
            defaultValue={errorMessage || ''}
            placeholder={t('errorMessageBox', 'Enter error message to be displayed')}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setErrorMessage(e.target.value)}
            rows={3}
          />
        )}
      </div>
    );
  },
);
