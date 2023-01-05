import React from "react";
import { SWRConfig } from "swr";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";

// This component wraps whatever component is passed to it with an SWRConfig context which provides a global configuration for all SWR hooks.
const swrWrapper = ({ children }) => {
  return (
    <SWRConfig
      value={{
        // Sets the `dedupingInterval` to 0 - we don't need to dedupe requests in our test environment.
        dedupingInterval: 0,
        // Returns a new Map object, effectively wrapping our application with an empty cache provider. This is useful for resetting the SWR cache between test cases.
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  );
};

// Render the provided component within the wrapper we created above
export const renderWithSwr = (ui, options?) =>
  render(ui, { wrapper: swrWrapper, ...options });

// Helper function that waits for a loading state to disappear from the screen
export function waitForLoadingToFinish() {
  return waitForElementToBeRemoved(
    () => [...screen.queryAllByRole(/progressbar/i)],
    {
      timeout: 4000,
    }
  );
}
