import React, { useState, useEffect, useCallback } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/ext-language_tools';
import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools';
import { useTranslation } from 'react-i18next';
import { useStandardFormSchema } from '../../hooks/useStandardSchema';
import styles from './schema-editor.scss';

interface SchemaEditorProps {
  isLoading: boolean;
  invalidJsonErrorMessage: string;
  onSchemaChange: (stringifiedSchema: string) => void;
  stringifiedSchema: string;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({ invalidJsonErrorMessage, onSchemaChange, stringifiedSchema }) => {
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

  return (
    <>
      {invalidJsonErrorMessage ? (
        <div className={styles.errorContainer}>
          <p className={styles.heading}>{t('schemaError', "There's an error in your schema.")}</p>
          <p>{invalidJsonErrorMessage}</p>
        </div>
      ) : null}

      <AceEditor
        style={{ height: '100vh', width: '100%' }}
        mode="json"
        theme="textmate"
        name="schemaEditor"
        onChange={onSchemaChange}
        fontSize={15}
        showPrintMargin={false}
        showGutter={true}
        highlightActiveLine={true}
        value={stringifiedSchema}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          displayIndentGuides: true,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
    </>
  );
};

export default SchemaEditor;
