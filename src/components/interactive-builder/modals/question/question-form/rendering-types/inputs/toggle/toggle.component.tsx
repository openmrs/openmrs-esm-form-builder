import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@carbon/react';
import { useFormField } from '../../../../form-field-context';

const Toggle: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();

  return (
    <>
      <TextInput
        id="labelTrue"
        labelText={t('labelTrue', 'Label true')}
        value={formField.questionOptions?.toggleOptions?.labelTrue ?? ''}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const updatedQuestion = {
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
          const updatedQuestion = {
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
