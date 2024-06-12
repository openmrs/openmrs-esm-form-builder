import React from 'react';
import { render, screen } from '@testing-library/react';
import RuleBuilder from './rule-builder.component';
import { schema, textRenderingQuestion, useFormMockValues } from '../../../__mocks__/rule-builder.mock';
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

    // To check if the target-condition dropdown is visible based on target-condition
    await user.click(targetCondition);
    const dropDownButton = screen.getByText('Select Condition');
    await user.click(dropDownButton);
    const equalsCondition = screen.getByText('Equals');
    await userEvent.click(equalsCondition);
    const conditionalValueDropDown = document.querySelector('#target-value');
    expect(conditionalValueDropDown).toBeInTheDocument();

    // To check if the target-condition dropdown is not visible based on target-condition
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
    const dropDownButton = screen.getByText('Select a action');
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
});

function renderRuleBuilder() {
  render(
    <RuleBuilder
      key="name"
      ruleId={ruleId}
      isNewRule={false}
      question={textRenderingQuestion}
      pageIndex={0}
      sectionIndex={0}
      questionIndex={0}
      handleAddLogic={handleAddLogic}
      schema={schema}
      onSchemaChange={onSchemaChange}
    />,
  );
}
