import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Form,
  FormGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  TextInput,
  Select,
  SelectItem,
  Tile,
} from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { formTemplates } from '@utils/form-templates';
import type { Schema } from '@types';

interface NewFormModalProps {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  closeModal: () => void;
  initialTemplate?: string;
}

const NewFormModal: React.FC<NewFormModalProps> = ({ schema, onSchemaChange, closeModal, initialTemplate }) => {
  const { t } = useTranslation();
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate || 'blank');

  const updateSchema = (updates: Partial<Schema>) => {
    try {
      const updatedSchema = { ...schema, ...updates };
      onSchemaChange(updatedSchema);

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('formCreated', 'New form created'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorCreatingForm', 'Error creating form'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
  };

  const handleCreateForm = () => {
    if (formName) {
      if (selectedTemplate === 'blank') {
        // Create blank form
        updateSchema({
          name: formName,
          description: formDescription,
        });
      } else {
        // Use selected template
        const template = formTemplates.find((t) => t.id === selectedTemplate);
        if (template) {
          const templateSchema = JSON.parse(JSON.stringify(template.schema)); // Deep clone
          updateSchema({
            ...templateSchema,
            name: formName,
            description: formDescription || template.description,
          });
        }
      }

      closeModal();
    }
  };

  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('createNewForm', 'Create a new form')} />
      <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <Stack gap={5}>
            <FormGroup legendText={''}>
              <Select
                id="formTemplate"
                labelText={t('selectTemplate', 'Select a template')}
                value={selectedTemplate}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                  const templateId = event.target.value;
                  setSelectedTemplate(templateId);

                  // Auto-fill form details when template is selected
                  if (templateId !== 'blank') {
                    const template = formTemplates.find((t) => t.id === templateId);
                    if (template && !formName) {
                      setFormName(template.name);
                      setFormDescription(template.description);
                    }
                  }
                }}
              >
                <SelectItem value="blank" text={t('blankForm', 'Blank Form')} />
                {formTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id} text={template.name} />
                ))}
              </Select>
            </FormGroup>

            {selectedTemplate !== 'blank' && (
              <Tile style={{ marginTop: '0.5rem', backgroundColor: '#f4f4f4' }}>
                <p style={{ fontSize: '0.875rem', color: '#525252' }}>
                  {formTemplates.find((t) => t.id === selectedTemplate)?.description}
                </p>
              </Tile>
            )}

            <FormGroup legendText={''}>
              <TextInput
                id="formName"
                labelText={t('formName', 'Form Name')}
                placeholder={t('namePlaceholder', 'What the form is called in the system')}
                value={formName}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFormName(event.target.value)}
              />
            </FormGroup>
            <FormGroup legendText={''}>
              <TextInput
                id="formDescription"
                labelText={t('formDescription', 'Form description')}
                placeholder={t(
                  'formDescriptionPlaceholder',
                  'A short description of the form e.g. A form for collecting COVID-19 symptoms',
                )}
                value={formDescription}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFormDescription(event.target.value)}
              />
            </FormGroup>
          </Stack>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={!formName} onClick={handleCreateForm}>
          <span>{t('createForm', 'Create Form')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default NewFormModal;
