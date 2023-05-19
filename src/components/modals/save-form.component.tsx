import React, { SyntheticEvent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  Button,
  ComposedModal,
  Form,
  FormGroup,
  InlineLoading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Stack,
  TextArea,
  TextInput,
} from "@carbon/react";
import { navigate, showNotification, showToast } from "@openmrs/esm-framework";
import {
  deleteClobdata,
  deleteResource,
  getResourceUuid,
  saveNewForm,
  updateForm,
  uploadSchema,
} from "../../forms.resource";
import { EncounterType, Resource, RouteParams, Schema } from "../../types";
import { useEncounterTypes } from "../../hooks/useEncounterTypes";
import { useForm } from "../../hooks/useForm";
import styles from "./save-form.scss";

type FormGroupData = {
  name: string;
  uuid: string;
  version: string;
  encounterType: EncounterType;
  description: string;
  resources: Array<Resource>;
};

type SaveFormModalProps = {
  form: FormGroupData;
  schema: Schema;
};

const SaveForm: React.FC<SaveFormModalProps> = ({ form, schema }) => {
  const { t } = useTranslation();
  const { formUuid } = useParams<RouteParams>();
  const isSavingNewForm = !formUuid;
  const { encounterTypes } = useEncounterTypes();
  const { mutate } = useForm(formUuid);
  const [openSaveFormModal, setOpenSaveFormModal] = useState(false);
  const [openConfirmSaveModal, setOpenConfirmSaveModal] = useState(false);
  const [saveState, setSaveState] = useState("");
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [isInvalidVersion, setIsInvalidVersion] = useState(false);
  const [name, setName] = useState(form?.name);
  const [description, setDescription] = useState(form?.description);
  const [encounterType, setEncounterType] = useState(
    form?.encounterType?.uuid || ""
  );
  const [version, setVersion] = useState(form?.version);

  const checkVersionValidity = (version: string) => {
    if (!version) return setIsInvalidVersion(false);

    setIsInvalidVersion(!/^[0-9]/.test(version));
  };

  const clearDraftFormSchema = () => localStorage.removeItem("formJSON");

  const openModal = useCallback((option: string) => {
    if (option === "newVersion") {
      setSaveState("newVersion");
      setOpenConfirmSaveModal(false);
      setOpenSaveFormModal(true);
    } else if (option === "new") {
      setSaveState("newVersion");
      setOpenSaveFormModal(true);
    } else if (option === "update") {
      setSaveState("update");
      setOpenConfirmSaveModal(false);
      setOpenSaveFormModal(true);
    }
  }, []);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setIsSavingForm(true);

    const target = event.target as typeof event.target & {
      name: { value: string };
      version: { value: string };
      encounterType: { value: string };
      description: { value: string };
    };

    if (saveState === "new" || saveState === "newVersion") {
      const name = target.name.value,
        version = target.version.value,
        encounterType = target.encounterType.value,
        description = target.description.value;

      try {
        const newForm = await saveNewForm(
          name,
          version,
          false,
          description,
          encounterType
        );

        const updatedSchema = {
          ...schema,
          name: name,
          version: version,
          description: description,
          encounterType: encounterType,
        };

        const newValueReference = await uploadSchema(updatedSchema);
        await getResourceUuid(newForm.uuid, newValueReference.toString());
        showToast({
          title: t("formCreated", "New form created"),
          kind: "success",
          critical: true,
          description:
            name +
            " " +
            t(
              "saveSuccessMessage",
              "was created successfully. It is now visible on the Forms dashboard."
            ),
        });
        clearDraftFormSchema();
        setOpenSaveFormModal(false);
        mutate();
        navigate({
          to: `${window.spaBase}/form-builder/edit/${newForm.uuid}`,
        });
        setIsSavingForm(false);
      } catch (error) {
        showNotification({
          title: t("errorCreatingForm", "Error creating form"),
          kind: "error",
          critical: true,
          description: error?.message,
        });
        setIsSavingForm(false);
      }
    } else {
      try {
        const updatedSchema = {
          ...schema,
          name: name,
          version: version,
          description: description,
          encounterType: encounterType,
        };

        await updateForm(form.uuid, name, version, description, encounterType);

        if (form?.resources?.length !== 0) {
          const existingValueReferenceUuid = form?.resources?.find(
            ({ name }) => name === "JSON schema"
          )?.valueReference;

          await deleteClobdata(existingValueReferenceUuid)
            .catch((error) =>
              console.error("Unable to delete clobdata: ", error)
            )
            .then(() => {
              const resourceUuidToDelete = form?.resources?.find(
                ({ name }) => name === "JSON schema"
              )?.uuid;

              deleteResource(form?.uuid, resourceUuidToDelete)
                .then(() => {
                  uploadSchema(updatedSchema)
                    .then((result) => {
                      getResourceUuid(form?.uuid, result.toString())
                        .then(() => {
                          showToast({
                            title: t("success", "Success!"),
                            kind: "success",
                            critical: true,
                            description:
                              form?.name +
                              " " +
                              t("saveSuccess", "was updated successfully"),
                          });
                          setOpenSaveFormModal(false);
                          mutate();
                        })
                        .catch((err) => {
                          console.error(
                            "Error associating form with new schema: ",
                            err
                          );

                          showNotification({
                            title: t("errorSavingForm", "Unable to save form"),
                            kind: "error",
                            critical: true,
                            description: t(
                              "saveError",
                              "There was a problem saving your form. Try saving again. To ensure you don’t lose your changes, copy them, reload the page and then paste them back into the editor."
                            ),
                          });
                        });
                    })
                    .catch((err) =>
                      console.error("Error uploading new schema: ", err)
                    );
                })
                .catch((error) =>
                  console.error(
                    "Unable to create new clobdata resource: ",
                    error
                  )
                );
            });

          setIsSavingForm(false);
        }
      } catch (error) {
        showNotification({
          title: t("errorUpdatingForm", "Error updating form"),
          kind: "error",
          critical: true,
          description: error?.message,
        });

        setIsSavingForm(false);
      }
    }
  };

  return (
    <div>
      {!isSavingNewForm ? (
        <ComposedModal
          open={openConfirmSaveModal}
          onClose={() => setOpenConfirmSaveModal(false)}
          preventCloseOnClickOutside
        >
          <ModalHeader title={t("saveConfirmation", "Save or Update form")} />
          <ModalBody>
            <p>
              {t(
                "saveAsModal",
                "A version of the form you're working on already exists on the server. Do you want to update the form or to save it as a new version?"
              )}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button kind={"tertiary"} onClick={() => openModal("update")}>
              {t("updateExistingForm", "Update existing version")}
            </Button>
            <Button kind={"primary"} onClick={() => openModal("newVersion")}>
              {t("saveAsNewForm", "Save as a new")}
            </Button>
            <Button
              kind={"secondary"}
              onClick={() => setOpenConfirmSaveModal(false)}
            >
              {t("close", "Close")}
            </Button>
          </ModalFooter>
        </ComposedModal>
      ) : null}

      <ComposedModal
        open={openSaveFormModal}
        onClose={() => setOpenSaveFormModal(false)}
        preventCloseOnClickOutside
      >
        <ModalHeader
          title={t("saveFormToServer", "Save form to server")}
        ></ModalHeader>
        <Form onSubmit={handleSubmit} className={styles.saveFormBody}>
          <ModalBody>
            <p>
              {t(
                "saveExplainerText",
                "Clicking the Save button saves your form schema to the database. To see your form in your frontend, you first need to publish it. Click the Publish button to publish your form."
              )}
            </p>
            <FormGroup legendText={""}>
              <Stack gap={5}>
                <TextInput
                  id="name"
                  labelText={t("formName", "Form name")}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. OHRI Express Care Patient Encounter Form"
                  required
                  value={schema?.name || form?.name}
                />
                {saveState === "update" ? (
                  <TextInput
                    id="uuid"
                    labelText="UUID (auto-generated)"
                    disabled
                    value={schema?.uuid || form?.uuid}
                  />
                ) : null}
                <TextInput
                  id="version"
                  labelText="Version"
                  placeholder="e.g. 1.0"
                  required
                  onChange={(event) => {
                    checkVersionValidity(event.target.value);

                    if (!isInvalidVersion) {
                      setVersion(event.target.value);
                    }
                  }}
                  invalid={isInvalidVersion}
                  invalidText={t(
                    "invalidVersionWarning",
                    "Version can only start with with a number"
                  )}
                  value={schema?.version || form?.version}
                />
                <Select
                  id="encounterType"
                  defaultValue={encounterType}
                  onChange={(event) => setEncounterType(event.target.value)}
                  labelText={t("encounterType", "Encounter Type")}
                  required
                >
                  {!form?.encounterType ? (
                    <SelectItem
                      text={t(
                        "chooseEncounterType",
                        "Choose an encounter type to link your form to"
                      )}
                    />
                  ) : null}
                  {encounterTypes?.map((encounterType, key) => (
                    <SelectItem
                      key={key}
                      value={encounterType.uuid}
                      text={encounterType.name}
                    />
                  ))}
                </Select>
                <TextArea
                  labelText={t("description", "Description")}
                  defaultValue={saveState === "update" ? form?.description : ""}
                  onChange={(event) => setDescription(event.target.value)}
                  cols={6}
                  rows={3}
                  id="description"
                  placeholder={t(
                    "descriptionPlaceholderText",
                    "e.g. A form used to collect encounter data for clients in the Express Care program."
                  )}
                  required
                />
              </Stack>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              kind={"secondary"}
              onClick={() => setOpenSaveFormModal(false)}
            >
              {t("close", "Close")}
            </Button>
            <Button
              disabled={isSavingForm || isInvalidVersion}
              className={styles.spinner}
              type={"submit"}
              kind={"primary"}
            >
              {isSavingForm ? (
                <InlineLoading description={t("saving", "Saving") + "..."} />
              ) : (
                <span>{t("save", "Save")}</span>
              )}
            </Button>
          </ModalFooter>
        </Form>
      </ComposedModal>

      <Button
        disabled={!schema}
        kind="primary"
        onClick={() =>
          isSavingNewForm ? openModal("new") : setOpenConfirmSaveModal(true)
        }
      >
        {t("saveForm", "Save form")}
      </Button>
    </div>
  );
};

export default SaveForm;
