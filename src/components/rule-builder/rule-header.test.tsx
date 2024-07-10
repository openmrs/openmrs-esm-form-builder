import React from 'react';
import { render, screen } from '@testing-library/react';
import { numberRenderingQuestion, dateRenderingQuestion } from '../../../__mocks__/rule-builder.mock';
import userEvent from '@testing-library/user-event';
import { RuleHeader } from './rule-builder.component';

const handleRequiredChange = jest.fn();
const handleAllowFutureDateChange = jest.fn();
const handleDisallowDecimalValueChange = jest.fn();

const ruleId = 'a0776e98-86d8-460f-a2c4-26dc97e6fc8a';

describe('RuleHeader', () => {
  it('should render the required toggle button', () => {
    renderRuleHeader(false);
    const requiredToggle = screen.getByLabelText(/Toggle Required/i, { selector: `#toggle-required-${ruleId}` });
    expect(requiredToggle).toBeInTheDocument();
  });

  it('should render the allow future date toggle button', () => {
    renderRuleHeader(true);
    const dateToggleButton = screen.getByLabelText(/Toggle Allow Future Dates/i, { selector: `#toggle-allow-future-date-${ruleId}`});
    expect(dateToggleButton).toBeInTheDocument();
  });

  it('should render the disallow decimal value toggle button', () => {
    renderRuleHeader(false);
    const disAllowDecimalToggleButton = screen.getByLabelText(/Toggle Disallow Decimal Value/i, { selector: `#toggle-disallow-decimal-value-${ruleId}`})
    expect(disAllowDecimalToggleButton).toBeInTheDocument();
  });

  it('should not render the allow future date toggle button', () => {
    renderRuleHeader(false);
    const dateToggleButton = screen.queryByLabelText(/Toggle Allow Future Dates/i, { selector: `#toggle-allow-future-date-${ruleId}`});
    expect(dateToggleButton).not.toBeInTheDocument();
  });

  it('should verify that the required toggle button is clicked', async () => {
    renderRuleHeader(false);
    const requiredToggle = screen.getByLabelText(/Toggle Required/i, { selector: `#toggle-required-${ruleId}`});
    const user = userEvent.setup();
    await user.click(requiredToggle);
    expect(handleRequiredChange).toHaveBeenCalledTimes(1);
  });

  it('should verify that the allow future toggle button is clicked', async () => {
    renderRuleHeader(true);
    const dateToggleButton = screen.getByLabelText(/Toggle Allow Future Dates/i, { selector: `#toggle-allow-future-date-${ruleId}`});
    const user = userEvent.setup();
    await user.click(dateToggleButton);
    expect(handleAllowFutureDateChange).toHaveBeenCalledTimes(1);
  });

  it('should verify that the disallow decimal value toggle button is clicked', async () => {
    renderRuleHeader(false);
    const disAllowDecimalToggleButton = screen.getByLabelText(/Toggle Disallow Decimal Value/i, { selector: `#toggle-disallow-decimal-value-${ruleId}`})
    expect(disAllowDecimalToggleButton).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(disAllowDecimalToggleButton);
    expect(handleDisallowDecimalValueChange).toHaveBeenCalledTimes(1);
  });

  test.each([
    [true, 'on'],
    [false, 'off'],
  ])('should confirm that the required toggle button is in the %s state', (required, state) => {
    renderRuleHeader(true, required);
    const isRequiredToggleButton = screen.getByLabelText(/Toggle Required/i, { selector: `#toggle-required-${ruleId}`})
    expect(isRequiredToggleButton).toBeInTheDocument();
    if (state === 'on') {
      // eslint-disable-next-line playwright/missing-playwright-await
      expect(isRequiredToggleButton).toBeChecked();
    } else if (state === 'off') {
      // eslint-disable-next-line playwright/missing-playwright-await
      expect(isRequiredToggleButton).not.toBeChecked();
    }
  });
});

function renderRuleHeader(
  isDate: boolean,
  isRequired?: boolean,
  isAllowFutureDate?: boolean,
  isDisallowDecimals?: boolean,
) {
  render(
    <RuleHeader
      ruleId={ruleId}
      question={isDate ? dateRenderingQuestion : numberRenderingQuestion}
      isRequired={isRequired ? true : false}
      isAllowFutureDate={isAllowFutureDate ? true : false}
      isDisallowDecimals={isDisallowDecimals ? true : false}
      handleRequiredChange={handleRequiredChange}
      handleAllowFutureDateChange={handleAllowFutureDateChange}
      handleDisallowDecimalValueChange={handleDisallowDecimalValueChange}
    />,
  );
}
