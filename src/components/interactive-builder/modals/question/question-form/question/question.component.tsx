import React, { useCallback, useState } from 'react';
import { TextInput, Button, Select, SelectItem, RadioButtonGroup, RadioButton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import RenderTypeComponent from '../rendering-types/rendering-type.component';
import QuestionTypeComponent from '../question-types/question-type.component';
import RequiredLabel from '../common/required-label/required-label.component';
import { useFormField } from '../../form-field-context';
import type { FormField, RenderType } from '@openmrs/esm-form-engine-lib';
import { questionTypes, renderTypeOptions, renderingTypes } from '@constants';
import styles from './question.scss';
import { Date, Markdown, Number, SelectAnswers, Text, TextArea, Toggle, UiSelectExtended } from '../rendering-types/inputs';

interface QuestionProps {
  checkIfQuestionIdExists: (idToTest: string) => boolean;
}

const renderComponentMap: Partial<Record<RenderType, React.FC>> = {
  number: Number,
  text: Text,
  textarea: TextArea,
  toggle: Toggle,
  'ui-select-extended': UiSelectExtended,
  date: Date,
  datetime: Date,
  markdown: Markdown,
  select: SelectAnswers,
  radio: SelectAnswers,
  checkbox: SelectAnswers,
};

const Question: React.FC<QuestionProps> = ({ checkIfQuestionIdExists }) => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();
  const [isQuestionInfoVisible, setIsQuestionInfoVisible] = useState(!!formField?.questionInfo);

  const convertLabelToCamelCase = () => {
    const camelCasedLabel = formField.label
      ?.toLowerCase()
      ?.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
    setFormField({ ...formField, id: camelCasedLabel });
  };

  const isQuestionIdDuplicate = useCallback(() => {
    return checkIfQuestionIdExists(formField.id);
  }, [formField.id, checkIfQuestionIdExists]);

  const handleQuestionInfoToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormField((prevFormField) => {
        if (e.target.value === 'false') {
          const { questionInfo, ...updatedFormField } = prevFormField;
          return updatedFormField;
        }
        return prevFormField;
      });
      setIsQuestionInfoVisible(e.target.value === 'true');
    },
    [setFormField],
  );
  
  const handleQuestionTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newQuestionType = event.target.value;
      setFormField((prevFormField) => {
        const hasPreviousRenderingType = prevFormField?.questionOptions?.rendering;
        if (hasPreviousRenderingType) {
          const isQuestionTypeObs = newQuestionType === 'obs' ? true : false;
          if (!isQuestionTypeObs) {
            const isRenderingTypeValidForQuestionType =
              questionTypes.includes(newQuestionType as keyof typeof renderTypeOptions) &&
              renderTypeOptions[newQuestionType].includes(prevFormField.questionOptions.rendering as RenderType);
            if (!isRenderingTypeValidForQuestionType) {
              prevFormField = removeRenderingTypeSubProperties(prevFormField,null);
              return {
                ...prevFormField,
                questionOptions: { ...prevFormField.questionOptions, rendering: null },
                type: newQuestionType,
              };
            }
          }
        }
        return {
          ...prevFormField,
          type: newQuestionType,
        };
      });
    },
    [setFormField],
  );

  const handleRenderTypePropertiesChange = useCallback((prevFormField: FormField, newRenderingType) :FormField => {
    if(prevFormField.questionOptions?.rendering) {
      prevFormField= removeRenderingTypeSubProperties(prevFormField,newRenderingType);
    }
    prevFormField = addDefaultRenderingTypeSubProperties(prevFormField,newRenderingType);
      return {
      ...prevFormField,
      questionOptions: {
        ...prevFormField.questionOptions,
        rendering: newRenderingType as RenderType,
      }
      }
  }, []);

  const removeRenderingTypeSubProperties = useCallback((prevFormField: FormField,newRenderingType) : FormField=> {
    if(newRenderingType==null || (renderComponentMap[newRenderingType]!=renderComponentMap[prevFormField.questionOptions.rendering])) {
      switch(renderComponentMap[prevFormField.questionOptions.rendering]) {
        case Number: { 
          (prevFormField.questionOptions?.min!=null)?(delete prevFormField.questionOptions.min):null;
          (prevFormField.questionOptions?.max!=null)?(delete prevFormField.questionOptions.max):null;
          break;
        };
        case Text: {
          (prevFormField.questionOptions?.minLength!=null)?(delete prevFormField.questionOptions.minLength):null;
          (prevFormField.questionOptions?.maxLength!=null)?(delete prevFormField.questionOptions.maxLength):null;
          break;
        };
        case TextArea: {
          (prevFormField.questionOptions?.rows!=null)?(delete prevFormField.questionOptions.rows):null;
          break;
        };
        case Toggle: {
          (prevFormField.questionOptions?.toggleOptions!=null)?(delete prevFormField.questionOptions.toggleOptions):null;
          break;
        };
        case UiSelectExtended: {
          (prevFormField.questionOptions?.isSearchable!=null)?(delete prevFormField.questionOptions.isSearchable):null;
          break;
        };
        case Date: {
          (prevFormField.datePickerFormat!=null)?(delete prevFormField.datePickerFormat):null;
          break;
        };
        case Markdown: {
          (prevFormField.value!=null)?(delete prevFormField.value):null;
          break;
        };
        case SelectAnswers: {
          (prevFormField.questionOptions?.answers!=null)?(delete prevFormField.questionOptions.answers):null;
          break;
        };
      }
    }
      return prevFormField;
  },[]);

  const addDefaultRenderingTypeSubProperties = useCallback((prevFormField: FormField, newRenderingType) : FormField=> {
    if(newRenderingType) {
      switch(renderComponentMap[newRenderingType]) {
        case UiSelectExtended: {
          (!(prevFormField.questionOptions?.isSearchable!=null))?(prevFormField = { ...prevFormField, questionOptions: { ...prevFormField.questionOptions, isSearchable: false }}):null;
          break;
        };
        case Date: {
          (!(prevFormField.datePickerFormat!=null))?(prevFormField = {...prevFormField, datePickerFormat: "both" }):null;
          break;
        };
      }
    }
    return prevFormField;

  },[]);

  const handleRenderingTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {  
      setFormField((prevFormField)=> {
        return (prevFormField === null)
        ? { ...prevFormField, questionOptions: { rendering: event.target.value as RenderType } }
        : handleRenderTypePropertiesChange(prevFormField,event.target.value);
      }
      )
    },
    [setFormField],
  );

  const handleQuestionInfoChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormField((prevFormField) => ({
        ...prevFormField,
        questionInfo: event.target.value,
      }));
    },
    [setFormField],
  );

  return (
    <>
      <TextInput
        id="questionId"
        invalid={!!formField?.id && isQuestionIdDuplicate()}
        invalidText={t('questionIdExists', 'This question ID already exists in your schema')}
        labelText={
          <div className={styles.questionIdLabel}>
            <span>
              {t('questionId', 'Question ID (prefer using camel-case for IDs). Each field should have a unique ID.')}
            </span>
            {formField?.label && (
              <Button kind={'ghost'} onClick={convertLabelToCamelCase} size="sm">
                {t('convertLabelToCamelCase', 'Convert label to camel-case')}
              </Button>
            )}
          </div>
        }
        value={formField?.id}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setFormField({ ...formField, id: event.target.value });
        }}
        placeholder={t(
          'questionIdPlaceholder',
          'Enter a unique ID e.g. "anaesthesiaType" for a question asking about the type of anaesthesia.',
        )}
        required
      />
      <Select
        value={formField?.type ?? 'control'}
        onChange={handleQuestionTypeChange}
        id="questionType"
        invalidText={t('typeRequired', 'Type is required')}
        labelText={t('questionType', 'Question type')}
        required
      >
        {!formField?.type && <SelectItem text={t('chooseQuestionType', 'Choose a question type')} value="" />}
        {questionTypes.map((questionType, key) => (
          <SelectItem text={questionType} value={questionType} key={key} />
        ))}
      </Select>
      <Select
        value={formField?.questionOptions?.rendering}
        onChange={handleRenderingTypeChange}
        id="renderingType"
        invalidText={t('validRenderingTypeRequired', 'A valid rendering type value is required')}
        labelText={t('renderingType', 'Rendering type')}
        required
      >
        {!formField.questionOptions?.rendering && (
          <SelectItem text={t('chooseRenderingType', 'Choose a rendering type')} value="" />
        )}
        {formField.type &&
        formField.type !== 'obs' &&
        questionTypes.includes(formField.type as keyof typeof renderTypeOptions)
          ? renderTypeOptions[formField?.type].map((type, key) => (
              <SelectItem key={`${type}-${key}`} text={type} value={type} />
            ))
          : renderingTypes.map((type, key) => <SelectItem key={key} text={type} value={type} />)}
      </Select>
      {formField.questionOptions && formField.questionOptions.rendering !== 'markdown' && (
        <>
          <TextInput
            id="questionLabel"
            labelText={
              <RequiredLabel
                isRequired={formField?.required && formField?.required === 'true' ? true : false}
                text={t('questionLabel', 'Label')}
                t={t}
              />
            }
            placeholder={t('labelPlaceholder', 'e.g. Type of Anaesthesia')}
            value={formField?.label}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setFormField({ ...formField, label: event.target.value })
            }
            required
          />
          <RadioButtonGroup
            name="isQuestionRequired"
            legendText={t(
              'isQuestionRequiredOrOptional',
              'Is this question a required or optional field? Required fields must be answered before the form can be submitted.',
            )}
          >
            <RadioButton
              id="questionIsNotRequired"
              checked={formField.required ? !formField.required : true}
              labelText={t('optional', 'Optional')}
              onClick={() => setFormField({ ...formField, required: false })}
              value="optional"
            />
            <RadioButton
              id="questionIsRequired"
              checked={formField.required ? formField.required : false}
              labelText={t('required', 'Required')}
              onClick={() => setFormField({ ...formField, required: true })}
              value="required"
            />
          </RadioButtonGroup>
        </>
      )}
      {formField.type && <QuestionTypeComponent />}
      {formField.questionOptions?.rendering && <RenderTypeComponent />}
      <RadioButtonGroup
        name="isQuestionInfoProvided"
        legendText={t('isQuestionInfoProvided', 'Would you like to provide additional details about the question?')}
      >
        <RadioButton
          id="questionInfoProvided"
          checked={!!formField?.questionInfo}
          labelText={t('yes', 'Yes')}
          onClick={handleQuestionInfoToggle}
          value="true"
        />
        <RadioButton
          id="questionInfoNotProvided"
          checked={!formField?.questionInfo}
          labelText={t('no', 'No')}
          onClick={handleQuestionInfoToggle}
          value="false"
        />
      </RadioButtonGroup>
      {isQuestionInfoVisible && (
        <TextInput
          id="questionInfo"
          labelText={t('questionInfo', 'Additional Question Info')}
          placeholder={t(
            'questionInfoPlaceholder',
            'Enter any relevant info about the question to provide more context.',
          )}
          value={formField?.questionInfo}
          onChange={handleQuestionInfoChange}
        />
      )}
    </>
  );
};

export default Question;
