import React, { useEffect, useState } from 'react';
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

interface Condition {
  id: string;
  isNew: boolean;
}

interface Action {
  id: string;
  isNew: boolean;
}

interface ConditionState {
  [key: string]: {
    logicalOperator?: string;
    targetField?: string;
    targetCondition?: string;
    targetValue?: string;
  };
}

interface ActionState {
  [key: string]: {
    actionCondition?: string;
    actionField?: string;
  };
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

  const pages: Array<Page> = schema?.pages || [];
  const sections: Array<Section> = pages.flatMap((page) => page.sections || []);
  const fields: Array<Question> = sections.flatMap((section) => section.questions || []);
  const questions = fields.flatMap((field) => field.label);
  const answers: Array<Record<string, string>> = fields.flatMap((field) => field.questionOptions.answers);

  const [isRequired, setIsRequired] = useState<boolean>(false);
  const [conditions, setConditions] = useState<Array<Condition>>([{ id: uuidv4(), isNew: false }]);
  const [actions, setActions] = useState<Array<Action>>([{ id: uuidv4(), isNew: false }]);
  const [conditionsState, setConditionsState] = useState<ConditionState>({});
  const [actionsState, setActionsState] = useState<ActionState>({});
  const isTablet = useLayoutType() === 'tablet';

  const handleToggle = () => {
    if (question) {
      const newSchema = { ...schema };
      newSchema.pages[pageIndex].sections[sectionIndex].questions[questionIndex].required = !question.required;
      onSchemaChange(newSchema);
      setIsRequired((p) => !p);
    }
  };

  const handleConditionChange = (id: string, field: string, value: string) => {
    setConditionsState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleActionChange = (id: string, field: string, value: string) => {
    setActionsState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const addCondition = () => setConditions([...conditions, { id: uuidv4(), isNew: true }]);
  const removeCondition = (id: string) => setConditions(conditions.filter((condition) => condition.id !== id));
  const addAction = () => setActions([...actions, { id: uuidv4(), isNew: true }]);
  const removeAction = (id: string) => setActions(actions.filter((action) => action.id !== id));
  const removeRule = () => {
    handleAddLogic(question.id);
    setActions([]);
    setConditions([]);
  };

  useEffect(() => {
    if (question.required) {
      setIsRequired(true);
    }
  }, [question.required]);

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
              conditionsState={conditionsState}
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
              actionsState={actionsState}
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
  questions: Array<string>;
  answers: Array<Record<string, string>>;
  isTablet: boolean;
  removeRule: () => void;
  removeCondition: () => void;
  isNew: boolean;
  addCondition: () => void;
  index: number;
  handleConditionChange: (id: string, field: string, value: string) => void;
  conditionsState: ConditionState;
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
  conditionsState,
}: RuleConditionProps) => {
  const { t } = useTranslation();
  const answer = answers.filter((answer) => answer !== undefined).map((answer) => answer.label);
  const [isConditionValueVisible, setIsConditionValueVisible] = useState(false);
  const handleSelectCondition = (selectedCondition: string) => {
    setIsConditionValueVisible(!['Is Empty', 'Not Empty'].includes(selectedCondition));
  };

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
            onChange={({ selectedItem }: { selectedItem: string }) =>
              handleConditionChange(fieldId, `logicalOperator-${index}`, selectedItem)
            }
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
          selectedItem={conditionsState[fieldId]?.[`targetField-${index}`] || 'Choose a field'}
          items={questions}
          onChange={({ selectedItem }: { selectedItem: string }) =>
            handleConditionChange(fieldId, `targetField-${index}`, selectedItem)
          }
          size={isTablet ? 'lg' : 'sm'}
        />
        <Dropdown
          id={`targetCondition-${index}`}
          className={styles.targetCondition}
          selectedItem={conditionsState[fieldId]?.[`targetCondition-${index}`] || 'Select Condition'}
          items={['Is Empty', 'Not Empty', 'Greater than or equal to', 'Less than or equal to', 'Equals', 'not Equals']}
          onChange={({ selectedItem }: { selectedItem: string }) => {
            handleConditionChange(fieldId, `targetCondition-${index}`, selectedItem);
            handleSelectCondition(selectedItem);
          }}
          size={isTablet ? 'lg' : 'sm'}
        />
        {isConditionValueVisible && (
          <ComboBox
            id={`targetValue-${index}`}
            className={styles.targetValue}
            selectedItem={conditionsState[fieldId]?.[`targetValue-${index}`] || 'Choose a answer'}
            allowCustomValue
            items={answer}
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
              itemText={t('deleteCondition', 'Delete condition')}
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
  questions: Array<string>;
  isTablet: boolean;
  removeAction: () => void;
  isNew: boolean;
  addAction: () => void;
  index: number;
  handleActionChange: (id: string, field: string, value: string) => void;
  actionsState: ActionState;
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
  actionsState,
}: RuleActionProps) => {
  const { t } = useTranslation();
  return (
    <div className={styles.ruleSetContainer}>
      <div className={styles.sectionContainer}>
        {isNew ? (
          <div className={styles.ruleDescriptor}>
            <span className={styles.icon}>
              <Link />
            </span>
            <p className={styles.label}>{t('and', 'and')}</p>
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
          selectedItem={actionsState[fieldId]?.[`actionCondition-${index}`] || 'Select Condition'}
          items={['Hide']}
          onChange={({ selectedItem }: { selectedItem: string }) =>
            handleActionChange(fieldId, `actionCondition-${index}`, selectedItem)
          }
          size={isTablet ? 'lg' : 'sm'}
        />
        <Dropdown
          id={`actionField-${index}`}
          className={styles.actionField}
          selectedItem={actionsState[fieldId]?.[`actionField-${index}`] || 'Choose a field'}
          items={questions}
          onChange={({ selectedItem }: { selectedItem: string }) =>
            handleActionChange(fieldId, `actionField-${index}`, selectedItem)
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
  );
};
