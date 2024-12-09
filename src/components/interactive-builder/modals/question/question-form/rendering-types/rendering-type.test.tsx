import React from 'react';
import { render, screen } from '@testing-library/react';
import RenderingTypeComponent from './rendering-type.component';
import type { FormField } from '@openmrs/esm-form-engine-lib';

const mockSetFormField = jest.fn();
const formField: FormField = {
  datePickerFormat: 'both',
  type: 'obs',
  questionOptions: { rendering: 'date' },
  id: '1',
};

describe('RenderingType Component', () => {
  it('renders the date component for rendering type date', () => {
    renderRenderingTypeComponent();

    const dateComponent = screen.getByText(/the type of date picker to show/i);

    expect(dateComponent).toBeInTheDocument();
  });

  it('renders the textarea component for rendering type textarea', () => {
    formField.questionOptions.rendering = 'textarea';
    renderRenderingTypeComponent();

    const textareaComponent = screen.getByText(/rows/i);

    expect(textareaComponent).toBeInTheDocument();
  });

  it('renders the toggle component for rendering type toggle', () => {
    formField.questionOptions.rendering = 'toggle';
    renderRenderingTypeComponent();

    const toggleComponentLabelTrue = screen.getByText(/label true/i);
    const toggleComponentLabelFalse = screen.getByText(/label false/i);

    expect(toggleComponentLabelTrue).toBeInTheDocument();
    expect(toggleComponentLabelFalse).toBeInTheDocument();
  });

  it('renders the text component for rendering type text', () => {
    formField.questionOptions.rendering = 'text';
    renderRenderingTypeComponent();

    const textComponentMinLength = screen.getByText(/min length/i);
    const textComponentMaxLength = screen.getByText(/max length/i);

    expect(textComponentMinLength).toBeInTheDocument();
    expect(textComponentMaxLength).toBeInTheDocument();
  });

  it('renders the ui-select component for rendering type number', () => {
    formField.questionOptions.rendering = 'number';
    renderRenderingTypeComponent();

    const numberComponentMin = screen.getByText(/min value that can be entered/i);
    const numberComponentMax = screen.getByText(/max value that can be entered/i);

    expect(numberComponentMin).toBeInTheDocument();
    expect(numberComponentMax).toBeInTheDocument();
  });

  it('renders the ui-select-extended component for rendering type ui-select-extended', () => {
    formField.questionOptions.rendering = 'ui-select-extended';
    renderRenderingTypeComponent();

    const uiSelectExtendedComponent = screen.getByText(/is the ui-select-extended rendering searchable/i);

    expect(uiSelectExtendedComponent).toBeInTheDocument();
  });

  it('renders component only if rendering type is allowed', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    formField.type = 'encounterLocation';
    formField.questionOptions.rendering = 'date';
    renderRenderingTypeComponent();

    expect(screen.queryByText(/the type of date picker to show/i)).not.toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `No component found for rendering type: ${formField.questionOptions.rendering} or a rendering type is not available for ${formField.type}`,
    );
    consoleErrorSpy.mockRestore();
  });
});

function renderRenderingTypeComponent() {
  render(<RenderingTypeComponent formField={formField} setFormField={mockSetFormField} />);
}
