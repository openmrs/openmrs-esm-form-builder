import type { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import type { EditorState } from '@codemirror/state';

type SyntaxNode = ReturnType<ReturnType<typeof syntaxTree>['resolveInner']>;

/** The parts of a JSON Schema that completion reads. */
interface JsonSchema {
  $ref?: string;
  type?: string | Array<string>;
  description?: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema | Array<JsonSchema>;
  enum?: Array<unknown>;
  oneOf?: Array<JsonSchema>;
  anyOf?: Array<JsonSchema>;
  allOf?: Array<JsonSchema>;
}

/** An object key, or an array element of any index. */
type PathSegment = string | typeof arrayElement;

const arrayElement = Symbol('array element');

function isSchema(value: unknown): value is JsonSchema {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Resolves a reference within the schema, such as `#/definitions/formField`. */
function resolveRef(root: JsonSchema, ref: string): JsonSchema | undefined {
  if (!ref.startsWith('#/')) {
    return undefined;
  }
  const target = ref
    .slice(2)
    .split('/')
    .reduce<unknown>(
      (node, key) => (isSchema(node) ? node[key.replace(/~1/g, '/').replace(/~0/g, '~')] : undefined),
      root,
    );
  return isSchema(target) ? target : undefined;
}

/**
 * Lists the schemas a value may have to match: the schema itself, the target of its `$ref`, and each `oneOf`, `anyOf`
 * and `allOf` branch, followed recursively.
 */
function alternatives(root: JsonSchema, schema: unknown, seenRefs: Set<string> = new Set()): Array<JsonSchema> {
  if (!isSchema(schema)) {
    return [];
  }

  const result = [schema];
  if (schema.$ref && !seenRefs.has(schema.$ref)) {
    result.push(...alternatives(root, resolveRef(root, schema.$ref), new Set(seenRefs).add(schema.$ref)));
  }
  for (const branches of [schema.oneOf, schema.anyOf, schema.allOf]) {
    branches?.forEach((branch) => result.push(...alternatives(root, branch, seenRefs)));
  }
  return result;
}

function childSchema(schema: JsonSchema, segment: PathSegment): JsonSchema | undefined {
  if (segment !== arrayElement) {
    return schema.properties?.[segment];
  }
  return Array.isArray(schema.items) ? undefined : schema.items;
}

/** Lists the schemas the value at `path` may have to match. */
function schemasAt(root: JsonSchema, path: Array<PathSegment>): Array<JsonSchema> {
  return path.reduce(
    (schemas, segment) => schemas.flatMap((schema) => alternatives(root, childSchema(schema, segment))),
    alternatives(root, root),
  );
}

function describeType(root: JsonSchema, schema: JsonSchema): string {
  const types = new Set(alternatives(root, schema).flatMap(({ type }) => type ?? []));
  return types.size ? [...types].join(' | ') : 'any';
}

function propertyNameOf(state: EditorState, property: SyntaxNode): string | undefined {
  const name = property.getChild('PropertyName');
  if (!name) {
    return undefined;
  }
  try {
    return JSON.parse(state.sliceDoc(name.from, name.to));
  } catch {
    return undefined;
  }
}

/** Works out the path from the root of the document to `node`, or returns undefined if it can't be followed. */
function pathTo(state: EditorState, node: SyntaxNode): Array<PathSegment> | undefined {
  const path: Array<PathSegment> = [];
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.name === 'Property') {
      const name = propertyNameOf(state, parent);
      if (name === undefined) {
        return undefined;
      }
      path.unshift(name);
    } else if (parent.name === 'Array') {
      path.unshift(arrayElement);
    } else if (parent.name !== 'Object' && parent.name !== 'JsonText') {
      return undefined;
    }
  }
  return path;
}

/** Suggests the keys the reference schema allows in the object around the cursor that it doesn't already have. */
function completeKey(context: CompletionContext, root: JsonSchema, object: SyntaxNode): CompletionResult | null {
  const word = context.matchBefore(/[\w$]*/);
  if (!word || (word.from === word.to && !context.explicit)) {
    return null;
  }
  // A chosen key replaces the whole word, including any of it after the cursor
  const wordEnd = context.pos + /^[\w$]*/.exec(context.state.sliceDoc(context.pos))[0].length;

  const path = pathTo(context.state, object);
  if (!path) {
    return null;
  }

  const existingKeys = new Set(
    object
      .getChildren('Property')
      .filter((property) => property.to < word.from || property.from > wordEnd)
      .map((property) => propertyNameOf(context.state, property)),
  );
  const quoted = context.state.sliceDoc(word.from - 1, word.from) === '"';
  const options = new Map<string, Completion>();

  for (const schema of schemasAt(root, path)) {
    for (const [name, property] of Object.entries(schema.properties ?? {})) {
      if (!options.has(name) && !existingKeys.has(name)) {
        options.set(name, {
          label: name,
          apply: quoted ? name : JSON.stringify(name),
          type: 'property',
          detail: describeType(root, property),
          info:
            property.description ?? alternatives(root, property).find(({ description }) => description)?.description,
        });
      }
    }
  }

  return options.size ? { from: word.from, to: wordEnd, options: [...options.values()], validFor: /^[\w$]*$/ } : null;
}

/** Suggests the values the reference schema lists in an `enum` for the string around the cursor. */
function completeEnumValue(context: CompletionContext, root: JsonSchema, value: SyntaxNode): CompletionResult | null {
  const path = pathTo(context.state, value);
  if (!path) {
    return null;
  }

  const values = new Set(
    schemasAt(root, path).flatMap(
      (schema) => schema.enum?.filter((option): option is string => typeof option === 'string') ?? [],
    ),
  );
  if (!values.size) {
    return null;
  }

  return {
    from: value.from + 1,
    to: value.name === 'String' ? value.to - 1 : context.pos,
    options: [...values].map((option) => ({ label: option, type: 'enum' })),
    validFor: /^[\w-]*$/,
  };
}

/**
 * Completes property names and enum values from the reference form schema, using the JSON syntax tree to find which
 * object or value the cursor is in.
 */
export function completeFromSchema(context: CompletionContext, root: JsonSchema | undefined): CompletionResult | null {
  if (!isSchema(root)) {
    return null;
  }

  const node = syntaxTree(context.state).resolveInner(context.pos, -1);
  const parent = node.parent;
  // Strings that have been closed only complete between their quotes
  const insideQuotes = context.pos > node.from && context.pos < node.to;

  // A string value, or the start of one that hasn't been closed yet
  if (
    ((node.name === 'String' && insideQuotes) ||
      (node.name === '⚠' && context.state.sliceDoc(node.from, node.from + 1) === '"' && context.pos > node.from)) &&
    (parent?.name === 'Property' || parent?.name === 'Array')
  ) {
    return completeEnumValue(context, root, node);
  }

  if (node.name === 'PropertyName' && insideQuotes && parent?.parent?.name === 'Object') {
    return completeKey(context, root, parent.parent);
  }
  if (node.name === '⚠' && parent?.name === 'Object') {
    return completeKey(context, root, parent);
  }
  if (node.name === 'Object') {
    return completeKey(context, root, node);
  }
  return null;
}
