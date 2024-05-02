import React, { useState, useEffect, useCallback } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/ext-language_tools';
import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools';
import { useTranslation } from 'react-i18next';
import { useStandardFormSchema } from '../../hooks/useStandardSchema';
import Ajv from 'ajv';
import debounce from 'lodash-es/debounce';
import { useTranslation } from 'react-i18next';
import { Toggletip, ToggletipContent, ToggletipButton, ToggletipActions, Link } from '@carbon/react';
import { WarningAlt } from '@carbon/react/icons';
import styles from './schema-editor.scss';

interface MarkerProps {
  startCol: number;
  startRow: number;
  endCol: number;
  endRow: number;
  className: string;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-explicit-any
  type: string | any;
  text: string;
}
interface SchemaEditorProps {
  isLoading: boolean;
  validation: boolean;
  onSchemaChange: (stringifiedSchema: string) => void;
  stringifiedSchema: string;
  errors: Array<MarkerProps>;
  setErrors: (errors: Array<MarkerProps>) => void;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({ onSchemaChange, stringifiedSchema, setErrors, errors }) => {
  const { schema } = useStandardFormSchema();
  const { t } = useTranslation();
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<
    Array<{ name: string; type: string; path: string }>
  >([]);

  const generateAutocompleteSuggestions = useCallback(() => {
    const suggestions: Array<{ name: string; type: string; path: string }> = [];

    const traverseSchema = (schema: unknown, path: string) => {
      if (schema) {
        if (schema && typeof schema === 'object') {
          Object.entries(schema).forEach(([propertyName, property]) => {
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
    traverseSchema(schema, '');
    return suggestions;
  }, [schema]);

  useEffect(() => {
    // Generate autocomplete suggestions when schema changes
    const suggestions = generateAutocompleteSuggestions();
    setAutocompleteSuggestions(suggestions.flat());
  }, [schema, generateAutocompleteSuggestions]);

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

  const validateJSON = (content: string, schema) => {
    try {
      const ajv = new Ajv({ allErrors: true, jsPropertySyntax: true });
      const validate = ajv.compile(schema);
      const parsedContent = JSON.parse(content);
      const isValid = validate(parsedContent);

      if (!isValid) {
        const jsonLines = content.split('\n');
        const errorMarkers = validate.errors.map((error) => {
          let lineNumber = -1;
          const instancePath = error.instancePath.replace(/^\./, '');
          for (let i = 0; i < jsonLines.length; i++) {
            if (jsonLines[i].includes(instancePath)) {
              lineNumber = i;
              break;
            }
          }
          const message =
            error.keyword === 'type'
              ? `${error.instancePath.substring(1)} ${error.message}`
              : `${error.message.charAt(0).toUpperCase() + error.message.slice(1)}`;

          return {
            startRow: lineNumber,
            startCol: 0,
            endRow: lineNumber,
            endCol: 1,
            className: 'error',
            text: message,
            type: 'error',
          };
        });

        const newErrors = errorMarkers.filter((newError) => !errors.some((error) => error.text === newError.text));
        setErrors([...errors, ...newErrors]);
      } else {
        setErrors([]);
      }
    } catch (error) {
      console.log('Error during JSON parsing or validation:', error); // eslint-disable-line
    }
  };

  const debouncedValidateJSON = debounce(validateJSON, 300);

  const handleChange = (newValue: string) => {
    onSchemaChange(newValue);
    debouncedValidateJSON(newValue, schema);
  };

  const ErrorMessages = () => (
    <Toggletip className={styles.toggletipContainer} align="top-left">
      <ToggletipButton label={t('showInformation', 'Show information')}>
        <WarningFilled />
      </ToggletipButton>
      <ToggletipContent>
        {errors.map((e) => (
          <div>{e.text}</div>
        ))}
        <ToggletipActions>
          <Link href="https://json.openmrs.org/form.schema.json" target="_blank" rel="noopener noreferrer">
            {t('referenceSchema', 'Reference Schema')}
          </Link>
        </ToggletipActions>
      </ToggletipContent>
    </Toggletip>
  );

  return (
    <div>
      {errors.length && validation ? (
        <ErrorMessages />
      ) : validation && errors.length === 0 ? (
        <div className={styles.successIcon}>
          <CheckmarkFilled />
        </div>
      ) : null}
      <AceEditor
        style={{ height: '100vh', width: '100%', border: errors.length ? '1px solid #b91c1c' : 'none' }}
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
        markers={validation ? errors : []}
      />
    </div>
  );
};

export default SchemaEditor;
