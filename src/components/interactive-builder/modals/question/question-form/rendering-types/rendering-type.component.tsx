import React from 'react';
import { Date, Markdown, Number, Text, TextArea, Toggle, UiSelectExtended } from './inputs';
import type { RenderType } from '@openmrs/esm-form-engine-lib';
import type { ComponentProps } from '@types';
import { renderTypeOptions, renderingTypes } from '@constants';

const componentMap: Partial<Record<RenderType, React.FC<ComponentProps>>> = {
  number: Number,
  text: Text,
  textarea: TextArea,
  toggle: Toggle,
  'ui-select-extended': UiSelectExtended,
  date: Date,
  datetime: Date,
  markdown: Markdown,
};

const RenderTypeComponent: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  // Get allowed rendering types based on formField.type
  const allowedRenderingTypes =
    formField.type && formField.type !== 'obs' ? renderTypeOptions[formField.type] : renderingTypes;

  // Only get component if rendering type is allowed
  const Component = allowedRenderingTypes?.includes(formField.questionOptions?.rendering)
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

  return <Component formField={formField} setFormField={setFormField} />;
};

export default RenderTypeComponent;
