import type { ErrorObject } from 'ajv';

function isAtOrUnder(instancePath: string, path: string) {
  return instancePath === path || instancePath.startsWith(`${path}.`) || instancePath.startsWith(`${path}[`);
}

function joinWithOr(words: Array<string>) {
  return words.length > 1 ? `${words.slice(0, -1).join(', ')} or ${words[words.length - 1]}` : words.join('');
}

/**
 * Ajv reports a value that none of a oneOf's or anyOf's schemas accept as one error from each schema, followed by an
 * error for the oneOf or anyOf itself. When none of the schemas accepts the value's type, this replaces them with one
 * error that lists the types, such as "must be boolean or string". When a schema accepts the type but fails on
 * something inside it, this keeps that schema's errors and drops the ones that only say the value has another type.
 */
export function combineAlternativeErrors(errors: Array<ErrorObject>): Array<ErrorObject> {
  const combined: Array<ErrorObject> = [];

  for (const error of errors) {
    const isUnmatchedAlternative =
      (error.keyword === 'oneOf' && error.params.passingSchemas == null) || error.keyword === 'anyOf';
    if (!isUnmatchedAlternative) {
      combined.push(error);
      continue;
    }

    // Ajv adds the errors from each alternative just before the oneOf or anyOf error
    let start = combined.length;
    while (start > 0 && isAtOrUnder(combined[start - 1].instancePath, error.instancePath)) {
      start--;
    }
    const alternativeErrors = combined.splice(start);
    const isTypeMismatch = (alternativeError: ErrorObject) =>
      alternativeError.keyword === 'type' && alternativeError.instancePath === error.instancePath;
    const otherErrors = alternativeErrors.filter((alternativeError) => !isTypeMismatch(alternativeError));

    if (otherErrors.length) {
      combined.push(...otherErrors);
    } else if (alternativeErrors.length) {
      const types = [
        ...new Set(alternativeErrors.flatMap((alternativeError) => String(alternativeError.params.type).split(','))),
      ];
      combined.push({
        ...error,
        keyword: 'type',
        params: { type: types.join(',') },
        message: `must be ${joinWithOr(types)}`,
      });
    } else {
      combined.push(error);
    }
  }

  return combined;
}
