import React from 'react';
import { render } from '@testing-library/react';
import { textRenderingQuestion, dateRenderingQuestion } from '../../../__mocks__/rule-builder.mock';
import userEvent from '@testing-library/user-event';
import { RuleHeader } from './rule-builder.component';

const handleToggle = jest.fn();
const ruleId = 'a0776e98-86d8-460f-a2c4-26dc97e6fc8a';

describe('RuleHeader', () => {

  it('should render the required toggle button', () => {
    renderRuleHeader(false);
    const requiredToggle = document.querySelector(`#toggle-required-${ruleId}`);
    expect(requiredToggle).toBeInTheDocument();
  });

  it('should render the allow future date toggle button', () => {
    renderRuleHeader(true);
    const dateToggle = document.querySelector(`#future-date-${ruleId}`);
    expect(dateToggle).toBeInTheDocument();
  });

  it('should not render the allow future date toggle button', () => {
    renderRuleHeader(false);
    const dateToggle = document.querySelector(`#future-date-${ruleId}`);
    expect(dateToggle).not.toBeInTheDocument();
  });

  it('should check the required toggle button is clicked', async () => {
    renderRuleHeader(false);
    const requiredToggle = document.querySelector(`#toggle-required-${ruleId}`);
    const user = userEvent.setup();
    await user.click(requiredToggle);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('should check the allow future toggle button is clicked', async () => {
    renderRuleHeader(true);
    const dateToggle = document.querySelector(`#future-date-${ruleId}`);
    const user = userEvent.setup();
    await user.click(dateToggle);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});

function renderRuleHeader(isDate: boolean) {
  render(
    <RuleHeader
      ruleId={ruleId}
      question={isDate ? dateRenderingQuestion : textRenderingQuestion}
      isRequired={true}
      handleToggle={handleToggle}
    />
  );
}
