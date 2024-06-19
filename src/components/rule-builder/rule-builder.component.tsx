import React, { useCallback, useEffect, useState } from 'react';
import styles from './rule-builder.scss';
import { Flash, FlowConnection, Link, Help } from '@carbon/react/icons';
import { Dropdown } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink, showModal, useLayoutType } from '@openmrs/esm-framework';
import type { Page, Question, Schema, Section } from '../../types';
import { Toggle } from '@carbon/react';
import { v4 as uuidv4 } from 'uuid';
import { OverflowMenuItem, OverflowMenu } from '@carbon/react';
import { Layer } from '@carbon/react';
import { TextArea } from '@carbon/react';
import { useFormRule } from '../../hooks/useFormRule';
import { useDebounce } from '@openmrs/esm-framework';
import CustomComboBox from './custom-combo-box.component';

export interface Condition {
  id: string;
  isNew: boolean;
  logicalOperator?: string;
  targetField?: string;
  targetCondition?: string;
  targetValue?: string;
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

export interface formRule {
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

const helpLink: string = 'https://openmrs.atlassian.net/wiki/spaces/projects/pages/114426045/Validation+Rule+Builder';
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
        validator.type === 'date' && validator?.allowFutureDates === 'true' ? true : false,
      ),
    );
    const [isDisallowDecimals, setIsDisallowDecimals] = useState<boolean>(question?.questionOptions?.disallowDecimals);
    const [conditions, setConditions] = useState<Array<Condition>>([{ id: uuidv4(), isNew: false }]);
    const [actions, setActions] = useState<Array<Action>>([{ id: uuidv4(), isNew: false }]);
    const [currentRule, setCurrentRule] = useState<formRule>({
      id: uuidv4(),
      question: question.id,
      actions: actions,
      conditions: conditions,
      isNewRule: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isToggleVisible, setIsToggleVisible] = useState<boolean>(isNewRule);
    const isTablet = useLayoutType() === 'tablet';

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
        (item) => item['type'] === 'date',
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
          validator?.type === 'date' ? (validator['allowFutureDates'] = isAllowFutureDate ? 'false' : 'true') : null,
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

    const deleteProperties = (action: Action, properties: Array<string>) => {
      properties.forEach((property) => {
        delete action[property];
      });
    };

    const [validatorIndex, setvalidatorIndex] = useState<number>();
    const getSchemaCondition = (condition: string, targetField?: string, answer?: string) => {
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
      }
    };

    const getCalculateExpression = (expression: string, height?: string, weight?: string) => {
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

    const ruleHasActions = (rule: formRule) => {
      return rule?.actions?.some(
        (action: Action) => action?.actionField !== undefined || action?.calculateField !== undefined,
      );
    };

    const ruleHasActionField = (rule: formRule) => {
      return rule?.actions?.some((action) => action?.actionField !== undefined);
    };

    const ruleHasCalculateField = (rule: formRule) => {
      return rule?.actions?.some((action) => action?.calculateField !== undefined);
    };

    const buildConditionSchema = useCallback((rule: formRule) => {
      let conditionSchema = '';
      rule?.conditions?.forEach((condition) => {
        const { targetField, targetCondition, targetValue, logicalOperator } = condition;
        const operator = getLogicalOperator(logicalOperator);
        conditionSchema += operator ? operator : '';
        const result = getSchemaCondition(targetCondition, targetField, targetValue);
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
      (rule: formRule, newSchema: Schema, conditionSchema: string) => {
        rule?.actions?.forEach((action: Action) => {
          const { actionField, actionCondition, errorMessage } = action;
          const { pageIndex, sectionIndex, questionIndex } = findQuestionIndexes(newSchema, actionField);

          if (pageIndex !== -1 && sectionIndex !== -1 && questionIndex !== -1) {
            if (actionCondition === 'Hide') {
              newSchema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].hide = {
                hideWhenExpression: conditionSchema,
              };
            } else if (actionCondition === 'Fail' && errorMessage) {
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
    const applyCalculateToSchema = useCallback(
      (rule: formRule, schema: Schema, height: string, weight: string) => {
        rule?.actions
          ?.filter((action: Action) => action.actionCondition === 'Calculate')
          .forEach((action: Action) => {
            const calculateExpression = getCalculateExpression(action.calculateField, height, weight);
            if (isQuestionIndexValid(pageIndex, sectionIndex, questionIndex)) {
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
      (validConditionsCount: number, conditionSchema, height: string, weight: string) => {
        return (
          validConditionsCount === 2 &&
          ((conditionSchema.includes(`!isEmpty(${weight})`) &&
            conditionSchema.includes(`!isEmpty(${height})`)) as boolean)
        );
      },
      [],
    );

    const evaluateConditionsForCalculation = useCallback((rule: formRule) => {
      let validConditionsCount: number = 0;
      let height: string = '',
        weight: string = '';
      rule?.conditions?.forEach((condition, index) => {
        if (condition.targetField !== '') validConditionsCount++;
        if (index === 0) height = condition.targetField;
        else if (index === 1) weight = condition.targetField;
      });
      return { validConditionsCount, height, weight };
    }, []);

    const processCalculateFields = useCallback(
      (rule: formRule, newSchema: Schema, conditionSchema: string) => {
        const { validConditionsCount, height, weight } = evaluateConditionsForCalculation(rule);
        if (isValidForCalculation(validConditionsCount, conditionSchema, height, weight)) {
          applyCalculateToSchema(rule, schema, height, weight);
        } else {
          removeCalculationExpressionFromSchema(newSchema);
        }
        onSchemaChange(newSchema);
      },
      [
        applyCalculateToSchema,
        evaluateConditionsForCalculation,
        isValidForCalculation,
        onSchemaChange,
        removeCalculationExpressionFromSchema,
        schema,
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
        value: string,
        index: number,
        element: Array<Condition | Action>,
        setElement: React.Dispatch<React.SetStateAction<Array<Condition | Action>>>,
        elementKey: string,
      ) => {
        const updateElement = (prevElement: Array<Condition | Action>) => {
          const newElement: Array<Condition | Action> = [...prevElement];
          newElement[index] = { ...newElement[index], [field]: value };
          if (elementKey === 'actions' && field === 'actionCondition') {
            const updatedActions = [...newElement];
            const action = updatedActions[index];
            if (value === 'Hide' && shouldDeleteForHideAction(action)) {
              deleteProperties(action, ['calculateField', 'actionField', 'errorMessage']);
            } else if (value === 'Fail' && shouldDeleteForFailAction(action)) {
              deleteProperties(action, ['calculateField', 'actionField']);
            } else if (value === 'Calculate' && shouldDeleteForCalculateAction(action)) {
              deleteProperties(action, ['actionField', 'errorMessage']);
            }

            setActions(updatedActions);
          }
          if ('targetValue' in newElement[index]) {
            const condition = newElement[index] as Condition;
            if (
              elementKey === 'conditions' &&
              ['Is Empty', 'Not Empty'].includes(condition?.targetCondition) &&
              condition?.targetValue
            ) {
              delete condition.targetValue;
            }
          }

          return newElement;
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
        handleElementChange(id, field, value, index, actions, setActions, 'actions');
      },
      [actions, handleElementChange],
    );

    const handleConditionChange = useCallback(
      (id: string, field: string, value: string, index: number) =>
        handleElementChange(id, field, value, index, conditions, setConditions, 'conditions'),
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
        handleElementChange(newElement?.id as string, 'logicalOperator', 'and', elements.length);
      },
      [],
    );

    const addNewConditionalLogic = useCallback(() => {
      const newRule: formRule = {
        id: uuidv4(),
        question: question.id,
        actions: [{ id: uuidv4(), isNew: false }],
        conditions: [{ id: uuidv4(), isNew: false }],
        isNewRule: true,
      };
      setRules((prevRule: Array<formRule>) => {
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
          ruleId,
          rules,
          handleAddLogic,
          setConditions,
          setActions,
          setCurrentRule,
          setRules,
          deleteAll: deleteAll ? true : false,
        });
      },
      [question?.id, question?.label, ruleId, rules, handleAddLogic, setRules],
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
    }, [buildConditionSchema, currentRule, onSchemaChange, processActionFields, validatorIndex]);

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
      setRules((prevRule: Array<formRule>) => {
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
      () => addElement(conditions, setConditions, 'conditions', handleConditionChange),
      [conditions, addElement, handleConditionChange],
    );
    const addAction = useCallback(
      () => addElement(actions, setActions, 'actions', handleActionChange),
      [actions, addElement, handleActionChange],
    );
    const deleteAction = useCallback(
      (id: string) => launchDeleteConditionsOrActions(id, actions, setActions, 'actions'),
      [actions, launchDeleteConditionsOrActions],
    );
    const deleteCondition = useCallback(
      (id: string) => launchDeleteConditionsOrActions(id, conditions, setConditions, 'conditions'),
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
                isTablet={isTablet}
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
                isTablet={isTablet}
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
  return (
    <ConfigurableLink to={helpLink} className={styles.helpLink}>
      <span>
        <Help />
      </span>
      <p>Learn about conditional logic</p>
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
    return (
      <div className={styles.toggleContainer}>
        <Toggle
          id={`toggle-required-${ruleId}`}
          labelText="Required"
          hideLabel
          toggled={isRequired}
          onToggle={handleRequiredChange}
          size="sm"
        />
        {question?.questionOptions?.rendering === 'date' && (
          <Toggle
            id={`toggle-allow-future-date-${ruleId}`}
            labelText="Allow Future dates"
            hideLabel
            toggled={isAllowFutureDate}
            onToggle={handleAllowFutureDateChange}
            size="sm"
          />
        )}
        {question?.questionOptions?.rendering === 'number' && (
          <Toggle
            id={`toggle-disallow-decimal-value-${ruleId}`}
            labelText="Disallow Decimal Value"
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
  isTablet: boolean;
  launchDeleteConditionalLogicModal: (deleteAll: boolean) => void;
  deleteCondition: () => void;
  addNewConditionalLogic: () => void;
  isNewCondition: boolean;
  isNewRule: boolean;
  addCondition: () => void;
  index: number;
  handleConditionChange: (id: string, field: string, value: string, index: number) => void;
  conditions: Array<Condition>;
}

export const RuleCondition = React.memo(
  ({
    fieldId,
    isTablet,
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
    const answer = answers.filter((answer) => answer !== undefined);
    const [isConditionValueVisible, setIsConditionValueVisible] = useState<boolean>(
      Boolean(conditions[index]?.targetValue),
    );
    const handleSelectCondition = (selectedCondition: string) => {
      setIsConditionValueVisible(!['Is Empty', 'Not Empty'].includes(selectedCondition));
    };
    const [inputValue, setInputValue] = useState(conditions[index]?.targetValue || '');
    const handleValueChange = (selectedItem: string) => {
      handleConditionChange(fieldId, 'targetValue', selectedItem, index);
      setInputValue(selectedItem);
    };

    return (
      <div className={styles.ruleSetContainer}>
        <div className={styles.sectionContainer}>
          {isNewCondition ? (
            <Dropdown
              id={`logicalOperator-${index}`}
              className={styles.logicalOperator}
              initialSelectedItem={conditions[index]?.logicalOperator || 'and'}
              defaultSelectedItem="and"
              items={['and', 'or']}
              onChange={({ selectedItem }: { selectedItem: string }) => {
                handleConditionChange(fieldId, `logicalOperator`, selectedItem, index);
              }}
              size={isTablet ? 'lg' : 'sm'}
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
              questions?.find((question) => question.id === conditions[index]?.[`targetField`]) || {
                label: 'Choose a field',
              }
            }
            items={questions}
            itemToString={(item: Question) => (item ? item.label : '')}
            onChange={({ selectedItem }: { selectedItem: Question }) =>
              handleConditionChange(fieldId, `targetField`, selectedItem.id, index)
            }
            size={isTablet ? 'lg' : 'sm'}
          />
          <Dropdown
            id={`targetCondition-${index}`}
            aria-label="target-condition"
            className={styles.targetCondition}
            selectedItem={conditions[index]?.[`targetCondition`] || 'Select Condition'}
            items={[
              'Is Empty',
              'Not Empty',
              'Greater than or equal to',
              'Less than or equal to',
              'Equals',
              'not Equals',
            ]}
            onChange={({ selectedItem }: { selectedItem: string }) => {
              handleConditionChange(fieldId, `targetCondition`, selectedItem, index);
              handleSelectCondition(selectedItem);
            }}
            size={isTablet ? 'lg' : 'sm'}
          />
          {isConditionValueVisible && (
            <CustomComboBox
              id={'target-value'}
              key={'target-value'}
              value={inputValue}
              items={answer}
              onChange={handleValueChange}
              size={isTablet ? 'lg' : 'sm'}
            />
          )}
        </div>
        <Layer className={styles.layer}>
          <OverflowMenu
            aria-label={t('optionsMenu', 'Options Menu')}
            className={styles.overflowMenu}
            size={isTablet ? 'lg' : 'sm'}
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
  isTablet: boolean;
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
    isTablet,
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
    const [errorMessage, setErrorMessage] = useState<string>(actions[index]?.errorMessage || '');
    const [isCalculate, setIsCalculate] = useState<boolean>(false);
    const debouncedErrorMessage = useDebounce(errorMessage, 500);
    const showErrorMessageBox = action === 'Fail';
    const handleSelectAction = (selectedAction: string) => {
      setAction(selectedAction);
    };
    useEffect(() => {
      handleActionChange(fieldId, 'errorMessage', debouncedErrorMessage, index);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedErrorMessage, fieldId, index]);

    useEffect(() => {
      if (actions[index]?.errorMessage || actions?.[index]?.actionCondition === 'Fail') {
        setAction('Fail');
      }
      if (action === 'Calculate' || actions[index]?.['actionCondition'] === 'Calculate') {
        setIsCalculate(true);
      } else if (action !== 'Caculate') {
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
              initialSelectedItem={actions[index]?.[`actionCondition`] || 'Select a action'}
              items={['Hide', 'Fail', 'Calculate']}
              onChange={({ selectedItem }: { selectedItem: string }) => {
                handleActionChange(fieldId, `actionCondition`, selectedItem, index);
                handleSelectAction(selectedItem);
              }}
              size={isTablet ? 'lg' : 'sm'}
            />
            {!isCalculate && (
              <Dropdown
                id={`actionField-${index}`}
                className={styles.actionField}
                initialSelectedItem={
                  questions.find((question) => question.id === actions[index]?.[`actionField`]) || {
                    label: 'Choose a field',
                  }
                }
                items={questions}
                itemToString={(item: Question) => (item ? item.label : '')}
                onChange={({ selectedItem }: { selectedItem: Question }) => {
                  handleActionChange(fieldId, 'actionField', selectedItem?.id, index);
                }}
                size={isTablet ? 'lg' : 'sm'}
              />
            )}
            {isCalculate && (
              <Dropdown
                id={`calculateField-${index}`}
                className={styles.calculateField}
                selectedItem={actions[index]?.[`calculateField`] || 'Select Calculate Expression'}
                items={[
                  'BMI',
                  'BSA',
                  'Height For Age Zscore',
                  'BMI For Age Zscore',
                  'Weight For Height Zscore',
                  'Age Based On Date',
                  'Months On ART',
                  'Time Difference',
                ]}
                onChange={({ selectedItem }: { selectedItem: string }) =>
                  handleActionChange(fieldId, 'calculateField', selectedItem, index)
                }
                size={isTablet ? 'lg' : 'sm'}
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
              size={isTablet ? 'lg' : 'sm'}
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
