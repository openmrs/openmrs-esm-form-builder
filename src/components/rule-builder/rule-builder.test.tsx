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
  it('should render the rule builder without crashing', async () => {
    renderRuleBuilder();
    const whenContainer = document.querySelector('#when-rule-descriptor');
    expect(whenContainer).toBeInTheDocument();
    const thenContainer = document.querySelector('#then-rule-descriptor');
    expect(thenContainer).toBeInTheDocument();
    const user = userEvent.setup();
    const options = document.querySelector('#options-menu');
    await user.click(options);
    const addAction = document.querySelector('#addAction');
    await user.click(addAction);
    const andContainer = document.querySelector('#and-rule-descriptor');
    expect(andContainer).toBeInTheDocument();
  });

  it('should display the conditional value dropdown based on selected target condition', async () => {
    renderRuleBuilder();
    const targetCondition = screen.getByLabelText('target-condition');
    expect(targetCondition).toBeInTheDocument();
    const user = userEvent.setup();

    // To check if the target-value dropdown is visible based on target-condition
    await user.click(targetCondition);
    const dropDownButton = screen.getByText('Select Condition');
    await user.click(dropDownButton);
    const equalsCondition = screen.getByText('Equals');
    await userEvent.click(equalsCondition);
    const conditionalValueDropDown = document.querySelector('#target-value');
    expect(conditionalValueDropDown).toBeInTheDocument();

    // To check if the target-value dropdown is not visible based on target-condition
    const selectedCondition = screen.getByText('Equals');
    await userEvent.click(selectedCondition);
    const isEmptyCondition = screen.getByText('Is Empty');
    await user.click(isEmptyCondition);
    expect(conditionalValueDropDown).not.toBeInTheDocument();
  });

  it('should display the error message box based on the selected target action', async () => {
    renderRuleBuilder();
    const targetAction = screen.getByLabelText('action-condition');
    expect(targetAction).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(targetAction);

    // To check if the Error Message Box is visible based on target action
    const dropDownButton = screen.getByText('Select an action');
    await user.click(dropDownButton);
    const failAction = screen.getByText('Fail');
    await user.click(failAction);
    const errorMessageBox = screen.getByLabelText('error-message');
    expect(errorMessageBox).toBeInTheDocument();

    // To check if the Error Message Box is not visible based on target action
    const selectedAction = screen.getByText('Fail');
    await user.click(selectedAction);
    const hideAction = screen.getByText('Hide');
    await user.click(hideAction);
    expect(errorMessageBox).not.toBeInTheDocument();
  });

  it('should display the calculate expression logic', async () => {
    renderRuleBuilder();
    const targetAction = screen.getByLabelText('action-condition');
    expect(targetAction).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(targetAction);

    // To check if the calculate action exists
    const dropdownBtn = screen.getByText('Select an action');
    await user.click(dropdownBtn);
    const calculateAction = screen.getByText('Calculate');
    await user.click(calculateAction);
    const fnDropdown = screen.getByText('Select Calculate Expression');
    expect(fnDropdown).toBeInTheDocument();
    await user.click(fnDropdown);

    // To check if the calculating function exists based on the target action
    const functionName = screen.getByText('BSA');
    expect(functionName).toBeInTheDocument();
  });

  it('should render the multi-select input box', async () => {
    renderRuleBuilder();
    const targetCondition = screen.getByLabelText('target-condition');
    expect(targetCondition).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(targetCondition);
    const dropDownButton = screen.getByText('Select Condition');
    await user.click(dropDownButton);
    const arrContainsCondition = screen.getByText('Contains any');
    expect(arrContainsCondition).toBeInTheDocument();
    await user.click(arrContainsCondition);
    const mutliSelectBox = document.querySelector('#multi-select');
    expect(mutliSelectBox).toBeInTheDocument();
  });

  it('should render the disable action field', async () => {
    renderRuleBuilder();
    const targetAction = screen.getByLabelText('action-condition');
    const user = userEvent.setup();
    await user.click(targetAction);

    // To check if the disable action exists
    const dropdownBtn = screen.getByText('Select an action');
    expect(dropdownBtn).toBeInTheDocument();
    await user.click(dropdownBtn);
    const disableAction = screen.getByText('Disable');
    expect(disableAction).toBeInTheDocument();
    await user.click(disableAction);
  });

  it('should dynamically render the action field based on the selection of hiding a page or section', async () => {
    const user = userEvent.setup();

    // Test hiding the page field
    renderRuleBuilder();
    const actionConditionSelect = screen.getByLabelText('action-condition');
    await user.click(actionConditionSelect);

    // Verify the dropdown for selecting an action is present
    const actionDropdown = screen.getByText('Select an action');
    expect(actionDropdown).toBeInTheDocument();
    await user.click(actionDropdown);

    // Select and verify the "Hide (page)" action
    const hidePageOption = screen.getByText('Hide (page)');
    expect(hidePageOption).toBeInTheDocument();
    await user.click(hidePageOption);

    // Verify the page selection field is present
    const pageSelectionField = screen.getByText('Select a page');
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
