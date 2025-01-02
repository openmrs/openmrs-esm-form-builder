import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { FormField } from '@openmrs/esm-form-engine-lib';

interface FormFieldContextType {
  formField: FormField;
  setFormField: React.Dispatch<React.SetStateAction<FormField>>;
}

const FormFieldContext = createContext<FormFieldContextType | undefined>(undefined);

export const FormFieldProvider: React.FC<{
  children: ReactNode;
  initialFormField: FormField;
  isObsGrouped?: boolean;
}> = ({ children, initialFormField, isObsGrouped = false }) => {
  const [formField, setFormField] = useState<FormField>(initialFormField);

  const updateObsGroupedQuestion = useCallback(
    (updatedObsGroupFormField: FormField) => {
      const formFieldCopy = { ...formField };
      if (formFieldCopy.questions.length === 1 && formFieldCopy.questions[0].id === '') {
        formFieldCopy.questions[0] = updatedObsGroupFormField;
      } else {
        formFieldCopy.questions.pop();
        formFieldCopy.questions.push(updatedObsGroupFormField);
      }
      setFormField(formFieldCopy);
    },
    [formField, setFormField],
  );

  return (
    <FormFieldContext.Provider
      value={{ formField, setFormField: isObsGrouped ? updateObsGroupedQuestion : setFormField }}
    >
      {children}
    </FormFieldContext.Provider>
  );
};

export const useFormField = (): FormFieldContextType => {
  const context = useContext(FormFieldContext);
  if (!context) {
    throw new Error('useFormField must be used within a FormFieldProvider');
  }
  return context;
};
