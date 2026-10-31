import React from 'react';
import { SWRConfig } from 'swr';
import { vi } from 'vitest';
import { type RenderOptions, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { openmrsFetch, useOpenmrsFetchAll } from '@openmrs/esm-framework';

const mockedUseOpenmrsFetchAll = vi.mocked(useOpenmrsFetchAll);
const realUseOpenmrsFetchAll = mockedUseOpenmrsFetchAll.getMockImplementation();

// This component wraps whatever component is passed to it with an SWRConfig context which provides a global configuration for all SWR hooks.
const swrWrapper = ({ children }: { children: React.ReactNode }) => {
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
export const renderWithSwr = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: swrWrapper, ...options });

// Helper function that waits for a loading state to disappear from the screen
export function waitForLoadingToFinish() {
  return waitForElementToBeRemoved(() => [...screen.queryAllByRole('progressbar')], {
    timeout: 4000,
  });
}

// The framework mock of `useOpenmrsFetchAll` runs the real hook, which fetches with the real `openmrsFetch`.
// This routes its requests through the mocked `openmrsFetch` instead, so tests can stub paginated responses.
export function fetchAllPagesWithMockedOpenmrsFetch() {
  mockedUseOpenmrsFetchAll.mockImplementation((url, options) =>
    realUseOpenmrsFetchAll(url, { ...options, fetcher: openmrsFetch }),
  );
}
