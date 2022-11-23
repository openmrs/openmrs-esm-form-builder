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
  Toggle,
} from "@carbon/react";
import { Section } from "../../../types";
import { Edit } from "@carbon/react/icons";
import { SchemaContext } from "../../../context/context";
import { showToast } from "@openmrs/esm-framework";

interface EditSectionModalProps {
  section: Section;
}

const EditSection: React.FC<EditSectionModalProps> = ({ section }) => {
  const { t } = useTranslation();
  const { schema, setSchema } = useContext(SchemaContext);
  const [openEditSectionModal, setOpenEditSectionModal] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    setSectionName(section.label);
    if (section.isExpanded === "true") {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [section]);

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      section.label = sectionName;
      section.isExpanded = isExpanded ? "true" : "false";
      setSchema({ ...schema });
      showToast({
        title: t("success", "Success!"),
        kind: "success",
        critical: true,
        description: t("updateSection", "Section Updated"),
      });
      setOpenEditSectionModal(false);
    } catch (error) {
      showToast({
        title: t("error", "Error"),
        kind: "error",
        critical: true,
        description: error?.message,
      });
    }
  };
  return (
    <>
      <div>
        <ComposedModal
          open={openEditSectionModal}
          onClose={() => setOpenEditSectionModal(false)}
        >
          <ModalHeader title={t("editSection", "Edit Section")} />
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
                onClick={() => setOpenEditSectionModal(false)}
              >
                {t("close", "Close")}
              </Button>
            </ModalFooter>
          </Form>
        </ComposedModal>
      </div>
      <Button
        size="sm"
        renderIcon={Edit}
        iconDescription="Edit Section"
        hasIconOnly
        kind="ghost"
        onClick={() => {
          setOpenEditSectionModal(true);
        }}
      />
    </>
  );
};

export default EditSection;
