import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
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
} from '@carbon/react';
import { navigate, showSnackbar } from '@openmrs/esm-framework';
import { useEncounterTypes } from '@hooks/useEncounterTypes';
import { useForm } from '@hooks/useForm';
import {
  deleteClobdata,
  deleteForm,
  deleteResource,
  getResourceUuid,
  saveNewForm,
  updateForm,
  uploadSchema,
} from '@resources/forms.resource';
import type { EncounterType, Resource, Schema } from '@types';
import styles from './save-form.scss';

interface FormGroupData {
  name: string;
  uuid: string;
  version: string;
  encounterType: EncounterType;
  description: string;
  resources: Array<Resource>;
}

interface SaveFormModalProps {
  form: FormGroupData;
  schema: Schema;
}

const SaveFormModal: React.FC<SaveFormModalProps> = ({ form, schema }) => {
  const { t } = useTranslation();
  const { encounterTypes } = useEncounterTypes();
  const { formUuid } = useParams<{ formUuid: string }>();
  const { mutate } = useForm(formUuid);
  const isSavingNewForm = !formUuid;
  const [description, setDescription] = useState('');
  const [encounterType, setEncounterType] = useState('');
  const [isInvalidVersion, setIsInvalidVersion] = useState(false);
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [name, setName] = useState('');
  const [openConfirmSaveModal, setOpenConfirmSaveModal] = useState(false);
  const [openSaveFormModal, setOpenSaveFormModal] = useState(false);
  const [saveState, setSaveState] = useState('');
  const [version, setVersion] = useState('');

  const clearDraftFormSchema = useCallback(() => localStorage.removeItem('formJSON'), []);

  useEffect(() => {
    if (schema) {
      setName(schema.name);
      setDescription(schema.description);
      setEncounterType(schema.encounterType);
      setVersion(schema.version);
    }
  }, [schema]);

  const checkVersionValidity = (version: string) => {
    if (!version) return setIsInvalidVersion(false);

    setIsInvalidVersion(!/^[0-9]/.test(version));
  };

  const openModal = useCallback((option: string) => {
    if (option === 'newVersion') {
      setSaveState('newVersion');
      setOpenConfirmSaveModal(false);
      setOpenSaveFormModal(true);
    } else if (option === 'new') {
      setSaveState('newVersion');
      setOpenSaveFormModal(true);
    } else if (option === 'update') {
      setSaveState('update');
      setOpenConfirmSaveModal(false);
      setOpenSaveFormModal(true);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingForm(true);

    const target = event.target as EventTarget & {
      name: { value: string };
      version: { value: string };
      encounterType: { value: string };
      description: { value: string };
    };

    if (saveState === 'new' || saveState === 'newVersion') {
      const name = target.name.value,
        version = target.version.value,
        encounterType = target.encounterType.value,
        description = target.description.value;

      try {
        const newForm = await saveNewForm(name, version, false, description, encounterType);

        const updatedSchema = {
          ...schema,
          name: name,
          version: version,
          description: description,
          encounterType: encounterType,
          uuid: newForm.uuid,
        };

        let newValueReference: string | undefined;
        try {
          newValueReference = (await uploadSchema(updatedSchema)).toString();
          await getResourceUuid(newForm.uuid, newValueReference);
        } catch (error) {
          // Clean up the orphaned clobdata and form since schema upload or linking failed
          if (newValueReference) {
            await deleteClobdata(newValueReference).catch(() => {});
          }
          await deleteForm(newForm.uuid).catch(() => {});
          throw error;
        }

        showSnackbar({
          title: t('formCreated', 'New form created'),
          kind: 'success',
          isLowContrast: true,
          subtitle:
            name + ' ' + t('saveSuccessMessage', 'was created successfully. It is now visible on the Forms dashboard.'),
        });
        clearDraftFormSchema();
        setOpenSaveFormModal(false);
        await mutate();

        navigate({
          to: `${window.spaBase}/form-builder/edit/${newForm.uuid}`,
        });

        setIsSavingForm(false);
      } catch (error) {
        if (error instanceof Error) {
          showSnackbar({
            title: t('errorCreatingForm', 'Error creating form'),
            kind: 'error',
            subtitle: error?.message,
          });
        }
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

        const oldResource = form?.resources?.length
          ? form.resources.find(({ name }) => name === 'JSON schema')
          : undefined;

        // Upload the new clobdata first (doesn't affect the live form yet)
        const newValueReference = (await uploadSchema(updatedSchema)).toString();

        // Swap: remove old resource link, then link the new clobdata.
        // If the swap fails, clean up the newly uploaded clobdata.
        try {
          if (oldResource) {
            await deleteResource(form.uuid, oldResource.uuid);
          }
          await getResourceUuid(form.uuid, newValueReference);
        } catch (error) {
          await deleteClobdata(newValueReference).catch(() => {});
          throw error;
        }

        // Clean up old clobdata. If this fails, the form still works
        // (just an orphaned clobdata row in the database).
        if (oldResource) {
          await deleteClobdata(oldResource.valueReference).catch(() => {});
        }

        showSnackbar({
          title: t('success', 'Success!'),
          kind: 'success',
          isLowContrast: true,
          subtitle: form?.name + ' ' + t('saveSuccess', 'was updated successfully'),
        });
        setOpenSaveFormModal(false);
        await mutate();
        setIsSavingForm(false);
      } catch (error) {
        if (error instanceof Error) {
          showSnackbar({
            title: t('errorUpdatingForm', 'Error updating form'),
            kind: 'error',
            subtitle: error?.message,
          });
        }

        setIsSavingForm(false);
      }
    }
  };

  return (
    <>
      {!isSavingNewForm ? (
        <ComposedModal
          open={openConfirmSaveModal}
          onClose={() => setOpenConfirmSaveModal(false)}
          preventCloseOnClickOutside
        >
          <ModalHeader title={t('saveConfirmation', 'Save or Update form')} />
          <ModalBody>
            <p>
              {t(
                'saveAsModal',
                "A version of the form you're working on already exists on the server. Do you want to update the form or to save it as a new version?",
              )}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button kind={'tertiary'} onClick={() => openModal('update')}>
              {t('updateExistingForm', 'Update existing version')}
            </Button>
            <Button kind={'primary'} onClick={() => openModal('newVersion')}>
              {t('saveAsNewForm', 'Save as a new form')}
            </Button>
            <Button kind={'secondary'} onClick={() => setOpenConfirmSaveModal(false)}>
              {t('close', 'Close')}
            </Button>
          </ModalFooter>
        </ComposedModal>
      ) : null}

      <ComposedModal open={openSaveFormModal} onClose={() => setOpenSaveFormModal(false)} preventCloseOnClickOutside>
        <ModalHeader title={t('saveFormToServer', 'Save form to server')} />
        <Form onSubmit={handleSubmit} className={styles.saveFormBody}>
          <ModalBody>
            <p>
              {t(
                'saveExplainerText',
                'Clicking the Save button saves your form schema to the database. To see your form in your frontend, you first need to publish it. Click the Publish button to publish your form.',
              )}
            </p>
            <FormGroup legendText={''}>
              <Stack gap={5}>
                <TextInput
                  id="name"
                  labelText={t('formName', 'Form Name')}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
                  placeholder={t('formNamePlaceholder', 'e.g. OHRI Express Care Patient Encounter Form')}
                  required
                  value={name}
                />
                {saveState === 'update' ? (
                  <TextInput
                    id="uuid"
                    labelText={t('autogeneratedUuid', 'UUID (auto-generated)')}
                    disabled
                    value={form?.uuid}
                  />
                ) : null}
                <TextInput
                  id="version"
                  labelText={t('version', 'Version')}
                  placeholder={t('versionPlaceholder', 'e.g. 1.0')}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    checkVersionValidity(event.target.value);

                    if (!isInvalidVersion) {
                      setVersion(event.target.value);
                    }
                  }}
                  invalid={isInvalidVersion}
                  invalidText={t('invalidVersionWarning', 'Version can only start with with a number')}
                  required
                  value={version}
                />
                <Select
                  id="encounterType"
                  labelText={t('encounterType', 'Encounter Type')}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setEncounterType(event.target.value)}
                  required
                  value={encounterType}
                >
                  {!encounterType ? (
                    <SelectItem
                      text={t('chooseEncounterType', 'Choose an encounter type to link your form to')}
                      value=""
                    />
                  ) : null}
                  {encounterTypes?.length > 0 &&
                    encounterTypes.map((encounterType) => (
                      <SelectItem key={encounterType.uuid} value={encounterType.uuid} text={encounterType.name}>
                        {encounterType.name}
                      </SelectItem>
                    ))}
                </Select>
                <TextArea
                  labelText={t('description', 'Description')}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value)}
                  id="description"
                  placeholder={t(
                    'descriptionPlaceholderText',
                    'e.g. A form used to collect encounter data for clients in the Express Care program.',
                  )}
                  required
                  value={description}
                />
              </Stack>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button kind={'secondary'} onClick={() => setOpenSaveFormModal(false)}>
              {t('close', 'Close')}
            </Button>
            <Button
              disabled={isSavingForm || isInvalidVersion}
              className={styles.spinner}
              type={'submit'}
              kind={'primary'}
            >
              {isSavingForm ? (
                <InlineLoading description={t('saving', 'Saving') + '...'} />
              ) : (
                <span>{t('save', 'Save')}</span>
              )}
            </Button>
          </ModalFooter>
        </Form>
      </ComposedModal>

      <Button
        disabled={!schema}
        kind="primary"
        onClick={() => (isSavingNewForm ? openModal('new') : setOpenConfirmSaveModal(true))}
      >
        {t('saveForm', 'Save form')}
      </Button>
    </>
  );
};

export default SaveFormModal;
