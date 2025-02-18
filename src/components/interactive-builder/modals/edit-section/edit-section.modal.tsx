import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader, Form, FormGroup, TextInput, Checkbox } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Schema } from '@types';
import styles from '../modals.scss';

interface EditSectionModal {
  closeModal: () => void;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  sectionIndex: number;
  schema: Schema;
}

const EditSectionModal: React.FC<EditSectionModal> = ({
  closeModal,
  onSchemaChange,
  pageIndex,
  sectionIndex,
  schema,
}) => {
  const { t } = useTranslation();
  const [sectionTitle, setSectionTitle] = useState(schema.pages[pageIndex].sections[sectionIndex].label);
  const [isExpanded, setIsExpanded] = useState(schema.pages[pageIndex].sections[sectionIndex].isExpanded);

  const handleEditPageSections = () => {
    editSection(pageIndex, sectionIndex);
    closeModal();
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, { checked }: { checked: boolean }) => {
    checked === true ? setIsExpanded('true') : setIsExpanded('false');
  };

  const editSection = (pageIndex: number, sectionIndex: number) => {
    try {
      schema.pages[pageIndex].sections[sectionIndex].label = sectionTitle;
      schema.pages[pageIndex].sections[sectionIndex].isExpanded = isExpanded;

      onSchemaChange({ ...schema });

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('SectionEdited', 'Section edited'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorDeletingSection', 'Error editing section'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
  };

  return (
    <>
      <ModalHeader className={styles.modalHeader} title={t('editSection', 'Edit section')} closeModal={closeModal} />
      <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <FormGroup legendText={''}>
            <TextInput
              id="sectionTitle"
              labelText={t('enterSectionTitle', 'Enter a section title')}
              value={sectionTitle}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSectionTitle(event.target.value)}
            />
            <br></br>
            <Checkbox
              id="isExpanded"
              checked={isExpanded === 'true' ? true : false}
              labelText={t('expandedSection', 'Expand section')}
              onChange={handleCheckboxChange}
            />
          </FormGroup>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button onClick={closeModal} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={!sectionTitle} onClick={handleEditPageSections}>
          <span>{t('edit', 'Edit')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default EditSectionModal;
