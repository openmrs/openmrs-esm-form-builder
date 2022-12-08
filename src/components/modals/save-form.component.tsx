import React, { useCallback, useState } from "react";
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
import { showNotification, showToast } from "@openmrs/esm-framework";
import {
  uploadSchema,
  saveNewForm,
  updateName,
  updateVersion,
  updateDescription,
  getResourceUUID,
  deleteClobData,
  deleteResource,
  updateEncounterType,
} from "../../forms.resource";
import { EncounterType, Resource, RouteParams, Schema } from "../../types";
import { useEncounterTypes } from "../../hooks/useEncounterTypes";
import styles from "./save-form.scss";

type FormGroupData = {
  name: string;
  uuid: string;
  version: string;
  encounterType: EncounterType;
  description: string;
  resources: Array<Resource>;
};
type SaveFormModalProps = { form: FormGroupData; schema: Schema };

const SaveForm: React.FC<SaveFormModalProps> = ({ form, schema }) => {
  const { t } = useTranslation();
  const { formUuid } = useParams<RouteParams>();
  const isSavingNewForm = !formUuid;
  const { encounterTypes } = useEncounterTypes();
  const [openSaveFormModal, setOpenSaveFormModal] = useState(false);
  const [openConfirmSaveModal, setOpenConfirmSaveModal] = useState(false);
  const [saveState, setSaveState] = useState("");
  const [isSavingForm, setIsSavingForm] = useState(false);

  const openModal = useCallback((option) => {
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSavingForm(true);
    let name = event.target.name.value,
      version = event.target.version.value,
      encounterType = event.target.encounterType.value,
      description = event.target.description.value,
      encounterTypeUUID;

    if (encounterType == "undefined") {
      encounterTypeUUID = undefined;
    } else {
      encounterTypes.forEach((encType) => {
        if (encounterType == encType.name) {
          encounterTypeUUID = encType.uuid;
        }
      });
    }

    if (saveState === "new" || saveState === "newVersion") {
      try {
        const newForm = await saveNewForm(
          name,
          version,
          false,
          description,
          encounterTypeUUID
        );
        const newValueReference = await uploadSchema(schema);
        await getResourceUUID(newForm.uuid, newValueReference.toString());
        showToast({
          title: t("formCreated", "Form created"),
          kind: "success",
          critical: true,
          description:
            name +
            " " +
            t(
              "saveSuccess",
              "was created successfully. It is now visible on the Forms dashboard."
            ),
        });
        setOpenSaveFormModal(false);
      } catch (error) {
        showNotification({
          title: t("errorCreatingForm", "Error creating form"),
          kind: "error",
          critical: true,
          description: error?.message,
        });
      }
    } else {
      try {
        if (form?.resources.length != 0) {
          deleteClobData(form?.resources[0].valueReference);
          deleteResource(form?.uuid, form?.resources[0].uuid);
        }
        const newValueReference = await uploadSchema(schema);
        await getResourceUUID(form?.uuid, newValueReference.toString());

        if (name !== form?.name) {
          await updateName(name, form?.uuid);
        }
        if (version !== form?.version) {
          await updateVersion(version, form?.uuid);
        }
        if (encounterTypeUUID !== form?.encounterType?.uuid) {
          await updateEncounterType(encounterTypeUUID, form?.uuid);
        }
        if (description !== form?.description) {
          await updateDescription(description, form?.uuid);
        }
        showToast({
          title: t("success", "Success!"),
          kind: "success",
          critical: true,
          description:
            name + " " + t("saveSuccess", "was updated successfully"),
        });
        setOpenSaveFormModal(false);
      } catch (error) {
        showNotification({
          title: t("errorUpdatingForm", "Error updating form"),
          kind: "error",
          critical: true,
          description: error?.message,
        });
      }
    }
  };

  return (
    <div>
      {!isSavingNewForm ? (
        <ComposedModal
          open={openConfirmSaveModal}
          onClose={() => setOpenConfirmSaveModal(false)}
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
      >
        <ModalHeader
          title={t("saveFormToServer", "Save form to server")}
        ></ModalHeader>
        <Form onSubmit={handleSubmit}>
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
                  defaultValue={saveState === "update" ? form?.name : ""}
                  placeholder="e.g. OHRI Express Care Patient Encounter Form"
                  required
                />
                {saveState === "update" ? (
                  <TextInput
                    id="uuid"
                    labelText="UUID (auto-generated)"
                    disabled
                    defaultValue={saveState === "update" ? form?.uuid : ""}
                  />
                ) : null}
                <TextInput
                  id="version"
                  labelText="Version"
                  defaultValue={saveState === "update" ? form?.version : ""}
                  placeholder="e.g. 1.0"
                  required
                />
                <Select
                  id="encounterType"
                  defaultValue={
                    form?.encounterType
                      ? form?.encounterType?.name
                      : "undefined"
                  }
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
                      value={encounterType.name}
                      text={encounterType.name}
                    />
                  ))}
                </Select>
                <TextArea
                  labelText={t("description", "Description")}
                  defaultValue={saveState === "update" ? form?.description : ""}
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
              disabled={isSavingForm}
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
