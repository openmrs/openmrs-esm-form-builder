import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@carbon/react';
import { useFormField } from '../../../../form-field-context';

const Text: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();

  const checkIfInvalid = useCallback(() => {
    if (parseFloat(formField.questionOptions?.minLength ?? '') > parseFloat(formField.questionOptions?.maxLength ?? ''))
      return true;
    else false;
  }, [formField.questionOptions?.maxLength, formField.questionOptions?.minLength]);

  const getInvalidText = useCallback(() => {
    const invalid = checkIfInvalid();
    if (invalid) return t('invalidMinMax', 'Min value cannot be greater than max');
    else return '';
  }, [checkIfInvalid, t]);

  return (
    <>
      <TextInput
        id="minLength"
        labelText="Min length of characters"
        value={formField.questionOptions?.minLength ?? ''}
        invalid={checkIfInvalid()}
        invalidText={getInvalidText()}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const updatedQuestion = {
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
        invalid={checkIfInvalid()}
        invalidText={getInvalidText}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const updatedQuestion = {
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
