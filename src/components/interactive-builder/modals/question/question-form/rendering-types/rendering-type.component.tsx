import React from 'react';
import { Date, Markdown, Number, SelectAnswers, Text, TextArea, Toggle, UiSelectExtended } from './inputs';
import { useFormField } from '../../form-field-context';
import type { RenderType } from '@openmrs/esm-form-engine-lib';
import { renderTypeOptions, renderingTypes } from '@constants';

const componentMap: Partial<Record<RenderType, React.FC>> = {
  number: Number,
  text: Text,
  textarea: TextArea,
  toggle: Toggle,
  'ui-select-extended': UiSelectExtended,
  date: Date,
  datetime: Date,
  markdown: Markdown,
  select: SelectAnswers,
  radio: SelectAnswers,
  checkbox: SelectAnswers,
};

const RenderTypeComponent: React.FC = () => {
  const { formField } = useFormField();
  // Get allowed rendering types based on formField.type
  const allowedRenderingTypes =
    formField.type && formField.type !== 'obs' ? renderTypeOptions[formField.type] : renderingTypes;

  // Only get component if rendering type is allowed. Exception is program state because selecting the states is also implemented in the SelectAnswers component
  const Component =
    allowedRenderingTypes?.includes(formField.questionOptions?.rendering) && formField.type !== 'programState'
      ? componentMap[formField.questionOptions?.rendering]
      : null;

  if (!Component) {
    if (formField.questionOptions?.rendering) {
      console.error(
        `No component found for rendering type: ${formField.questionOptions.rendering} or a rendering type is not available for ${formField.type}`,
      );
    }
    return null;
  }

  return <Component />;
};

export default RenderTypeComponent;
