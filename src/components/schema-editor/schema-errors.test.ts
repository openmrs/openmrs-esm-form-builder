import { describe, expect, it } from 'vitest';
import Ajv from 'ajv';
import { combineAlternativeErrors } from './schema-errors';

const schema = {
  type: 'object',
  definitions: {
    resource: { type: 'object', properties: { uuid: { type: 'string' } } },
  },
  properties: {
    showComment: { oneOf: [{ type: 'boolean' }, { type: 'string' }] },
    encounter: { oneOf: [{ type: 'string' }, { $ref: '#/definitions/resource' }] },
    location: { anyOf: [{ $ref: '#/definitions/resource' }, { type: 'string' }] },
    required: {
      oneOf: [
        { type: 'boolean' },
        { type: 'string' },
        { type: 'object', required: ['referenceQuestionId'], properties: { type: { type: 'string' } } },
      ],
    },
    weeksList: {
      oneOf: [{ type: 'string' }, { type: 'array', items: { oneOf: [{ type: 'string' }, { type: 'number' }] } }],
    },
    name: { type: 'string' },
  },
};

const validate = new Ajv({ allErrors: true, jsPropertySyntax: true, strict: false }).compile(schema);

function errorsFor(data: unknown) {
  validate(data);
  return combineAlternativeErrors(validate.errors ?? []).map(
    ({ instancePath, message }) => `${instancePath} ${message}`,
  );
}

describe('combineAlternativeErrors', () => {
  it('replaces the errors from each alternative type with one that lists the types', () => {
    expect(errorsFor({ showComment: 5 })).toEqual(['.showComment must be boolean or string']);
  });

  it('lists the types of alternatives that come from a $ref', () => {
    expect(errorsFor({ encounter: 5 })).toEqual(['.encounter must be string or object']);
    expect(errorsFor({ location: 5 })).toEqual(['.location must be object or string']);
  });

  it('separates three or more types with commas', () => {
    expect(errorsFor({ required: 5 })).toEqual(['.required must be boolean, string or object']);
  });

  it('keeps the errors of the alternative that accepts the type', () => {
    expect(errorsFor({ required: { type: 5 } })).toEqual([
      ".required must have required property 'referenceQuestionId'",
      '.required.type must be string',
    ]);
    expect(errorsFor({ encounter: { uuid: 5 } })).toEqual(['.encounter.uuid must be string']);
  });

  it('combines alternatives nested inside other alternatives', () => {
    expect(errorsFor({ weeksList: [true] })).toEqual(['.weeksList[0] must be string or number']);
  });

  it('leaves errors from other properties alone', () => {
    expect(errorsFor({ name: 5, showComment: 5, encounter: 5 })).toEqual([
      '.showComment must be boolean or string',
      '.encounter must be string or object',
      '.name must be string',
    ]);
  });
});
