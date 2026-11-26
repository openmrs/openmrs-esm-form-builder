import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { type Session, useSession } from '@openmrs/esm-framework';
import { useLanguageOptions } from './getLanguageOptionsFromSession';

const mockUseSession = vi.mocked(useSession);

describe('useLanguageOptions', () => {
  it('keeps the capitalisation of multi-word language names', () => {
    mockUseSession.mockReturnValue({ locale: 'en', allowedLocales: ['en', 'en-GB', 'pt-BR', 'zh-CN'] } as Session);

    const { result } = renderHook(() => useLanguageOptions());

    expect(result.current.map((option) => option.label)).toEqual([
      'English (en)',
      'British English (en-GB)',
      'Brazilian Portuguese (pt-BR)',
      'Chinese (China) (zh-CN)',
    ]);
  });

  it('capitalises the first letter of names the locale writes in lowercase', () => {
    mockUseSession.mockReturnValue({ locale: 'fr', allowedLocales: ['en-GB'] } as Session);

    const { result } = renderHook(() => useLanguageOptions());

    expect(result.current[0].label).toBe('Anglais britannique (en-GB)');
  });
});
