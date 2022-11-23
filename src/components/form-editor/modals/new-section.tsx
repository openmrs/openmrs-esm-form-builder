import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  TextInput,
} from "@carbon/react";
import { Section } from "../../../types";
import { Add } from "@carbon/react/icons";
import { SchemaContext } from "../../../context/context";
import { showToast } from "@openmrs/esm-framework";

interface CreateSectionModalProps {
  sections: Array<Section>;
}

const CreateSection: React.FC<CreateSectionModalProps> = ({ sections }) => {
  const { t } = useTranslation();
  const { schema, setSchema } = useContext(SchemaContext);
  const [openCreateSectionModal, setOpenCreateSectionModal] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const newSection: Section = {
      label: sectionName,
      isExpanded: isExpanded,
      questions: [],
    };
    try {
      sections.push(newSection);
      setSchema({ ...schema });
      showToast({
        title: t("success", "Success!"),
        kind: "success",
        critical: true,
        description: t("createSectionSuccess", "Section Created"),
      });
      setOpenCreateSectionModal(false);
    } catch (error) {
      showToast({
        title: t("error", "Error"),
        kind: "error",
        critical: true,
        description: error?.message,
      });
    }
  };

  useEffect(() => {
    setSectionName("");
    setIsExpanded(false);
  }, [openCreateSectionModal]);

  return (
    <>
      <div>
        <ComposedModal
          open={openCreateSectionModal}
          onClose={() => setOpenCreateSectionModal(false)}
        >
          <ModalHeader title={t("createSection", "Create Section")} />
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormGroup legendText={""}>
                <TextInput
                  id="sectionName"
                  labelText="Section Name"
                  value={sectionName}
                  onChange={(event) => setSectionName(event.target.value)}
                  required
                />
                <Select
                  value={isExpanded ? "Yes" : "No"}
                  onChange={(event) =>
                    setIsExpanded(event.target.value == "Yes" ? true : false)
                  }
                  id="isExpanded"
                  invalidText="A valid value is required"
                  labelText="Is Expanded"
                  disabled={false}
                  inline={false}
                  invalid={false}
                  required
                >
                  <SelectItem text="Yes" value="Yes" hidden={false} />
                  <SelectItem text="No" value="No" hidden={false} />
                </Select>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button type={"submit"} kind={"primary"}>
                {t("save", "Save")}
              </Button>
              <Button
                kind={"secondary"}
                onClick={() => setOpenCreateSectionModal(false)}
              >
                {t("close", "Close")}
              </Button>
            </ModalFooter>
          </Form>
        </ComposedModal>
      </div>
      <Button
        renderIcon={Add}
        kind="tertiary"
        size="small"
        hasIconOnly
        iconDescription="New Section"
        onClick={() => {
          setOpenCreateSectionModal(true);
        }}
      />
    </>
  );
};

export default CreateSection;
