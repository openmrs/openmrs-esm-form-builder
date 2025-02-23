import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, FormGroup, ModalBody, ModalFooter, ModalHeader, TextInput, Checkbox } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Schema } from '@types';
import styles from '../modals.scss';

interface SectionModalProps {
  closeModal: () => void;
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  sectionIndex?: number;
  modalType?: 'edit';
}

const SectionModal: React.FC<SectionModalProps> = ({
  closeModal,
  schema,
  onSchemaChange,
  pageIndex,
  sectionIndex,
  modalType,
}) => {
  const { t } = useTranslation();
  const [sectionTitle, setSectionTitle] = useState(() => {
    return modalType === 'edit' ? schema.pages[pageIndex].sections[sectionIndex].label : '';
  });
  const [isExpanded, setIsExpanded] = useState(() => {
    return modalType === 'edit' ? schema.pages[pageIndex].sections[sectionIndex].isExpanded : 'true';
  });

  const handleUpdatePageSections = () => {
    updateSections();
    closeModal();
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, { checked }: { checked: boolean }) => {
    checked === true ? setIsExpanded('true') : setIsExpanded('false');
  };

  const updateSections = () => {
    try {
      if (modalType === 'edit') {
        schema.pages[pageIndex].sections[sectionIndex].label = sectionTitle;
        schema.pages[pageIndex].sections[sectionIndex].isExpanded = isExpanded;
      } else {
        schema.pages[pageIndex]?.sections?.push({
          label: sectionTitle,
          isExpanded: isExpanded,
          questions: [],
        });
      }
      onSchemaChange({ ...schema });
      setSectionTitle('');

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle:
          modalType === 'edit' ? t('sectionEdited', 'Section edited') : t('sectionCreated', 'New section created'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title:
            modalType === 'edit'
              ? t('errorCreatingSection', 'Error creating section')
              : t('errorEditingSection', 'Error editing section'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
  };

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        title={
          modalType === 'edit' ? t('editTheSection', 'Edit the section') : t('createNewSection', 'Create a new section')
        }
        closeModal={closeModal}
      />
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
              labelText={t('expandedSection', 'Keep section Expanded')}
              onChange={handleCheckboxChange}
            />
          </FormGroup>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button onClick={closeModal} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={!sectionTitle} onClick={handleUpdatePageSections}>
          <span>{t('save', 'Save')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};
export default SectionModal;
