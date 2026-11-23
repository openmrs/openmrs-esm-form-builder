import Ajv from 'ajv';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useStandardFormSchema } from './useStandardFormSchema';

describe('useStandardFormSchema', () => {
  it('returns the reference schema without fetching it', () => {
    const { result } = renderHook(() => useStandardFormSchema());

    const validate = new Ajv({ allErrors: true, jsPropertySyntax: true, strict: false }).compile(result.current.schema);

    expect(validate({ name: 42, pages: [], processor: 'EncounterFormProcessor', uuid: 'xyz' })).toBe(false);
    expect(validate.errors).toContainEqual(
      expect.objectContaining({ instancePath: '.name', message: 'must be string' }),
    );
    expect(result.current.schemaProperties).toHaveProperty('pages');
  });
});
