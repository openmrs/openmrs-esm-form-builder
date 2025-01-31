import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { Concept } from '@types';

interface FormFieldContextType {
  formField: FormField;
  setFormField: React.Dispatch<React.SetStateAction<FormField>>;
  concept: Concept;
  setConcept: React.Dispatch<React.SetStateAction<Concept>>;
}

const FormFieldContext = createContext<FormFieldContextType | undefined>(undefined);

export const FormFieldProvider: React.FC<{
  children: ReactNode;
  initialFormField: FormField;
  isObsGrouped?: boolean;
  selectedConcept?: Concept;
}> = ({ children, initialFormField, isObsGrouped = false, selectedConcept = null }) => {
  const [formField, setFormField] = useState<FormField>(initialFormField);
  const [concept, setConcept] = useState<Concept | null>(selectedConcept);

  const updateObsGroupedQuestion = useCallback(
    (updatedObsGroupFormField: FormField) => {
      setFormField((prevFormField) => {
        const formFieldCopy = { ...prevFormField };
        if (formFieldCopy.questions) {
          if (formFieldCopy.questions?.length === 1 && formFieldCopy.questions[0].id === '') {
            formFieldCopy.questions[0] = updatedObsGroupFormField;
          } else {
            formFieldCopy.questions.pop();
            formFieldCopy.questions.push(updatedObsGroupFormField);
          }
        }
        return formFieldCopy;
      });
    },
    [setFormField],
  );

  return (
    <FormFieldContext.Provider
      value={{ formField, setFormField: isObsGrouped ? updateObsGroupedQuestion : setFormField, concept, setConcept }}
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
