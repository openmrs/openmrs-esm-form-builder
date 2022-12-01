import React, { useEffect, useState } from "react";
import {
  Column,
  ComposedModal,
  InlineLoading,
  InlineNotification,
  Grid,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Button,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import { useSWRConfig } from "swr";
import SchemaEditorComponent from "../schema-editor/schema-editor.component";
import styles from "./form-editor.scss";
import { useParams } from "react-router-dom";
import SaveForm from "../modals/save-form.component";
import {
  showToast,
  ExtensionSlot,
  showNotification,
} from "@openmrs/esm-framework";
import { useClobdata } from "../../hooks/useClobdata";
import { useForm } from "../../hooks/useForm";
import { publishForm, unpublishForm } from "../../forms.resource";
import FormRenderer from "../form-renderer/form-renderer.component";
import ElementEditor from "../element-editor/element-editor.component";
import { Schema } from "../../types";

type Route = {
  formUuid: string;
};

const Error = ({ error, title }) => {
  return (
    <InlineNotification
      style={{
        minWidth: "100%",
        margin: "0rem",
        padding: "0rem",
      }}
      kind={"error"}
      lowContrast
      subtitle={error?.message}
      title={title}
    />
  );
};

const FormEditor: React.FC = () => {
  const { t } = useTranslation();
  const { formUuid } = useParams<Route>();
  const [schema, setSchema] = useState<Schema>(undefined);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const { form, formError, isLoadingForm } = useForm(formUuid);
  const { clobdata, clobdataError, isLoadingClobdata } = useClobdata(form);
  const { cache, mutate }: { cache: any; mutate: Function } = useSWRConfig();

  useEffect(() => {
    if (clobdata) {
      setSchema(clobdata);
    }
  }, [clobdata, setSchema]);

  const updateSchema = (updatedSchema) => {
    setSchema(updatedSchema);
  };

  const revalidate = () => {
    const apiUrlPattern = new RegExp("\\/ws\\/rest\\/v1\\/form");

    // Find matching keys from SWR's cache and broadcast a revalidation message to their pre-bound SWR hooks
    Array.from(cache.keys())
      .filter((url: string) => apiUrlPattern.test(url))
      .forEach((url: string) => mutate(url));
  };

  const launchUnpublishModal = () => {
    setShowUnpublishModal(true);
  };

  async function handlePublish() {
    setIsPublishing(true);
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

      revalidate();
    } catch (error) {
      showNotification({
        title: t("errorPublishingForm", "Error publishing form"),
        kind: "error",
        critical: true,
        description: error?.message,
      });
    }
    setIsPublishing(false);
  }

  async function handleUnpublish() {
    setIsUnpublishing(true);
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

      revalidate();
    } catch (error) {
      showNotification({
        title: t("errorUnpublishingForm", "Error unpublishing form"),
        kind: "error",
        critical: true,
        description: error?.message,
      });
    }
    setIsUnpublishing(false);
    setShowUnpublishModal(false);
  }

  useEffect(() => {
    if (!isLoadingClobdata) {
      setSchema(clobdata);
    }
  }, [clobdata, isLoadingClobdata]);

  return (
    <>
      <div className={styles.breadcrumbsContainer}>
        <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      </div>
      <div className={styles.container}>
        <div className={styles.actionsContainer}>
          <SaveForm form={form} schema={schema} />

          <>
            {form && !form.published ? (
              <Button
                kind="secondary"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing && !form?.published ? (
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
                disabled={isUnpublishing}
              >
                {t("unpublishForm", "Unpublish form")}
              </Button>
            ) : null}
            {showUnpublishModal ? (
              <ComposedModal
                open={true}
                onClose={() => setShowUnpublishModal(false)}
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
                    disabled={isUnpublishing}
                    kind={isUnpublishing ? "secondary" : "danger"}
                    onClick={handleUnpublish}
                  >
                    {isUnpublishing ? (
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
        <Grid className={styles.grid}>
          <Column lg={8} md={8} className={styles.column}>
            <Tabs>
              <TabList>
                <Tab>{t("schemaEditor", "Schema Editor")}</Tab>
                <Tab>{t("interactiveBuilder", "Interactive Builder")}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <>
                    {formError ? (
                      <Error
                        error={formError}
                        title={t("formError", "Error loading form metadata")}
                      />
                    ) : null}
                    {clobdataError ? (
                      <Error
                        error={clobdataError}
                        title={t("schemaLoadError", "Error loading schema")}
                      />
                    ) : null}
                    <SchemaEditorComponent
                      schema={schema}
                      onSchemaUpdate={updateSchema}
                      isLoading={
                        formUuid && (isLoadingClobdata || isLoadingForm)
                      }
                    />
                  </>
                </TabPanel>
                <TabPanel>
                  <ElementEditor
                    schema={schema}
                    onSchemaUpdate={updateSchema}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Column>
          <Column lg={8} md={8} className={styles.column}>
            <Tabs>
              <TabList>
                <Tab>{t("formViewer", "Form Viewer")}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <div className={styles.renderComponent}>
                    <FormRenderer
                      schema={schema}
                      onSchemaUpdate={updateSchema}
                    />
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Column>
        </Grid>
      </div>
    </>
  );
};

export default FormEditor;
