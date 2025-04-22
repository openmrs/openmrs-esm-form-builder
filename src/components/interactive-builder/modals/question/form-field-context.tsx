import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { Concept } from '@types';

interface FormFieldContextType {
  formField: FormField;
  setFormField: (value: FormField | ((prev: FormField) => FormField)) => void;
  concept: Concept;
  setConcept: React.Dispatch<React.SetStateAction<Concept>>;
  isConceptValid?: boolean;
  setIsConceptValid?: React.Dispatch<React.SetStateAction<boolean>>;
  updateParentFormField?: (updatedFormField: FormField) => void;
  isObsGrouped?: boolean;
}

const FormFieldContext = createContext<FormFieldContextType | undefined>(undefined);

export const FormFieldProvider: React.FC<{
  children: ReactNode;
  initialFormField: FormField;
  isObsGrouped?: boolean;
  selectedConcept?: Concept;
  updateParentFormField?: (updatedFormField: FormField) => void;
}> = ({ children, initialFormField, isObsGrouped = false, selectedConcept = null, updateParentFormField }) => {
  const [formField, setFormFieldInternal] = useState<FormField>(initialFormField);
  const [concept, setConcept] = useState<Concept | null>(selectedConcept);
  const [isConceptValid, setIsConceptValid] = useState<boolean>(true);

  const setFormField = useCallback(
    (valueOrUpdater: FormField | ((prev: FormField) => FormField)) => {
      if (isObsGrouped) {
        const newValue = typeof valueOrUpdater === 'function' ? valueOrUpdater(formField) : valueOrUpdater;
        setFormFieldInternal(newValue);
        updateParentFormField?.(newValue);
      } else {
        setFormFieldInternal(valueOrUpdater);
      }
    },
    [isObsGrouped, updateParentFormField, formField],
  );

  return (
    <FormFieldContext.Provider
      value={{
        formField,
        setFormField,
        concept,
        setConcept,
        isConceptValid,
        setIsConceptValid,
        updateParentFormField,
        isObsGrouped,
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
