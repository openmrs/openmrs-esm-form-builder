import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { fetchAllPagesWithMockedOpenmrsFetch } from '@tools/test-helpers';
import { useEncounterTypes } from './useEncounterTypes';

const mockedOpenmrsFetch = vi.mocked(openmrsFetch);

describe('useEncounterTypes', () => {
  beforeEach(() => {
    fetchAllPagesWithMockedOpenmrsFetch();
  });

  it('returns the encounter types from every page of the paginated response', async () => {
    mockedOpenmrsFetch.mockImplementation((url: string) => {
      if (url.includes('startIndex=1')) {
        return Promise.resolve({
          data: { results: [{ uuid: 'second-page-encounter-type', name: 'Discharge' }] },
        } as unknown as FetchResponse);
      }

      return Promise.resolve({
        data: {
          results: [{ uuid: 'first-page-encounter-type', name: 'Admission' }],
          links: [{ rel: 'next', uri: 'http://localhost/openmrs/ws/rest/v1/encountertype?startIndex=1' }],
        },
      } as unknown as FetchResponse);
    });

    const { result } = renderHook(() => useEncounterTypes());

    await waitFor(() => expect(result.current.isEncounterTypesLoading).toBe(false));

    expect(result.current.encounterTypes).toEqual([
      { uuid: 'first-page-encounter-type', name: 'Admission' },
      { uuid: 'second-page-encounter-type', name: 'Discharge' },
    ]);
  });
});
