import React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  ComposedModal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@carbon/react";
import { showNotification, showToast } from "@openmrs/esm-framework";
import type { Schema } from "../../types";

interface DeletePageModalProps {
  onModalChange: (showModal: boolean) => void;
  onSchemaChange: (schema: Schema) => void;
  resetIndices: () => void;
  pageIndex: number;
  schema: Schema;
  showModal: boolean;
}

const DeletePageModal: React.FC<DeletePageModalProps> = ({
  onModalChange,
  onSchemaChange,
  resetIndices,
  pageIndex,
  schema,
  showModal,
}) => {
  const { t } = useTranslation();

  const deletePage = (pageIndex: number) => {
    try {
      schema.pages.splice(pageIndex, 1);

      onSchemaChange({ ...schema });
      resetIndices();

      showToast({
        title: t("success", "Success!"),
        kind: "success",
        critical: true,
        description: t("pageDeleted", "Page deleted"),
      });
    } catch (error) {
      if (error instanceof Error) {
        showNotification({
          title: t("errorDeletingPage", "Error deleting page"),
          kind: "error",
          critical: true,
          description: error?.message,
        });
      }
    }
  };

  return (
    <ComposedModal
      open={showModal}
      onClose={() => onModalChange(false)}
      preventCloseOnClickOutside
    >
      <ModalHeader
        title={t(
          "deletePageConfirmation",
          "Are you sure you want to delete this page?",
        )}
      />
      <ModalBody>
        <p>
          {t(
            "deletePageExplainerText",
            "Deleting this page will delete all the sections and questions associated with it. This action cannot be undone.",
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={() => onModalChange(false)}>
          {t("cancel", "Cancel")}
        </Button>
        <Button
          kind="danger"
          onClick={() => {
            deletePage(pageIndex);
            onModalChange(false);
          }}
        >
          <span>{t("deletePage", "Delete page")}</span>
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default DeletePageModal;
