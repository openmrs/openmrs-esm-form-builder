import React, { useCallback } from 'react';
import { TextInput, Button, Select, SelectItem, RadioButtonGroup, RadioButton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import RenderTypeComponent from '../rendering-types/rendering-type.component';
import QuestionTypeComponent from '../question-types/question-type.component';
import RequiredLabel from '../common/required-label/required-label.component';
import { useFormField } from '../../form-field-context';
import type { FormField, RenderType } from '@openmrs/esm-form-engine-lib';
import { questionTypes, renderTypeOptions, renderingTypes } from '@constants';
import styles from './question.scss';

interface QuestionProps {
  checkIfQuestionIdExists: (idToTest: string) => boolean;
}

const Question: React.FC<QuestionProps> = ({ checkIfQuestionIdExists }) => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();

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
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
          setFormField({ ...formField, type: event.target.value })
        }
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
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
          const updatedObject: FormField =
            formField === null
              ? { ...formField, questionOptions: { rendering: event.target.value as RenderType } }
              : {
                  ...formField,
                  questionOptions: {
                    ...formField.questionOptions,
                    rendering: event.target.value as RenderType,
                  },
                };
          setFormField(updatedObject);
        }}
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
            defaultSelected={formField.required ? 'required' : 'optional'}
            name="isQuestionRequired"
            legendText={t(
              'isQuestionRequiredOrOptional',
              'Is this question a required or optional field? Required fields must be answered before the form can be submitted.',
            )}
          >
            <RadioButton
              id="questionIsNotRequired"
              defaultChecked={formField.required ? !formField.required : true}
              labelText={t('optional', 'Optional')}
              onClick={() => setFormField({ ...formField, required: false })}
              value="optional"
            />
            <RadioButton
              id="questionIsRequired"
              defaultChecked={formField.required ? formField.required : false}
              labelText={t('required', 'Required')}
              onClick={() => setFormField({ ...formField, required: true })}
              value="required"
            />
          </RadioButtonGroup>
        </>
      )}
      {formField.type && <QuestionTypeComponent />}
      {formField.questionOptions?.rendering && <RenderTypeComponent />}
    </>
  );
};

export default Question;
