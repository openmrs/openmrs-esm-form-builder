import React from 'react';
import { ObsTypeQuestion, ProgramStateTypeQuestion, PatientIdentifierTypeQuestion } from './inputs';
import { useFormField } from '../../form-field-context';
import type { QuestionType } from '@types';

const componentMap: Partial<Record<QuestionType, React.FC>> = {
  obs: ObsTypeQuestion,
  programState: ProgramStateTypeQuestion,
  patientIdentifier: PatientIdentifierTypeQuestion,
  obsGroup: ObsTypeQuestion,
};

const QuestionTypeComponent: React.FC = () => {
  const { formField } = useFormField();
  const Component = componentMap[formField.type as QuestionType];
  if (!Component) {
    console.error(`No component found for questiontype: ${formField.type}`);
    return null;
  }
  return <Component />;
};

export default QuestionTypeComponent;
