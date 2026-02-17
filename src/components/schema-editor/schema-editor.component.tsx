import React, { useState, useEffect, useCallback } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-textmate';
import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools';
import type { IMarker } from 'react-ace';
import { useTranslation } from 'react-i18next';
import { ActionableNotification } from '@carbon/react';
import { useStandardFormSchema } from '@hooks/useStandardFormSchema';
import Ajv from 'ajv';
import debounce from 'lodash-es/debounce';
import { ChevronRight, ChevronLeft } from '@carbon/react/icons';
import styles from './schema-editor.scss';

interface MarkerProps extends IMarker {
  text: string;
}

interface SchemaEditorProps {
  validationOn: boolean;
  onSchemaChange: (stringifiedSchema: string) => void;
  stringifiedSchema: string;
  errors: Array<MarkerProps>;
  setErrors: (errors: Array<MarkerProps>) => void;
  setValidationOn: (validationStatus: boolean) => void;
}

type SchemaProperty = {
  type?: string;
  properties?: Record<string, SchemaProperty>;
  items?: { type?: string; properties?: Record<string, SchemaProperty> };
  oneOf?: Array<{ type: string }>;
};

const traverseSchema = (
  schemaProps: unknown,
  path: string,
  suggestions: Array<{ name: string; type: string; path: string }>,
) => {
  if (schemaProps && typeof schemaProps === 'object') {
    Object.entries(schemaProps).forEach(([propertyName, property]) => {
      if (propertyName === '$schema') return;

      const currentPath = path ? `${path}.${propertyName}` : propertyName;
      const typedProperty = property as SchemaProperty;

      if (typeof property === 'object') {
        if (typedProperty.type === 'array' && typedProperty.items?.properties) {
          traverseSchema(typedProperty.items.properties, currentPath, suggestions);
        } else if (typedProperty.properties) {
          traverseSchema(typedProperty.properties, currentPath, suggestions);
        } else if (typedProperty.oneOf) {
          const types = typedProperty.oneOf.map((item) => item.type).join(' | ');
          suggestions.push({ name: propertyName, type: types || 'any', path: currentPath });
        }
      }

      suggestions.push({ name: propertyName, type: typedProperty.type || 'any', path: currentPath });
    });
  }
};

const ErrorNotification = ({ text, line }: { text: string; line: number }) => {
  const { t } = useTranslation();
  return (
    <ActionableNotification
      subtitle={text}
      inline
      title={t('errorOnLine', 'Error on line {{line}}:', { line: line + 1 })}
      kind="error"
      lowContrast
      actionButtonLabel={
        <Link target="_blank" rel="noopener noreferrer" href="https://json.openmrs.org/form.schema.json">
          {t('referenceSchema', 'Reference schema')}
        </Link>
      }
    />
  );
};

interface ErrorMessagesProps {
  errors: Array<MarkerProps>;
  currentIndex: number;
  onPreviousErrorClick: () => void;
  onNextErrorClick: () => void;
}

const ErrorMessages = ({ errors, currentIndex, onPreviousErrorClick, onNextErrorClick }: ErrorMessagesProps) => (
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

const SchemaEditor: React.FC<SchemaEditorProps> = ({
  onSchemaChange,
  stringifiedSchema,
  setErrors,
  errors,
  validationOn,
  setValidationOn,
}) => {
  const { schema, schemaProperties } = useStandardFormSchema();
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<
    Array<{ name: string; type: string; path: string }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const generateAutocompleteSuggestions = useCallback(() => {
    const suggestions: Array<{ name: string; type: string; path: string }> = [];
    traverseSchema(schemaProperties, '', suggestions);
    return suggestions;
  }, [schemaProperties]);

  useEffect(() => {
    const suggestions = generateAutocompleteSuggestions();
    setAutocompleteSuggestions(suggestions.flat());
  }, [schemaProperties, generateAutocompleteSuggestions]);

  useEffect(() => {
    addCompleter({
      getCompletions: function (
        _editor: unknown,
        _session: unknown,
        _pos: unknown,
        _prefix: unknown,
        callback: (err: null, completions: object[]) => void,
      ) {
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
      const trimmedContent = content.split(/\s/).join('');
      if (trimmedContent === '{}') {
        setErrors([]);
        return;
      }

      const ajv = new Ajv({ allErrors: true, jsPropertySyntax: true, strict: false });
      const validate = ajv.compile(schema);
      const parsedContent = JSON.parse(content);
      const isValid = validate(parsedContent);
      const jsonLines = content.split('\n');

      const traverse = (schemaPath: string) => {
        const pathSegments = schemaPath.split('/').filter((segment) => segment !== '' && segment !== 'type');
        let lineNumber = -1;

        for (const segment of pathSegments) {
          if (segment === 'properties' || segment === 'items') continue;
          const match = /^([^[\]]+)/.exec(segment);
          if (match) {
            const propertyName = pathSegments.at(-2) ?? '';
            lineNumber = jsonLines.findIndex((line) => line.includes(propertyName));
          }
          if (lineNumber !== -1) break;
        }

        return lineNumber;
      };

      if (isValid) {
        setErrors([]);
      } else {
        const errorMarkers = validate.errors.map((error) => {
          const schemaPath = error.schemaPath.replace(/^#\//, '');
          const lineNumber = traverse(schemaPath);
          const pathSegments = error.instancePath.split('.');
          const errorPropertyName = pathSegments.at(-1) ?? '';
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
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        const posMatch = /position (\d+)/i.exec(error.message);
        let lineNumber = 0;
        if (posMatch) {
          const pos = Number.parseInt(posMatch[1]);
          lineNumber = content.substring(0, pos).split('\n').length - 1;
        }
        setErrors([
          {
            startRow: lineNumber,
            startCol: 0,
            endRow: lineNumber,
            endCol: 100,
            className: 'error',
            text: error.message,
            type: 'text' as const,
          },
        ]);
      } else {
        console.error('Error validating JSON schema:', error);
      }
    }
  };

  const debouncedValidateSchema = debounce(validateSchema, 300);

  const handleChange = (newValue: string) => {
    setValidationOn(false);
    setCurrentIndex(0);
    onSchemaChange(newValue);
    debouncedValidateSchema(newValue, schema);
  };

  const onPreviousErrorClick = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const onNextErrorClick = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, errors.length - 1));
  };

  return (
    <div>
      {errors.length && validationOn ? (
        <ErrorMessages
          errors={errors}
          currentIndex={currentIndex}
          onPreviousErrorClick={onPreviousErrorClick}
          onNextErrorClick={onNextErrorClick}
        />
      ) : null}
      <AceEditor
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
          useWorker: false,
        }}
        markers={errors}
        annotations={errors.map((e) => ({
          row: e.startRow,
          column: 0,
          type: 'error' as const,
          text: e.text,
        }))}
      />
    </div>
  );
};

export default SchemaEditor;
