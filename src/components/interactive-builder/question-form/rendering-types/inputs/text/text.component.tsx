import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@carbon/react';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { ComponentProps } from '../../../../../../types';

const Text: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();
  const [min, setMin] = useState(formField.questionOptions?.min ?? '');
  const [max, setMax] = useState(formField.questionOptions?.min ?? '');
  return (
    <>
      <TextInput
        id="minLength"
        labelText="Min length of characters "
        value={min || ''}
        invalid={parseFloat(min) > parseFloat(max)}
        invalidText={
          parseFloat(min) > parseFloat(max) ? t('invalidMinMax', 'Min value cannot be greater than max') : ''
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setMin(event.target.value);
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
        value={max || ''}
        invalid={parseFloat(min) > parseFloat(max)}
        invalidText={
          parseFloat(min) > parseFloat(max) ? t('invalidMinMax', 'Min value cannot be greater than max') : ''
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setMax(event.target.value);
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
