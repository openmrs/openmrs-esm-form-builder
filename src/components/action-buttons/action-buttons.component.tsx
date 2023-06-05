import React, { useState } from "react";
import {
  Button,
  ComposedModal,
  InlineLoading,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@carbon/react";
import { useParams } from "react-router-dom";
import { showToast, showNotification } from "@openmrs/esm-framework";

import type { TFunction } from "react-i18next";
import type { RouteParams, Schema } from "../../types";
import { publishForm, unpublishForm } from "../../forms.resource";
import { useForm } from "../../hooks/useForm";
import SaveFormModal from "../modals/save-form.component";
import styles from "./action-buttons.scss";

type Status =
  | "idle"
  | "publishing"
  | "published"
  | "unpublishing"
  | "unpublished"
  | "error";

type ActionButtonsProps = {
  schema: Schema;
  t: TFunction;
};

function ActionButtons({ schema, t }: ActionButtonsProps) {
  const { formUuid } = useParams<RouteParams>();
  const { form, mutate } = useForm(formUuid);
  const [status, setStatus] = useState<Status>("idle");
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);

  const launchUnpublishModal = () => {
    setShowUnpublishModal(true);
  };

  async function handlePublish() {
    setStatus("publishing");
    try {
      await publishForm(form.uuid);

      showToast({
        title: t("formPublished", "Form published"),
        kind: "success",
        critical: true,
        description:
          `${form.name} ` +
          t("formPublishedSuccessfully", "form was published successfully"),
      });

      setStatus("published");
      mutate();
    } catch (error) {
      showNotification({
        title: t("errorPublishingForm", "Error publishing form"),
        kind: "error",
        critical: true,
        description: error?.message,
      });
      setStatus("error");
    }
  }

  async function handleUnpublish() {
    setStatus("unpublishing");
    try {
      await unpublishForm(form.uuid);

      showToast({
        title: t("formUnpublished", "Form unpublished"),
        kind: "success",
        critical: true,
        description:
          `${form.name} ` +
          t("formUnpublishedSuccessfully", "form was unpublished successfully"),
      });

      setStatus("unpublished");
      mutate();
    } catch (error) {
      showNotification({
        title: t("errorUnpublishingForm", "Error unpublishing form"),
        kind: "error",
        critical: true,
        description: error?.message,
      });
      setStatus("error");
    }
    setShowUnpublishModal(false);
  }

  return (
    <div className={styles.actionButtons}>
      <SaveFormModal form={form} schema={schema} />

      <>
        {form && !form.published ? (
          <Button
            kind="secondary"
            onClick={handlePublish}
            disabled={status === "publishing"}
          >
            {status === "publishing" && !form?.published ? (
              <InlineLoading
                className={styles.spinner}
                description={t("publishing", "Publishing") + "..."}
              />
            ) : (
              <span>{t("publishForm", "Publish form")}</span>
            )}
          </Button>
        ) : null}

        {form && form.published ? (
          <Button
            kind="danger"
            onClick={launchUnpublishModal}
            disabled={status === "unpublishing"}
          >
            {t("unpublishForm", "Unpublish form")}
          </Button>
        ) : null}

        {showUnpublishModal ? (
          <ComposedModal
            open={true}
            onClose={() => setShowUnpublishModal(false)}
            preventCloseOnClickOutside
          >
            <ModalHeader
              title={t(
                "unpublishConfirmation",
                "Are you sure you want to unpublish this form?"
              )}
            ></ModalHeader>
            <ModalBody>
              <p>
                {t(
                  "unpublishExplainerText",
                  "Unpublishing a form means you can no longer access it from your frontend. Unpublishing forms does not delete their associated schemas, it only affects whether or not you can access them in your frontend."
                )}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                kind="secondary"
                onClick={() => setShowUnpublishModal(false)}
              >
                {t("cancel", "Cancel")}
              </Button>
              <Button
                disabled={status === "unpublishing"}
                kind={status === "unpublishing" ? "secondary" : "danger"}
                onClick={handleUnpublish}
              >
                {status === "unpublishing" ? (
                  <InlineLoading
                    className={styles.spinner}
                    description={t("unpublishing", "Unpublishing") + "..."}
                  />
                ) : (
                  <span>{t("unpublishForm", "Unpublish form")}</span>
                )}
              </Button>
            </ModalFooter>
          </ComposedModal>
        ) : (
          false
        )}
      </>
    </div>
  );
}

export default ActionButtons;
