import React, { useEffect, useState } from "react";
import { Accordion, Button, TextInput } from "@carbon/react";
import { Schema } from "../../types";
import styles from "./element-editor.scss";
import { Checkmark } from "@carbon/react/icons";
import CreatePage from "../modals/new-page.component";
import PageElement from "./page.component";
import { useTranslation } from "react-i18next";

type ElementEditorProps = {
  schema: Schema;
  onSchemaUpdate: (schema: Schema) => void;
};

const ElementEditor: React.FC<ElementEditorProps> = ({
  schema,
  onSchemaUpdate,
}) => {
  const { t } = useTranslation();
  const [formSchema, setFormSchema] = useState<Schema>();
  const [schemaName, setSchemaName] = useState("");

  const { name, pages } = schema ?? {};

  useEffect(() => {
    setFormSchema(schema);
    setSchemaName(name);
  }, [name, schema]);

  const deletePage = (index) => {
    pages.splice(index, 1);
    onSchemaUpdate({ ...schema });
  };

  const updateSchemaName = () => {
    onSchemaUpdate({ ...schema, name: schemaName });
  };

  return (
    <div className={styles.tabContentWrap}>
      <div className={styles.formNameContainer}>
        <div className={styles.textInput}>
          <TextInput
            id="schema-name"
            type="text"
            labelText="Form Name"
            value={schemaName || ""}
            onChange={(event) => {
              setSchemaName(event.target.value);
            }}
          />
        </div>
        <Button
          className={styles.setSchemaNameButton}
          renderIcon={Checkmark}
          iconDescription="Save Name"
          size="md"
          hasIconOnly
          kind="tertiary"
          onClick={() => {
            updateSchemaName();
          }}
        />
      </div>
      <h5>{t("pages", "Pages")}</h5>
      <CreatePage
        pages={pages}
        schema={schema}
        onSchemaUpdate={onSchemaUpdate}
      />
      <Accordion>
        {pages
          ? pages.map((page, key) => (
              <PageElement
                key={key}
                page={page}
                index={key}
                deletePage={deletePage}
                onSchemaUpdate={onSchemaUpdate}
                schema={schema}
              />
            ))
          : null}
      </Accordion>
    </div>
  );
};
export default ElementEditor;
