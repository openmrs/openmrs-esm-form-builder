import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/webpack-resolver';
import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools';
import type { IMarker } from 'react-ace';
import { useTranslation } from 'react-i18next';
import { ActionableNotification, Link } from '@carbon/react';
import { useStandardFormSchema } from '@hooks/useStandardFormSchema';
import Ajv from 'ajv';
import debounce from 'lodash-es/debounce';
import { ChevronRight, ChevronLeft } from '@carbon/react/icons';
import styles from './schema-editor.scss';
import { useSelection } from '../../context/selection-context';

interface MarkerProps extends IMarker {
  text: string;
}

interface SchemaEditorProps {
  isLoading?: boolean;
  validationOn: boolean;
  onSchemaChange: (stringifiedSchema: string) => void;
  stringifiedSchema: string;
  errors: Array<MarkerProps>;
  setErrors: (errors: Array<MarkerProps>) => void;
  setValidationOn: (validationStatus: boolean) => void;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({
  onSchemaChange,
  stringifiedSchema,
  setErrors,
  errors,
  validationOn,
  setValidationOn,
}) => {
  const { schema, schemaProperties } = useStandardFormSchema();
  const { t } = useTranslation();
  const { setSelection } = useSelection();
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<
    Array<{ name: string; type: string; path: string }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // Ref to the underlying Ace editor instance so we can read the cursor position
  const aceRef = useRef<any | null>(null);

  // Enable autocompletion in the schema
  const generateAutocompleteSuggestions = useCallback(() => {
    const suggestions: Array<{ name: string; type: string; path: string }> = [];

    const traverseSchema = (schemaProps: unknown, path: string) => {
      if (schemaProps) {
        if (schemaProps && typeof schemaProps === 'object') {
          Object.entries(schemaProps).forEach(([propertyName, property]) => {
            if (propertyName === '$schema') {
              return;
            }

            const currentPath = path ? `${path}.${propertyName}` : propertyName;
            const typedProperty = property as {
              type?: string;
              properties?: Array<{ type: string }>;
              items?: { type?: string; properties?: Array<{ type: string }> };
              oneOf?: Array<{ type: string }>;
            };

            if (typeof property === 'object') {
              if (typedProperty.type === 'array' && typedProperty.items && typedProperty.items.properties) {
                traverseSchema(typedProperty.items.properties, currentPath);
              } else if (typedProperty.properties) {
                traverseSchema(typedProperty.properties, currentPath);
              } else if (typedProperty.oneOf) {
                const types = typedProperty?.oneOf?.map((item: { type: string }) => item.type).join(' | ');
                suggestions.push({ name: propertyName, type: types || 'any', path: currentPath });
              }
            }

            suggestions.push({ name: propertyName, type: typedProperty.type || 'any', path: currentPath });
          });
        }
      }
    };
    traverseSchema(schemaProperties, '');
    return suggestions;
  }, [schemaProperties]);

  useEffect(() => {
    // Generate autocomplete suggestions when schema changes
    const suggestions = generateAutocompleteSuggestions();
    setAutocompleteSuggestions(suggestions.flat());
  }, [schemaProperties, generateAutocompleteSuggestions]);

  useEffect(() => {
    addCompleter({
      getCompletions: function (editor, session, pos, prefix, callback) {
        callback(
          null,
          autocompleteSuggestions.map(function (word) {
            return {
              caption: word.name,
              value: word.name,
              meta: word.type,
              docText: `Path: ${word.path}`,
            };
          }),
        );
      },
    });
  }, [autocompleteSuggestions]);

  // Validate JSON schema
  const validateSchema = (content: string, schema) => {
    try {
      const trimmedContent = content.replace(/\s/g, '');
      // Check if the content is an empty object
      if (trimmedContent.trim() === '{}') {
        // Reset errors since the JSON is considered valid
        setErrors([]);
        return;
      }

      const ajv = new Ajv({ allErrors: true, jsPropertySyntax: true, strict: false });
      const validate = ajv.compile(schema);
      const parsedContent = JSON.parse(content);
      const isValid = validate(parsedContent);
      const jsonLines = content.split('\n');

      const traverse = (schemaPath) => {
        const pathSegments = schemaPath.split('/').filter((segment) => segment !== '' || segment !== 'type');
        let lineNumber = -1;

        for (const segment of pathSegments) {
          if (segment === 'properties' || segment === 'items') continue; // Skip 'properties' and 'items'
          const match = segment.match(/^([^[\]]+)/); // Extract property key
          if (match) {
            const propertyName: string = pathSegments[pathSegments.length - 2]; // Get property key
            lineNumber = jsonLines.findIndex((line) => line.includes(propertyName));
          }
          if (lineNumber !== -1) break;
        }

        return lineNumber;
      };

      if (!isValid) {
        const errorMarkers = validate.errors.map((error) => {
          const schemaPath = error.schemaPath.replace(/^#\//, ''); // Remove leading '#/'
          const lineNumber = traverse(schemaPath);
          const pathSegments = error.instancePath.split('.'); // Split the path into segments
          const errorPropertyName = pathSegments[pathSegments.length - 1];
          const message =
            error.keyword === 'type' || error.keyword === 'enum'
              ? `${errorPropertyName.charAt(0).toUpperCase() + errorPropertyName.slice(1)} ${error.message}`
              : `${error.message.charAt(0).toUpperCase() + error.message.slice(1)}`;

          return {
            startRow: lineNumber,
            startCol: 0,
            endRow: lineNumber,
            endCol: 1,
            className: 'error',
            text: message,
            type: 'text' as const,
          };
        });

        setErrors(errorMarkers);
      } else {
        setErrors([]);
      }
    } catch (error) {
      console.error('Error parsing or validating JSON:', error);
    }
  };

  const debouncedValidateSchema = debounce(validateSchema, 300);

  const handleChange = (newValue: string) => {
    setValidationOn(false);
    setCurrentIndex(0);
    onSchemaChange(newValue);
    debouncedValidateSchema(newValue, schema);
  };

  /**
   * Called once when the Ace editor is created.
   *
   * Here we:
   * - Store the editor instance in a ref.
   * - Attach a low‑level DOM 'click' listener on the editor container.
   *
   * Why a DOM listener instead of React's onClick?
   * - react-ace wraps Ace and doesn't directly give us a React click
   *   with the Ace editor reference.
   * - Using the Ace editor's `container` gives us reliable access to
   *   the real editor and its `selection`.
   */
  const handleEditorLoad = useCallback(
    (editor) => {
      // Keep the editor instance so we can use it later if needed.
      aceRef.current = editor;

      editor.container.addEventListener('click', () => {
        try {
          // 1. Get the current cursor position (row/column in Ace coordinates).
          const cursor = editor.selection.getCursor();

          // 2. Ask our helper to infer which page/section/question
          //    the cursor is currently inside, based purely on the text.
          const info = getSchemaCursorInfo(editor.getValue(), cursor.row, cursor.column);

          if (!info) {
            // If we couldn't map the cursor to a page/section/question,
            // just log that fact (useful while iterating on the algorithm).
            // eslint-disable-next-line no-console
            console.log('Cursor not inside page/section/question', cursor);
            return;
          }

          const { kind, pageIndex, sectionIndex, questionIndex } = info;
          setSelection(pageIndex, sectionIndex, questionIndex);
        } catch (e) {
          // If anything goes wrong (malformed JSON, unexpected structure),
          // we log it instead of blowing up the editor.
          // eslint-disable-next-line no-console
          console.error('Error computing schema cursor info', e);
        }
      });
    },
    [setSelection],
  );

  // Schema Validation Errors
  const ErrorNotification = ({ text, line }) => (
    <ActionableNotification
      subtitle={text}
      inline
      title={t('errorOnLine', 'Error on line') + ` ${line + 1}: `}
      kind="error"
      lowContrast
      actionButtonLabel={
        <Link target="_blank" rel="noopener noreferrer" href="https://json.openmrs.org/form.schema.json">
          {t('referenceSchema', 'Reference schema')}
        </Link>
      }
    />
  );

  const onPreviousErrorClick = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const onNextErrorClick = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, errors.length - 1));
  };

  const ErrorMessages = () => (
    <div className={styles.validationErrorsContainer}>
      <ErrorNotification text={errors[currentIndex]?.text} line={errors[currentIndex]?.startRow} />
      <div className={styles.pagination}>
        <ChevronLeft
          disabled={currentIndex === 0}
          onClick={onPreviousErrorClick}
          className={currentIndex === 0 ? styles.disabledIcon : styles.paginationIcon}
        />
        <div>
          {currentIndex + 1}/{errors.length}
        </div>
        <ChevronRight
          disabled={currentIndex === errors.length - 1}
          onClick={onNextErrorClick}
          className={currentIndex === errors.length - 1 ? styles.disabledIcon : styles.paginationIcon}
        />
      </div>
    </div>
  );

  return (
    <div>
      {errors.length && validationOn ? <ErrorMessages /> : null}
      <AceEditor
        onLoad={handleEditorLoad}
        style={{ height: '100vh', width: '100%', border: errors.length ? '3px solid #DA1E28' : 'none' }}
        mode="json"
        theme="textmate"
        name="schemaEditor"
        onChange={handleChange}
        fontSize={15}
        showPrintMargin={false}
        showGutter={true}
        highlightActiveLine={true}
        value={stringifiedSchema}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          displayIndentGuides: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
        }}
        markers={errors}
      />
    </div>
  );
};

export default SchemaEditor;

type Frame = {
  type: 'object' | 'array';
  key: string | null;
  index: number | null;
};

type CursorKind = 'page' | 'section' | 'question';

interface SchemaCursorInfo {
  kind: CursorKind;
  pageIndex: number | null;
  sectionIndex: number | null;
  questionIndex: number | null;
}

/**
 * Given the full JSON text and a cursor position (row, column),
 * walk the JSON structure and infer the nearest enclosing page/section/question indices.
 *
 * This works on the textual JSON (using braces/arrays and property keys),
 * assuming it follows the OpenMRS form schema structure: pages -> sections -> questions.
 */
function getSchemaCursorInfo(text: string, row: number, column: number): SchemaCursorInfo | null {
  if (!text) {
    return null;
  }

  // Split into lines so we can convert (row, column) into a single
  // character offset into the string.
  const lines = text.split('\n');
  if (row < 0 || row >= lines.length) {
    return null;
  }

  // Clamp the column so we don't go past the end of the line.
  const safeColumn = Math.min(column, lines[row].length);

  // Compute the absolute offset by summing all previous line lengths
  // (plus one per newline), then adding the column on the current line.
  let offset = 0;
  for (let r = 0; r < row; r++) {
    // +1 for the newline character
    offset += lines[r].length + 1;
  }
  offset += safeColumn;

  // This stack tracks the current nesting as we scan through the JSON:
  // - Each '{' pushes an "object" frame.
  // - Each '[' pushes an "array" frame, with its associated key (e.g. "pages").
  // - Each ',' inside an array increments that array's `index` (which element).
  const stack: Frame[] = [];
  let inString = false;
  let escape = false;
  let currentKey: string | null = null;

  // Push a new object frame, remembering which key it belongs to (if any).
  const pushObject = () => {
    stack.push({ type: 'object', key: currentKey, index: null });
    currentKey = null;
  };

  // Push a new array frame; `key` is the property name this array belongs to
  // (e.g. "pages", "sections", or "questions").
  const pushArray = (key: string | null) => {
    stack.push({ type: 'array', key, index: 0 });
    currentKey = null;
  };

  // Scan character by character up to the cursor offset, updating the stack
  // as we encounter strings, objects, arrays, and commas.
  for (let i = 0; i <= offset && i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (inString) {
      if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      // We hit the start of a JSON string. We now parse the full string
      // so we can tell if it's a *property key* (i.e. followed by a colon).
      inString = true;
      let j = i + 1;
      let str = '';
      let localEscape = false;
      for (; j < text.length; j++) {
        const c2 = text[j];
        if (localEscape) {
          str += c2;
          localEscape = false;
          continue;
        }
        if (c2 === '\\') {
          localEscape = true;
          continue;
        }
        if (c2 === '"') {
          break;
        }
        str += c2;
      }
      inString = false;

      // Look ahead to see if this string is followed by a colon -> it's a key.
      let k = j + 1;
      while (k < text.length && /\s/.test(text[k])) {
        k++;
      }
      if (text[k] === ':') {
        currentKey = str;
      }
      i = j;
      continue;
    }

    if (ch === '{') {
      pushObject();
    } else if (ch === '}') {
      // Pop until we remove the last object.
      while (stack.length && stack[stack.length - 1].type !== 'object') {
        stack.pop();
      }
      if (stack.length) {
        stack.pop();
      }
      currentKey = null;
    } else if (ch === '[') {
      pushArray(currentKey);
    } else if (ch === ']') {
      // Pop until we remove the last array.
      while (stack.length && stack[stack.length - 1].type !== 'array') {
        stack.pop();
      }
      if (stack.length) {
        stack.pop();
      }
      currentKey = null;
    } else if (ch === ',') {
      // Between elements: if we're inside an array, advance its index
      // so that the next element has index+1.
      const top = stack[stack.length - 1];
      if (top && top.type === 'array' && top.index !== null) {
        top.index += 1;
      }
      currentKey = null;
    } else if (!/\s/.test(ch) && ch !== ':') {
      // Other structural characters/values we don't care about for structure.
      continue;
    }
  }

  // From the stack, extract the "current" indices for pages/sections/questions.
  let pageIndex: number | null = null;
  let sectionIndex: number | null = null;
  let questionIndex: number | null = null;

  stack.forEach((frame) => {
    if (frame.type === 'array' && frame.index !== null) {
      if (frame.key === 'pages') {
        pageIndex = frame.index;
      } else if (frame.key === 'sections') {
        sectionIndex = frame.index;
      } else if (frame.key === 'questions') {
        questionIndex = frame.index;
      }
    }
  });

  /**
   * Helper: walk the stack from the innermost frame outward and find
   * the nearest object whose *parent* array has the given key.
   *
   * Example:
   *   pages[1].sections[2].questions[3]
   * If the cursor is in that question object, scanning backwards we will
   * find an object frame whose parent array frame has key === 'questions',
   * and we return that parent array's `index` (here, 3).
   */
  const findNearestByArrayKey = (arrayKey: 'questions' | 'sections' | 'pages') => {
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].type !== 'object') {
        continue;
      }
      for (let j = i - 1; j >= 0; j--) {
        const parent = stack[j];
        if (parent.type === 'array' && parent.key === arrayKey && parent.index !== null) {
          return parent.index;
        }
      }
    }
    return null;
  };

  // Prefer nearest question, then section, then page.
  // This matches your requirement: first try to identify a question,
  // if not found then a section, and finally a page.
  const qIdx = findNearestByArrayKey('questions');
  if (qIdx !== null) {
    return {
      kind: 'question',
      pageIndex,
      sectionIndex,
      questionIndex: qIdx,
    };
  }

  const sIdx = findNearestByArrayKey('sections');
  if (sIdx !== null) {
    return {
      kind: 'section',
      pageIndex,
      sectionIndex: sIdx,
      questionIndex,
    };
  }

  const pIdx = findNearestByArrayKey('pages');
  if (pIdx !== null) {
    return {
      kind: 'page',
      pageIndex: pIdx,
      sectionIndex,
      questionIndex,
    };
  }

  return null;
}
