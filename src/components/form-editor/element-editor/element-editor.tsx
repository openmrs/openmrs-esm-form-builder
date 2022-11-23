import React, { useContext, useEffect, useState } from "react";
import { Accordion, Button, Column, Row, TextInput } from "@carbon/react";
import { Schema } from "../../../types";
import { SchemaContext } from "../../../context/context";
import PageElement from "./elements/page";
import styles from "./element-editor.scss";
import { Checkmark } from "@carbon/react/icons";
import CreatePage from "../modals/new-page";
import { useTranslation } from "react-i18next";

const ElementEditor: React.FC = () => {
  const { t } = useTranslation();
  const { schema, setSchema } = useContext(SchemaContext);
  const [formSchema, setFormSchema] = useState<Schema>();
  const [schemaName, setSchemaName] = useState("");

  const { name, pages } = schema ?? {};

  useEffect(() => {
    setFormSchema(schema);
    setSchemaName(name);
  }, [schema]);

  const deletePage = (index) => {
    pages.splice(index, 1);
    setSchema({ ...schema });
  };

  const updateSchemaName = () => {
    setSchema({ ...schema, name: schemaName });
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
      <CreatePage pages={pages} />
      <Accordion>
        {pages
          ? pages.map((page, key) => (
              <PageElement
                page={page}
                index={key}
                deletePage={deletePage}
                key={key}
              />
            ))
          : null}
      </Accordion>
    </div>
  );
};
export default ElementEditor;
