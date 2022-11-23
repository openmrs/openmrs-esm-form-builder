import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./../form-editor.scss";
import {
  Button,
  ComposedModal,
  Form,
  FormGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  TextArea,
  TextInput,
} from "@carbon/react";
import { EncounterType, Resource } from "../../../types";
import { useEncounterTypes } from "../../../hooks/useEncounterTypes";
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
} from "../../../forms.resource";
import { showToast } from "@openmrs/esm-framework";
import { SchemaContext } from "../../../context/context";

interface SaveFormModalProps {
  form: FormGroupData;
}

interface FormGroupData {
  name: string;
  uuid: string;
  version: string;
  encounterType: EncounterType;
  description: string;
  resources: Array<Resource>;
}

const SaveForm: React.FC<SaveFormModalProps> = ({ form }) => {
  const { t } = useTranslation();
  const { encounterTypes, encounterTypesError } = useEncounterTypes();
  const [openSaveFormModal, setOpenSaveFormModal] = useState(false);
  const [openConfirmSaveModal, setOpenConfirmSaveModal] = useState(false);
  const [saveState, setSaveState] = useState("");
  const { schema, setSchema } = useContext(SchemaContext);

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
    let name = event.target.name.value;
    let version = event.target.version.value;
    let encounterType = event.target.encounterType.value;
    let encounterTypeUUID;
    let description = event.target.description.value;

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
          title: t("success", "Success!"),
          kind: "success",
          critical: true,
          description: t("saveSuccess", "Form created"),
        });
      } catch (error) {
        showToast({
          title: t("error", "Error"),
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
          description: t("saveSuccess", "Form updated"),
        });
      } catch (error) {
        showToast({
          title: t("error", "Error"),
          kind: "error",
          critical: true,
          description: error?.message,
        });
      }
    }
  };
  return (
    <div>
      <ComposedModal
        open={openConfirmSaveModal}
        onClose={() => setOpenConfirmSaveModal(false)}
      >
        <ModalHeader title={t("confirmSave", "Confirm Save")} />
        <ModalBody>
          <p>
            {t(
              "saveAsModal",
              "Would you want to update the form or save as a new version?"
            )}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button kind={"tertiary"} onClick={() => openModal("update")}>
            {t("updateCurrentForm", "Update current version")}
          </Button>
          <Button kind={"primary"} onClick={() => openModal("newVersion")}>
            {t("saveAsNewForm", "Save as a new version")}
          </Button>
          <Button
            kind={"secondary"}
            onClick={() => setOpenConfirmSaveModal(false)}
          >
            {t("close", "Close")}
          </Button>
        </ModalFooter>
      </ComposedModal>

      <ComposedModal
        open={openSaveFormModal}
        onClose={() => setOpenSaveFormModal(false)}
      >
        <ModalHeader title={t("saveForm", "Save Form")} />
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <FormGroup legendText={""}>
              <TextInput
                id="name"
                labelText="Name"
                defaultValue={saveState === "update" ? form?.name : ""}
                required
              />
              {saveState === "update" ? (
                <TextInput
                  id="uuid"
                  labelText="UUID"
                  readOnly
                  defaultValue={saveState === "update" ? form?.uuid : ""}
                />
              ) : null}
              <TextInput
                id="version"
                labelText="Version"
                defaultValue={saveState === "update" ? form?.version : ""}
                required
              />
              <Select
                id="encounterType"
                defaultValue={
                  form?.encounterType ? form?.encounterType?.name : "undefined"
                }
                labelText="Encounter Type"
                required
              >
                <SelectItem
                  disabled
                  hidden
                  value={
                    form?.encounterType
                      ? form?.encounterType?.name
                      : "undefined"
                  }
                  text={
                    form?.encounterType
                      ? form?.encounterType.name
                      : "Choose an option"
                  }
                />
                {encounterTypes?.map((encounterType, key) => {
                  return (
                    <SelectItem
                      key={key}
                      value={encounterType.name}
                      text={encounterType.name}
                    />
                  );
                })}
              </Select>
              <TextArea
                labelText="Description"
                defaultValue={saveState === "update" ? form?.description : ""}
                cols={6}
                rows={3}
                id="description"
                required
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button type={"submit"} kind={"primary"}>
              {t("save", "Save")}
            </Button>
            <Button
              kind={"secondary"}
              onClick={() => setOpenSaveFormModal(false)}
            >
              {t("close", "Close")}
            </Button>
          </ModalFooter>
        </Form>
      </ComposedModal>
      <Button
        className={styles.saveOptionButton}
        kind="ghost"
        onClick={() =>
          form !== null ? setOpenConfirmSaveModal(true) : openModal("new")
        }
      >
        {t("save", "Save")}
      </Button>
    </div>
  );
};

export default SaveForm;
