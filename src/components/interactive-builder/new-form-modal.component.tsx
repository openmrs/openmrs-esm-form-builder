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

type NewFormModalProps = {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  showModal: boolean;
  onModalChange: (showModal: boolean) => void;
};

const NewFormModal: React.FC<NewFormModalProps> = ({
  schema,
  onSchemaChange,
  showModal,
  onModalChange,
}) => {
  const { t } = useTranslation();
  const [formName, setFormName] = useState("");

  const updateFormName = () => {
    try {
      schema.name = formName;
      onSchemaChange({ ...schema });

      showToast({
        title: t("success", "Success!"),
        kind: "success",
        critical: true,
        description: t("formCreated", "New form created"),
      });
    } catch (error) {
      showNotification({
        title: t("errorCreatingForm", "Error creating form"),
        kind: "error",
        critical: true,
        description: error?.message,
      });
    }
  };

  return (
    <ComposedModal open={showModal} onClose={() => onModalChange(false)}>
      <ModalHeader title={t("createNewForm", "Create a new form")} />
      <Form onSubmit={(event) => event.preventDefault()}>
        <ModalBody>
          <FormGroup legendText={""}>
            <TextInput
              id="formName"
              labelText={t("formName", "Form name")}
              value={formName}
              onChange={(event) => setFormName(event.target.value)}
            />
          </FormGroup>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button kind="secondary" onClick={() => onModalChange(false)}>
          {t("cancel", "Cancel")}
        </Button>
        <Button
          disabled={!formName}
          onClick={() => {
            updateFormName();
            onModalChange(false);
          }}
        >
          <span>{t("createForm", "Create Form")}</span>
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default NewFormModal;
