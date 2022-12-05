import React from "react";
import { AccordionItem, Button, Column, Row } from "@carbon/react";
import { Page, Schema } from "../../types";
import SectionElement from "./section.component";
import styles from "./elements.scss";
import { TrashCan } from "@carbon/react/icons";
import { useTranslation } from "react-i18next";
import EditPage from "../modals/edit-page.component";
import CreateSection from "../modals/new-section.component";

interface PageElementProps {
  page: Page;
  index: any;
  deletePage: (index: number) => void;
  schema: Schema;
  onSchemaUpdate: (schema: Schema) => void;
}

const PageElement: React.FC<PageElementProps> = ({
  page,
  index,
  deletePage,
  schema,
  onSchemaUpdate,
}) => {
  const { t } = useTranslation();
  const deleteSection = (index) => {
    page.sections.splice(index, 1);
    onSchemaUpdate({ ...schema });
  };

  return (
    <div>
      <Row>
        <Column sm={3} md={7} lg={10} className={styles.pageElementColumn}>
          <AccordionItem title={page.label} className={styles.accordion}>
            <div>
              <Row className={styles.sectionRow}>
                <Column>
                  <div className={styles.sectionsTitle}>
                    {t("sections", "Sections")}
                  </div>
                </Column>
                <Column>
                  <CreateSection
                    sections={page.sections}
                    schema={schema}
                    onSchemaUpdate={onSchemaUpdate}
                  />
                </Column>
              </Row>
              {page.sections
                ? page.sections.map((section, key) => (
                    <SectionElement
                      section={section}
                      key={key}
                      index={key}
                      deleteSection={deleteSection}
                      schema={schema}
                      onSchemaUpdate={onSchemaUpdate}
                    />
                  ))
                : null}
            </div>
          </AccordionItem>
        </Column>
        <Column sm={1} md={1} lg={2} className={styles.pageOptionsColumn}>
          <EditPage
            page={page}
            schema={schema}
            onSchemaUpdate={onSchemaUpdate}
          />
          <Button
            size="sm"
            renderIcon={TrashCan}
            iconDescription="Delete Page"
            hasIconOnly
            kind="ghost"
            onClick={() => {
              deletePage(index);
            }}
          />
        </Column>
      </Row>
    </div>
  );
};
export default PageElement;
