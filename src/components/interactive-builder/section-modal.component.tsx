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
import type { Schema } from "../../types";

type SectionModalProps = {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  resetIndices: () => void;
  showModal: boolean;
  onModalChange: (showModal: boolean) => void;
};

const SectionModal: React.FC<SectionModalProps> = ({
  schema,
  onSchemaChange,
  pageIndex,
  resetIndices,
  showModal,
  onModalChange,
}) => {
  const { t } = useTranslation();
  const [sectionTitle, setSectionTitle] = useState("");

  const handleUpdatePageSections = () => {
    updateSections();
    onModalChange(false);
  };

  const updateSections = () => {
    try {
      schema.pages[pageIndex]?.sections?.push({
        label: sectionTitle,
        isExpanded: "true",
        questions: [],
      });
      onSchemaChange({ ...schema });
      setSectionTitle("");
      resetIndices();

      showToast({
        title: t("success", "Success!"),
        kind: "success",
        critical: true,
        description: t("sectionCreated", "New section created"),
      });
    } catch (error) {
      showNotification({
        title: t("errorCreatingSection", "Error creating section"),
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
      <ModalHeader title={t("createNewSection", "Create a new section")} />
      <Form onSubmit={(event) => event.preventDefault()}>
        <ModalBody>
          <FormGroup legendText={""}>
            <TextInput
              id="sectionTitle"
              labelText={t("enterSectionTitle", "Enter a section title")}
              value={sectionTitle}
              onChange={(event) => setSectionTitle(event.target.value)}
            />
          </FormGroup>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button onClick={() => onModalChange(false)} kind="secondary">
          {t("cancel", "Cancel")}
        </Button>
        <Button disabled={!sectionTitle} onClick={handleUpdatePageSections}>
          <span>{t("save", "Save")}</span>
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};
export default SectionModal;
