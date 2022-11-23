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
  TextInput,
} from "@carbon/react";
import { Page } from "../../../types";
import { Add } from "@carbon/react/icons";
import { SchemaContext } from "../../../context/context";
import { showToast } from "@openmrs/esm-framework";
import styles from "./modals.scss";

interface NewPageModalProps {
  pages: Array<Page>;
}

const CreatePage: React.FC<NewPageModalProps> = ({ pages }) => {
  const { t } = useTranslation();
  const { schema, setSchema } = useContext(SchemaContext);
  const [openCreatePageModal, setOpenCreatePageModal] = useState(false);
  const [pageName, setPageName] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const newPage: Page = { label: pageName, sections: [] };
    try {
      pages.push(newPage);
      setSchema({ ...schema });
      showToast({
        title: t("success", "Success!"),
        kind: "success",
        critical: true,
        description: t("createPageSuccess", "Page Created"),
      });
      setOpenCreatePageModal(false);
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
    setPageName("");
  }, [openCreatePageModal]);

  return (
    <>
      <div>
        <ComposedModal
          open={openCreatePageModal}
          onClose={() => setOpenCreatePageModal(false)}
        >
          <ModalHeader title={t("createPage", "Create Page")} />
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormGroup legendText={""}>
                <TextInput
                  id="pageName"
                  labelText="Page Name"
                  value={pageName}
                  onChange={(event) => setPageName(event.target.value)}
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
                onClick={() => setOpenCreatePageModal(false)}
              >
                {t("close", "Close")}
              </Button>
            </ModalFooter>
          </Form>
        </ComposedModal>
      </div>
      <Button
        className={styles.CreatePageButton}
        renderIcon={Add}
        iconDescription="Create Page"
        onClick={() => {
          setOpenCreatePageModal(true);
        }}
      >
        {t("createPage", "Create Page")}
      </Button>
    </>
  );
};

export default CreatePage;
