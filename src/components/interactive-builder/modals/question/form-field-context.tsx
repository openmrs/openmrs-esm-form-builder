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
        let newFormField = { ...prevFormField, ...updatedObsGroupFormField };

        if (!prevFormField.questions) {
          newFormField.questions = [updatedObsGroupFormField];
          return newFormField;
        }

        const placeholderIndex = prevFormField.questions.findIndex((q) => q.id === '');
        if (placeholderIndex !== -1) {
          const updatedQuestions = [...prevFormField.questions];
          updatedQuestions[placeholderIndex] = {
            ...updatedQuestions[placeholderIndex],
            ...updatedObsGroupFormField,
          };
          newFormField.questions = updatedQuestions;
          return newFormField;
        }

        const matchIndex = prevFormField.questions.findIndex((q) => q.id === updatedObsGroupFormField.id);
        if (matchIndex !== -1) {
          const updatedQuestions = [...prevFormField.questions];
          updatedQuestions[matchIndex] = {
            ...updatedQuestions[matchIndex],
            ...updatedObsGroupFormField,
          };
          newFormField.questions = updatedQuestions;
          return newFormField;
        }

        const updatedQuestions = [...prevFormField.questions];
        updatedQuestions[updatedQuestions.length - 1] = {
          ...updatedQuestions[updatedQuestions.length - 1],
          ...updatedObsGroupFormField,
        };
        newFormField.questions = updatedQuestions;
        return newFormField;
      });
    },
    [setFormField],
  );

  return (
    <FormFieldContext.Provider
      value={{
        formField,
        setFormField: isObsGrouped ? updateObsGroupedQuestion : setFormField,
        concept,
        setConcept,
      }}
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
