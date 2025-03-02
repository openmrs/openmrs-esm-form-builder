import React from 'react';
import { ObsTypeQuestion, ProgramStateTypeQuestion, PatientIdentifierTypeQuestion } from './inputs';
import { useFormField } from '../../form-field-context';
import type { QuestionType } from '@types';

interface QuestionTypeComponentProps {
  setIsConceptIdValid?: React.Dispatch<React.SetStateAction<boolean>>;
}

const componentMap: Partial<
  Record<QuestionType, React.FC<{ setIsConceptIdValid?: React.Dispatch<React.SetStateAction<boolean>> }>>
> = {
  obs: ObsTypeQuestion,
  programState: ProgramStateTypeQuestion,
  patientIdentifier: PatientIdentifierTypeQuestion,
  obsGroup: ObsTypeQuestion,
};

const QuestionTypeComponent: React.FC<QuestionTypeComponentProps> = ({ setIsConceptIdValid }) => {
  const { formField } = useFormField();
  const Component = componentMap[formField.type as QuestionType];
  if (!Component) {
    console.error(`No component found for questiontype: ${formField.type}`);
    return null;
  }
  return <Component setIsConceptIdValid={setIsConceptIdValid} />;
};

export default QuestionTypeComponent;
