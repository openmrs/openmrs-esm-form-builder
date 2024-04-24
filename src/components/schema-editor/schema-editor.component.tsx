import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import Ajv from 'ajv';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/ext-language_tools';

interface AjvError {
  keyword: string;
  schemaPath: string;
  instancePath: string;
  message: string;
  params: { key: string; value: string };
}
interface SchemaEditorProps {
  isLoading: boolean;
  setSchemaValidationErrors: (errors: Array<{ err: string; msg: string }>) => void;
  onSchemaChange: (stringifiedSchema: string) => void;
  stringifiedSchema: string;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({
  onSchemaChange,
  stringifiedSchema,
  setSchemaValidationErrors,
}) => {
  const [ajv, setAjv] = useState({ validate: null });

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await fetch('https://json.openmrs.org/form.schema.json');
        const schema = await response.json();

        // Compile the JSON schema using Ajv
        const validator = new Ajv({ allErrors: true });
        const validate = validator.compile(schema);
        setAjv({ validate });
      } catch (error) {
        console.error('Error fetching JSON schema:', error);
      }
    };

    void fetchSchema();
  }, []);

  const handleSchemaChange = (newSchema: string) => {
    if (ajv.validate) {
      try {
        const newSchemaJson = JSON.parse(newSchema);
        const isValid = ajv.validate(newSchemaJson);
        if (!isValid) {
          const errorMessages: Array<{ err: string; msg: string }> = ajv.validate.errors.map((error: AjvError) => {
            if (error.keyword === 'type') {
              return { err: 'Invalid Type', msg: `${error.instancePath.substring(1)} ${error.message}` };
            }
            const paramsKey = Object.keys(error.params)[0];
            const message = error.message.charAt(0).toUpperCase() + error.message.slice(1);
            return { err: paramsKey, msg: message };
          });
          setSchemaValidationErrors(errorMessages);
        } else {
          setSchemaValidationErrors([]);
        }
      } catch (error) {
        setSchemaValidationErrors([{ err: 'Invalid JSON', msg: 'Parse error, invalid JSON format' }]);
      }
    }
    onSchemaChange(newSchema);
  };

  return (
    <AceEditor
      style={{ height: '100vh', width: '100%' }}
      mode="json"
      theme="textmate"
      name="schemaEditor"
      onChange={handleSchemaChange}
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
    />
  );
};

export default SchemaEditor;
