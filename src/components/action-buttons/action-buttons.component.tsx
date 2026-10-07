import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { useParams } from 'react-router-dom';
import { showModal, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { handleFormValidation } from '@resources/form-validator.resource';
import { publishForm, unpublishForm } from '@resources/forms.resource';
import { useForm } from '@hooks/useForm';
import type { IMarker } from 'react-ace';
import type { TFunction } from 'i18next';
import type { ConfigObject } from '../../config-schema';
import type { Schema } from '@types';
import styles from './action-buttons.scss';

interface ActionButtonsProps {
  hasUnsavedChanges: boolean;
  isValidating: boolean;
  onFormValidation: () => Promise<void>;
  schema: Schema;
  schemaErrors: Array<MarkerProps>;
  setPublishedWithErrors: (status: boolean) => void;
  setValidationComplete: (validationStatus: boolean) => void;
  setValidationResponse: (errors: Array<unknown>) => void;
  t: TFunction;
}

interface MarkerProps extends IMarker {
  text: string;
}

type Status =
  | 'error'
  | 'idle'
  | 'published'
  | 'publishing'
  | 'unpublished'
  | 'unpublishing'
  | 'validateBeforePublishing'
  | 'validated';

function ActionButtons({
  hasUnsavedChanges,
  isValidating,
  onFormValidation,
  schema,
  schemaErrors,
  setPublishedWithErrors,
  setValidationComplete,
  setValidationResponse,
  t,
}: ActionButtonsProps) {
  const { formUuid } = useParams<{ formUuid?: string }>();
  const { form, mutate } = useForm(formUuid);
  const [status, setStatus] = useState<Status>('idle');
  const [isSavingForm, setIsSavingForm] = useState(false);
  const disposeSaveModal = useRef<ReturnType<typeof showModal>>();
  useEffect(() => () => disposeSaveModal.current?.(), []);
  const { dataTypeToRenderingMap, enableFormValidation } = useConfig<ConfigObject>();
  // Validation is asynchronous, so the publish step re-reads the latest dirty state rather than the one
  // captured when the click happened.
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  hasUnsavedChangesRef.current = hasUnsavedChanges;

  function warnAboutUnsavedChanges() {
    showSnackbar({
      title: t('unsavedChanges', 'Unsaved changes'),
      kind: 'warning',
      isLowContrast: true,
      subtitle: t('saveBeforePublishing', 'Save the form before publishing it'),
    });
  }

  async function handlePublish() {
    if (hasUnsavedChanges) {
      warnAboutUnsavedChanges();
      return;
    }

    try {
      setStatus('publishing');
      await publishForm(form.uuid);
      showSnackbar({
        title: t('formPublished', 'Form published'),
        kind: 'success',
        isLowContrast: true,
        subtitle: `${form.name} ` + t('formPublishedSuccessfully', 'form was published successfully'),
      });

      setStatus('published');
      await mutate();
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorPublishingForm', 'Error publishing form'),
          kind: 'error',
          subtitle: error?.message,
        });
        setStatus('error');
      }
    }
  }

  async function handleValidateAndPublish() {
    if (hasUnsavedChanges) {
      warnAboutUnsavedChanges();
      return;
    }

    setStatus('validateBeforePublishing');
    try {
      const [errorsArray] = await handleFormValidation(schema, dataTypeToRenderingMap, t);
      setValidationResponse(errorsArray);
      if (errorsArray.length) {
        setStatus('validated');
        setValidationComplete(true);
        setPublishedWithErrors(true);
        return;
      }
    } catch (error) {
      showSnackbar({
        title: t('errorValidatingForm', 'Error validating form'),
        kind: 'error',
        subtitle: error instanceof Error ? error.message : String(error),
      });
      setStatus('error');
      return;
    }
    if (hasUnsavedChangesRef.current) {
      setStatus('idle');
      warnAboutUnsavedChanges();
      return;
    }
    await handlePublish();
  }

  const handleUnpublish = useCallback(async () => {
    setStatus('unpublishing');

    try {
      await unpublishForm(form.uuid);
      setStatus('unpublished');

      showSnackbar({
        title: t('formUnpublished', 'Form unpublished'),
        kind: 'success',
        isLowContrast: true,
        subtitle: `${form.name} ` + t('formUnpublishedSuccessfully', 'form was unpublished successfully'),
      });

      await mutate();
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorUnpublishingForm', 'Error unpublishing form'),
          kind: 'error',
          subtitle: error?.message,
        });
        setStatus('error');
      }
    }
  }, [form?.name, form?.uuid, mutate, t]);

  const launchUnpublishModal = useCallback(() => {
    const dispose = showModal('unpublish-form-modal', {
      closeModal: () => dispose(),
      onUnpublishForm: handleUnpublish,
    });
  }, [handleUnpublish]);

  return (
    <div className={styles.actionButtons}>
      <Button
        disabled={!schema || isSavingForm}
        kind="primary"
        onClick={() => {
          disposeSaveModal.current?.();
          disposeSaveModal.current = showModal('save-form-modal', {
            form,
            schema,
            formUuid,
            closeModal: () => disposeSaveModal.current?.(),
            onSavingChange: setIsSavingForm,
          });
        }}
      >
        {t('saveForm', 'Save form')}
      </Button>

      <>
        {form && enableFormValidation && (
          <Button kind="tertiary" onClick={onFormValidation} disabled={!schema || isValidating}>
            {isValidating ? (
              <InlineLoading className={styles.spinner} description={t('validating', 'Validating') + '...'} />
            ) : (
              <span>{t('validateForm', 'Validate form')}</span>
            )}
          </Button>
        )}
        {form && !form.published ? (
          enableFormValidation ? (
            <Button
              kind="secondary"
              onClick={handleValidateAndPublish}
              disabled={status === 'validateBeforePublishing' || schemaErrors.length > 0}
            >
              {status === 'validateBeforePublishing' ? (
                <InlineLoading className={styles.spinner} description={t('validating', 'Validating') + '...'} />
              ) : (
                <span>{t('validateAndPublishForm', 'Validate and publish form')}</span>
              )}
            </Button>
          ) : (
            <Button
              kind="secondary"
              onClick={handlePublish}
              disabled={status === 'publishing' || schemaErrors.length > 0}
            >
              {status === 'publishing' && !form?.published ? (
                <InlineLoading className={styles.spinner} description={t('publishing', 'Publishing') + '...'} />
              ) : (
                <span>{t('publishForm', 'Publish form')}</span>
              )}
            </Button>
          )
        ) : null}

        {form && form.published ? (
          <Button kind="danger--tertiary" onClick={launchUnpublishModal} disabled={status === 'unpublishing'}>
            {t('unpublishForm', 'Unpublish form')}
          </Button>
        ) : null}
      </>
    </div>
  );
}

export default ActionButtons;
