import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  ComposedModal,
  Form,
  FormGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from "@carbon/react";
import { showToast, showNotification } from "@openmrs/esm-framework";
import { Schema } from "../../types";

type PageModalProps = {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  showModal: boolean;
  onModalChange: (showModal: boolean) => void;
};

const PageModal: React.FC<PageModalProps> = ({
  schema,
  onSchemaChange,
  showModal,
  onModalChange,
}) => {
  const { t } = useTranslation();
  const [pageTitle, setPageTitle] = useState("");

  const handleUpdatePageTitle = () => {
    updatePages();
    onModalChange(false);
  };

  const updatePages = () => {
    try {
      if (pageTitle) {
        schema.pages.push({
          label: pageTitle,
          sections: [],
        });

        onSchemaChange({ ...schema });
        setPageTitle("");
      }
      showToast({
        title: t("success", "Success!"),
        kind: "success",
        critical: true,
        description: t("pageCreated", "New page created"),
      });
    } catch (error) {
      showNotification({
        title: t("errorCreatingPage", "Error creating page"),
        kind: "error",
        critical: true,
        description: error?.message,
      });
    }
  };

  return (
    <ComposedModal
      open={showModal}
      onClose={() => onModalChange(false)}
      preventCloseOnClickOutside
    >
      <ModalHeader title={t("createNewPage", "Create a new page")} />
      <Form onSubmit={(event) => event.preventDefault()}>
        <ModalBody>
          <FormGroup legendText={""}>
            <TextInput
              id="pageTitle"
              labelText={t("enterPageTitle", "Enter a title for your new page")}
              value={pageTitle}
              onChange={(event) => setPageTitle(event.target.value)}
            />
          </FormGroup>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button onClick={() => onModalChange(false)} kind="secondary">
          {t("cancel", "Cancel")}
        </Button>
        <Button disabled={!pageTitle} onClick={handleUpdatePageTitle}>
          <span>{t("save", "Save")}</span>
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default PageModal;
