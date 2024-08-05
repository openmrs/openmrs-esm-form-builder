import React from 'react';
import { render, screen } from '@testing-library/react';
import RuleBuilder from './rule-builder.component';
import { schema, numberRenderingQuestion, useFormMockValues } from '../../../__mocks__/rule-builder.mock';
import userEvent from '@testing-library/user-event';

const handleAddLogic = jest.fn();
const onSchemaChange = jest.fn();
const ruleId = 'a0776e98-86d8-460f-a2c4-26dc97e6fc8a';

jest.mock('../../hooks/useFormRule', () => ({
  useFormRule: () => {
    return useFormMockValues;
  },
}));

describe('RuleBuilder', () => {
  it('should render the rule builder without crashing', () => {
    renderRuleBuilder();

    expect(screen.getByText(/When/i)).toBeInTheDocument();
    expect(screen.getByText(/Then/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Select condition/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Select an action/i })).toBeInTheDocument();
  });

  it('should display the conditional value dropdown based on selected target condition', async () => {
    const user = userEvent.setup();

    renderRuleBuilder();

    // Interact with the target condition dropdown
    const targetCondition = screen.getByLabelText(/Target condition/i);
    await user.click(targetCondition);

    // Open and select "Equals" from condition dropdown
    const dropDownButton = screen.getByText(/Select condition/i);
    await user.click(dropDownButton);
    await userEvent.click(screen.getByText('Equals'));

    // Verify the target-value dropdown is visible after Selecting "Equals"
    const conditionalValueDropDown = screen.getByTitle(/Target value/i);
    expect(conditionalValueDropDown).toBeInTheDocument();

    // Change the selection to "Is Empty" and verify the target-value dropdown disappears
    await userEvent.click(screen.getByText('Equals'));
    await user.click(screen.getByText(/Is Empty/i));
    expect(conditionalValueDropDown).not.toBeInTheDocument();
  });

  it('should display the error message box when "Fail" action is selected', async () => {
    const user = userEvent.setup();

    renderRuleBuilder();

    // Select "Fail" action to trigger the error message box
    await user.click(screen.getByLabelText(/Trigger action/i));
    await user.click(screen.getByText('Select an action'));
    await user.click(screen.getByText('Fail'));
    const errorMessageBox = screen.getByLabelText('error-message');
    expect(errorMessageBox).toBeInTheDocument();

    // Change the action to "Hide" which should hide the error message box
    await user.click(screen.getByText(/Fail/i));
    await user.click(screen.getByText('Hide'));
    expect(errorMessageBox).not.toBeInTheDocument();
  });

  it('should display the calculate expression logic when "Calculate" action is selected', async () => {
    const user = userEvent.setup();

    renderRuleBuilder();

    // Select "Calculate" action to trigger the Calculate Expression Dropdown
    await user.click(screen.getByLabelText(/Trigger action/i));
    await user.click(screen.getByText(/Select an action/i));
    await user.click(screen.getByText(/Calculate/i));

    // Verify the "BSA" function is available for calculation logic
    await user.click(screen.getByText(/Select Calculate Expression/i));
    const functionName = screen.getByText(/BSA/i);
    expect(functionName).toBeInTheDocument();
  });

  it('should render the multi-select input box based on the target condition', async () => {
    const user = userEvent.setup();

    renderRuleBuilder();

    // Select "Array Contains any" target condition
    await user.click(screen.getByLabelText(/Target condition/i));
    await user.click(screen.getByText(/Select condition/i));
    const arrContainsCondition = screen.getByText('Contains any');
    expect(arrContainsCondition).toBeInTheDocument();
    await user.click(arrContainsCondition);

    // Verify "Multi Select Input box" is visble based on the target condition
    const mutliSelectBox = screen.getByText(/Select answers/i);
    expect(mutliSelectBox).toBeInTheDocument();
  });

  it('should dynamically render the action field based on the selection of hiding a page or section', async () => {
    const user = userEvent.setup();

    renderRuleBuilder();

    // Test hiding the page field
    const actionConditionSelect = screen.getByLabelText(/Trigger Action/i);
    await user.click(actionConditionSelect);

    // Verify the dropdown for selecting an action is present
    const actionDropdown = screen.getByText(/Select an action/i);
    expect(actionDropdown).toBeInTheDocument();
    await user.click(actionDropdown);

    // Select and verify the "Hide (page)" action
    const hidePageOption = screen.getByText('Hide (page)');
    expect(hidePageOption).toBeInTheDocument();
    await user.click(hidePageOption);

    // Verify the page selection field is present
    const pageSelectionField = screen.getByText(/Select a page/i);
    expect(pageSelectionField).toBeInTheDocument();

    // Test hiding the section field
    renderRuleBuilder();
    await user.click(actionDropdown);

    // Select and verify the "Hide (section)" action
    const hideSectionOption = screen.getByText('Hide (section)');
    expect(hideSectionOption).toBeInTheDocument();
    await user.click(hideSectionOption);

    // Verify the section selection field is present
    const sectionSelectionField = screen.getByText('Select a section');
    expect(sectionSelectionField).toBeInTheDocument();
  });

  it('should display the "DatePicker" only if the target condition is "is Date After" or "is Date Before', async () => {
    const user = userEvent.setup();

    renderRuleBuilder();

    // Interact with the target condition dropdown
    const targetCondition = screen.getByLabelText(/Target condition/i);
    await user.click(targetCondition);

    // Open and select "is Date Before" from condition dropdown
    await user.click(screen.getByText(/Select condition/i));
    await userEvent.click(screen.getByText('Is Date Before'));

    // Verify the Date Picker is visible after Selecting "is Date Before"
    const conditionalValueDropDown = screen.getByLabelText(/Target Date/i);
    expect(conditionalValueDropDown).toBeInTheDocument();
  });
});

function renderRuleBuilder() {
  render(
    <RuleBuilder
      key="name"
      ruleId={ruleId}
      isNewRule={false}
      question={numberRenderingQuestion}
      pageIndex={0}
      sectionIndex={0}
      questionIndex={0}
      handleAddLogic={handleAddLogic}
      schema={schema}
      onSchemaChange={onSchemaChange}
    />,
  );
}
