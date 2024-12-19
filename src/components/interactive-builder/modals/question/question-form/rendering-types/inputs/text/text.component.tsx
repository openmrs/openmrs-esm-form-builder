import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@carbon/react';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { ComponentProps } from '@types';

const Text: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();
  return (
    <>
      <TextInput
        id="minLength"
        labelText="Min length of characters "
        value={formField.questionOptions?.minLength ?? ''}
        invalid={
          parseFloat(formField.questionOptions?.minLength ?? '') >
          parseFloat(formField.questionOptions?.maxLength ?? '')
        }
        invalidText={
          parseFloat(formField.questionOptions?.minLength ?? '') >
          parseFloat(formField.questionOptions?.maxLength ?? '')
            ? t('invalidMinMax', 'Min value cannot be greater than max')
            : ''
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const updatedQuestion: FormField = {
            ...formField,
            questionOptions: { ...formField.questionOptions, minLength: event.target.value },
          };
          setFormField(updatedQuestion);
        }}
      />
      <TextInput
        id="maxLength"
        labelText="Max length of characters"
        value={formField.questionOptions?.maxLength ?? ''}
        invalid={
          parseFloat(formField.questionOptions?.minLength ?? '') >
          parseFloat(formField.questionOptions?.maxLength ?? '')
        }
        invalidText={
          parseFloat(formField.questionOptions?.minLength ?? '') >
          parseFloat(formField.questionOptions?.maxLength ?? '')
            ? t('invalidMinMax', 'Min value cannot be greater than max')
            : ''
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const updatedQuestion: FormField = {
            ...formField,
            questionOptions: { ...formField.questionOptions, maxLength: event.target.value },
          };
          setFormField(updatedQuestion);
        }}
      />
    </>
  );
};

export default Text;
