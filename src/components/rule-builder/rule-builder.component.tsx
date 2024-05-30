import React, { useCallback, useEffect, useState } from 'react';
import styles from './rule-builder.scss';
import { Flash, FlowConnection, Link } from '@carbon/react/icons';
import { Dropdown } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import type { Page, Question, Schema, Section } from '../../types';
import { Toggle } from '@carbon/react';
import { v4 as uuidv4 } from 'uuid';
import { ComboBox } from '@carbon/react';
import { OverflowMenuItem, OverflowMenu } from '@carbon/react';
import { Layer } from '@carbon/react';
import { TextArea } from '@carbon/react';
import { useFormRule } from '../../hooks/useFormRule';
import { useDebounce } from '@openmrs/esm-framework';
interface Condition {
  id: string;
  isNew: boolean;
  logicalOperator?: string;
  targetField?: string;
  targetCondition?: string;
  targetValue?: string;
}

interface Action {
  id: string;
  isNew: boolean;
  logicalOperator?: string;
  actionCondition?: string;
  actionField?: string;
  errorMessage?: string;
}

export interface formRule {
  id: string;
  question: string;
  conditions?: Array<Condition>;
  actions?: Array<Action>;
}

interface RuleBuilderProps {
  key: string;
  question: Question;
  pageIndex: number;
  sectionIndex: number;
  questionIndex: number;
  onSchemaChange: (schema: Schema) => void;
  schema: Schema;
  handleAddLogic: (fieldId: string) => void;
}

const RuleBuilder = ({
  schema,
  onSchemaChange,
  question,
  pageIndex,
  sectionIndex,
  questionIndex,
  handleAddLogic,
}: RuleBuilderProps) => {
  const ruleId = `question-${pageIndex}-${sectionIndex}-${questionIndex}`;
  const { rules, setRules } = useFormRule();
  const pages: Array<Page> = schema?.pages || [];
  const sections: Array<Section> = pages.flatMap((page) => page.sections || []);
  const questions: Array<Question> = sections.flatMap((section) => section.questions || []);
  const answers: Array<Record<string, string>> = questions.flatMap((question) => question.questionOptions.answers);

  const [isRequired, setIsRequired] = useState<boolean>(false);
  const [conditions, setConditions] = useState<Array<Condition>>([{ id: uuidv4(), isNew: false }]);
  const [actions, setActions] = useState<Array<Action>>([{ id: uuidv4(), isNew: false }]);
  const [currentRule, setCurrentRule] = useState<formRule>({
    id: uuidv4(),
    question: question.id,
    actions: actions,
    conditions: conditions,
  });
  const isTablet = useLayoutType() === 'tablet';

  const handleToggle = useCallback(() => {
    if (question) {
      const newSchema = { ...schema };
      newSchema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].required = !question.required;
      onSchemaChange(newSchema);
      setIsRequired((p) => !p);
    }
  }, [pageIndex, sectionIndex, questionIndex, onSchemaChange, question, schema]);

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
      setElement((prev) => {
        const newElement: Array<Condition | Action> = [...prev];
        newElement[index] = { ...newElement[index], [field]: value };
        return newElement;
      });
      setCurrentRule((prevRule) => {
        const newRule = { ...prevRule };
        newRule[elementKey][index] = { ...newRule[elementKey][index], [field]: value };
        return newRule;
      });
    },
    [],
  );

  const handleConditionChange = useCallback(
    (id: string, field: string, value: string, index: number) =>
      handleElementChange(id, field, value, index, conditions, setConditions, 'conditions'),
    [handleElementChange, conditions],
  );
  const handleActionChange = useCallback(
    (id: string, field: string, value: string, index: number) =>
      handleElementChange(id, field, value, index, actions, setActions, 'actions'),
    [handleElementChange, actions],
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
      handleElementChange(newElement?.id as string, `logicalOperator`, 'and', elements.length);
    },
    [],
  );

  const removeElement = useCallback(
    (
      elementId: string,
      element: Array<Condition | Action>,
      setElement: React.Dispatch<React.SetStateAction<Array<Condition | Action>>>,
      elementKey: string,
    ) => {
      setElement(element.filter((e) => e.id !== elementId));
      setCurrentRule((prevRule) => {
        const newRule = { ...prevRule };
        const elementIndex = element.findIndex((e) => e.id === elementId);
        if (elementIndex !== -1) {
          newRule[elementKey]?.splice(elementIndex, 1);
        }
        return newRule;
      });
    },
    [],
  );

  useEffect(() => {
    if (question.required) {
      setIsRequired(true);
    }
  }, [question.required]);

  useEffect(() => {
    if (rules) {
      const existingRule = rules.find((item) => item.question === question.id);
      if (existingRule) {
        setCurrentRule(existingRule);
        setConditions(existingRule.conditions || []);
        setActions(existingRule.actions || []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  useEffect(() => {
    if (currentRule) {
      setRules((prevRule: Array<formRule>) => {
        if (!prevRule) return [currentRule];
        const currentRuleIndex = prevRule.findIndex((rule) => rule.question === question.id);
        if (currentRuleIndex !== -1) {
          const updatedRules = [...prevRule];
          updatedRules[currentRuleIndex] = currentRule;
          return updatedRules;
        } else {
          return [...prevRule, currentRule];
        }
      });
    }
  }, [currentRule, question.id, setRules]);

  const addCondition = useCallback(
    () => addElement(conditions, setConditions, 'conditions', handleConditionChange),
    [conditions, addElement, handleConditionChange],
  );
  const addAction = useCallback(
    () => addElement(actions, setActions, 'actions', handleActionChange),
    [actions, addElement, handleActionChange],
  );
  const removeAction = useCallback(
    (id: string) => removeElement(id, actions, setActions, 'actions'),
    [actions, removeElement],
  );
  const removeCondition = useCallback(
    (id: string) => removeElement(id, conditions, setConditions, 'conditions'),
    [conditions, removeElement],
  );
  const removeRule = useCallback(() => {
    handleAddLogic(question.id);
    setConditions([]);
    setActions([]);
    setCurrentRule({ id: uuidv4(), question: question.id });
    setRules((prevRule: Array<formRule>) => {
      const ruleIndex = prevRule?.findIndex((rule) => rule.question === question.id);
      if (ruleIndex !== -1) {
        const updatedRule = [...prevRule];
        updatedRule.splice(ruleIndex, 1);
        return updatedRule;
      }
    });
  }, [handleAddLogic, question.id, setRules]);

  return (
    <div className={styles.container}>
      <div className={styles.toggleContainer}>
        <Toggle
          id={`toggle-required-${ruleId}`}
          labelText="Required"
          hideLabel
          toggled={isRequired}
          onToggle={handleToggle}
          size="sm"
        />
        {question?.questionOptions?.rendering === 'date' && (
          <Toggle id={`future-date-${ruleId}`} labelText="Allow Future dates" hideLabel size="sm" />
        )}
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
              isNew={condition.isNew}
              removeCondition={() => removeCondition(condition.id)}
              removeRule={() => removeRule()}
              addCondition={addCondition}
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
              isNew={action.isNew}
              removeAction={() => removeAction(action.id)}
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
};

export default RuleBuilder;

interface RuleConditionProps {
  fieldId: string;
  questions: Array<Question>;
  answers: Array<Record<string, string>>;
  isTablet: boolean;
  removeRule: () => void;
  removeCondition: () => void;
  isNew: boolean;
  addCondition: () => void;
  index: number;
  handleConditionChange: (id: string, field: string, value: string, index: number) => void;
  conditions: Array<Condition>;
}

export const RuleCondition = ({
  fieldId,
  isTablet,
  questions,
  isNew,
  index,
  removeCondition,
  addCondition,
  removeRule,
  answers,
  handleConditionChange,
  conditions,
}: RuleConditionProps) => {
  const { t } = useTranslation();
  const answer = answers.filter((answer) => answer !== undefined);
  const [isConditionValueVisible, setIsConditionValueVisible] = useState(false);
  const handleSelectCondition = (selectedCondition: string) => {
    setIsConditionValueVisible(!['Is Empty', 'Not Empty'].includes(selectedCondition));
  };
  useEffect(() => {
    if (conditions[index]?.targetValue) {
      setIsConditionValueVisible(true);
    }
  }, [conditions, index]);

  return (
    <div className={styles.ruleSetContainer}>
      <div className={styles.sectionContainer}>
        {isNew ? (
          <Dropdown
            id={`logicalOperator-${index}`}
            className={styles.logicalOperator}
            initialSelectedItem="and"
            defaultSelectedItem="and"
            items={['and', 'or']}
            onChange={({ selectedItem }: { selectedItem: string }) => {
              handleConditionChange(fieldId, `logicalOperator`, selectedItem, index);
            }}
            size={isTablet ? 'lg' : 'sm'}
          />
        ) : (
          <div className={styles.ruleDescriptor}>
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
          className={styles.targetCondition}
          selectedItem={conditions[index]?.[`targetCondition`] || 'Select Condition'}
          items={['Is Empty', 'Not Empty', 'Greater than or equal to', 'Less than or equal to', 'Equals', 'not Equals']}
          onChange={({ selectedItem }: { selectedItem: string }) => {
            handleConditionChange(fieldId, `targetCondition`, selectedItem, index);
            handleSelectCondition(selectedItem);
          }}
          size={isTablet ? 'lg' : 'sm'}
        />
        {isConditionValueVisible && (
          <ComboBox
            id={`targetValue-${index}`}
            className={styles.targetValue}
            initialSelectedItem={
              answer?.find((item) => item.concept === conditions[index]?.[`targetValue`]) || {
                label: 'Choose a answer',
              }
            }
            allowCustomValue
            items={answer}
            itemToString={(item: Record<string, string>) => (item ? item.label : '')}
            onChange={({ selectedItem }: { selectedItem: Record<string, string> }) => {
              handleConditionChange(fieldId, `targetValue`, selectedItem.concept, index);
            }}
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
          />
          {isNew ? (
            <OverflowMenuItem
              className={styles.menuItem}
              id="removeCondition"
              onClick={removeCondition}
              itemText={t('removeCondition', 'Remove Condition')}
              hasDivider
              isDelete
            />
          ) : (
            <OverflowMenuItem
              className={styles.menuItem}
              id="deleteCondition"
              onClick={removeRule}
              itemText={t('deleteConditionalLogic', 'Delete conditional logic')}
              hasDivider
              isDelete
            />
          )}
        </OverflowMenu>
      </Layer>
    </div>
  );
};

interface RuleActionProps {
  fieldId: string;
  questions: Array<Question>;
  isTablet: boolean;
  removeAction: () => void;
  isNew: boolean;
  addAction: () => void;
  index: number;
  handleActionChange: (id: string, field: string, value: string, index: number) => void;
  actions: Array<Action>;
}

export const RuleAction = ({
  fieldId,
  isTablet,
  questions,
  index,
  isNew,
  removeAction,
  addAction,
  handleActionChange,
  actions,
}: RuleActionProps) => {
  const { t } = useTranslation();
  const [action, setAction] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>(actions[index]?.errorMessage || '');
  const debouncedErrorMessage = useDebounce(errorMessage, 500);
  const showErrorMessageBox = action === 'fail';

  const handleSelectAction = (selectedAction: string) => {
    setAction(selectedAction);
  };

  useEffect(() => {
    handleActionChange(fieldId, `errorMessage`, debouncedErrorMessage, index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedErrorMessage, fieldId, index]);

  useEffect(() => {
    if (actions[index]?.errorMessage) {
      setAction('fail');
    }
  }, [actions, index]);
  return (
    <div>
      <div className={styles.ruleSetContainer}>
        <div className={styles.sectionContainer}>
          {isNew ? (
            <div className={styles.ruleDescriptor}>
              <span className={styles.icon}>
                <Link />
              </span>
              <p className={styles.label}>{t('and', 'And')}</p>
            </div>
          ) : (
            <div className={styles.ruleDescriptor}>
              <span className={styles.icon}>
                <Flash />
              </span>
              <p className={styles.label}>{t('then', 'Then')}</p>
            </div>
          )}
          <Dropdown
            id={`actionCondition-${index}`}
            className={styles.actionCondition}
            initialSelectedItem={actions[index]?.[`actionCondition`] || 'Select Action'}
            items={['Hide', 'fail']}
            onChange={({ selectedItem }: { selectedItem: string }) => {
              handleActionChange(fieldId, `actionCondition`, selectedItem, index);
              handleSelectAction(selectedItem);
            }}
            size={isTablet ? 'lg' : 'sm'}
          />
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
            onChange={({ selectedItem }: { selectedItem: Question }) =>
              handleActionChange(fieldId, `actionField`, selectedItem.id, index)
            }
            size={isTablet ? 'lg' : 'sm'}
          />
        </div>
        <Layer className={styles.layer}>
          <OverflowMenu
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
            {isNew && (
              <OverflowMenuItem
                id="removeAction"
                className={styles.menuItem}
                onClick={removeAction}
                itemText={t('removeAction', 'Remove action')}
                hasDivider
                isDelete
              />
            )}
          </OverflowMenu>
        </Layer>
      </div>
      {showErrorMessageBox && (
        <TextArea
          rows={3}
          id={`error-message-${index}`}
          helperText="Error message"
          defaultValue={errorMessage || ''}
          placeholder={t('errorMessageBox', 'Enter error message to be displayed')}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setErrorMessage(e.target.value)}
        />
      )}
    </div>
  );
};
