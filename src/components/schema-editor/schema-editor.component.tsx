import React, { useState, useEffect, useCallback } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/ext-language_tools';
import type { IMarker } from 'react-ace';
import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools';
import { useTranslation } from 'react-i18next';
import { useStandardFormSchema } from '../../hooks/useStandardFormSchema';
import Ajv from 'ajv';
import debounce from 'lodash-es/debounce';
import { ActionableNotification, Link } from '@carbon/react';
import { ChevronRight, ChevronLeft } from '@carbon/react/icons';

import styles from './schema-editor.scss';
import { useConfig } from '@openmrs/esm-framework';

interface MarkerProps extends IMarker {
  text: string;
}

interface SchemaEditorProps {
  isLoading: boolean;
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
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<
    Array<{ name: string; type: string; path: string }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const { blockRenderingWithErrors } = useConfig();

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
            error.keyword === 'type'
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

  const ErrorMessages = () =>
    errors.length > 0 &&
    blockRenderingWithErrors && (
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
      {errors.length || validationOn ? <ErrorMessages /> : null}
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
        }}
        markers={errors}
      />
    </div>
  );
};

export default SchemaEditor;
