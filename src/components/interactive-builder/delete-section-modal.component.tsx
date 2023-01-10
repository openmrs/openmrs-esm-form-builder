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
import { Schema } from "../../types";

type DeleteSectionModal = {
  onModalChange: (showModal: boolean) => void;
  onSchemaChange: (schema: Schema) => void;
  resetIndices: () => void;
  pageIndex: number;
  sectionIndex: number;
  schema: Schema;
  showModal: boolean;
};

const DeleteSectionModal: React.FC<DeleteSectionModal> = ({
  onModalChange,
  onSchemaChange,
  resetIndices,
  pageIndex,
  sectionIndex,
  schema,
  showModal,
}) => {
  const { t } = useTranslation();

  const deleteSection = (pageIndex, sectionIndex) => {
    try {
      schema.pages[pageIndex].sections.splice(sectionIndex, 1);

      onSchemaChange({ ...schema });
      resetIndices();

      showToast({
        title: t("success", "Success!"),
        kind: "success",
        critical: true,
        description: t("SectionDeleted", "Section deleted"),
      });
    } catch (error) {
      showNotification({
        title: t("errorDeletingSection", "Error deleting section"),
        kind: "error",
        critical: true,
        description: error?.message,
      });
    }
  };

  return (
    <ComposedModal open={showModal} onClose={() => onModalChange(false)}>
      <ModalHeader
        title={t(
          "deleteSectionConfirmation",
          "Are you sure you want to delete this section?"
        )}
      />
      <ModalBody>
        <p>
          {t(
            "deleteSectionExplainerText",
            "Deleting this section will delete all the questions associated with it. This action cannot be undone."
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
            deleteSection(pageIndex, sectionIndex);
            onModalChange(false);
          }}
        >
          <span>{t("deleteSection", "Delete section")}</span>
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default DeleteSectionModal;
