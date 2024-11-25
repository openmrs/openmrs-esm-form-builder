import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@carbon/react';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { ComponentProps } from '../../../../../../types';

const Toggle: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();
  return (
    <>
      <TextInput
        id="labelTrue"
        labelText={t('labelTrue', 'Label true')}
        value={formField.questionOptions?.toggleOptions?.labelTrue ?? ''}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const updatedQuestion: FormField = {
            ...formField,
            questionOptions: {
              ...formField.questionOptions,
              toggleOptions: { ...formField.questionOptions.toggleOptions, labelTrue: event.target.value },
            },
          };
          setFormField(updatedQuestion);
        }}
        placeholder={t('on', 'On')}
      />
      <TextInput
        id="labelFalse"
        labelText={t('labelFalse', 'Label false')}
        value={formField.questionOptions?.toggleOptions?.labelFalse ?? ''}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const updatedQuestion: FormField = {
            ...formField,
            questionOptions: {
              ...formField.questionOptions,
              toggleOptions: { ...formField.questionOptions.toggleOptions, labelFalse: event.target.value },
            },
          };
          setFormField(updatedQuestion);
        }}
        placeholder={t('off', 'Off')}
      />
    </>
  );
};

export default Toggle;
