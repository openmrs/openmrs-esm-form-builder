import React from 'react';
import { ObsTypeQuestion, ProgramStateTypeQuestion, PatientIdentifierTypeQuestion } from './inputs';
import type { QuestionType, ComponentProps } from '../../../../types';

const componentMap: Partial<Record<QuestionType, React.FC<ComponentProps>>> = {
  obs: ObsTypeQuestion,
  programState: ProgramStateTypeQuestion,
  patientIdentifier: PatientIdentifierTypeQuestion,
};

const QuestionTypeComponent: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const Component = componentMap[formField.type];
  if (!Component) {
    console.error(`No component found for questiontype: ${formField.type}`);
    return null;
  }
  return <Component formField={formField} setFormField={setFormField} />;
};

export default QuestionTypeComponent;
