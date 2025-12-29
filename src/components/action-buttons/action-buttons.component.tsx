import React, { useCallback, useState } from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { useParams } from 'react-router-dom';
import { showModal, showSnackbar, useConfig } from '@openmrs/esm-framework';
import SaveFormModal from '../interactive-builder/modals/save-form/save-form.modal';
import { handleFormValidation } from '@resources/form-validator.resource';
import { publishForm, unpublishForm } from '@resources/forms.resource';
import { useForm } from '@hooks/useForm';
import type { IMarker } from 'react-ace';
import type { TFunction } from 'i18next';
import type { ConfigObject } from '../../config-schema';
import type { Schema } from '@types';
import styles from './action-buttons.scss';

interface ActionButtonsProps {
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
  const { dataTypeToRenderingMap, enableFormValidation } = useConfig<ConfigObject>();

  async function handlePublish() {
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
    setStatus('validateBeforePublishing');
    const [errorsArray] = await handleFormValidation(schema, dataTypeToRenderingMap);
    setValidationResponse(errorsArray);
    if (errorsArray.length) {
      setStatus('validated');
      setValidationComplete(true);
      setPublishedWithErrors(true);
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
      <SaveFormModal form={form} schema={schema} />

      <>
        {form && enableFormValidation && (
          <Button kind="tertiary" onClick={onFormValidation} disabled={isValidating}>
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
          <Button kind="danger" onClick={launchUnpublishModal} disabled={status === 'unpublishing'}>
            {t('unpublishForm', 'Unpublish form')}
          </Button>
        ) : null}
      </>
    </div>
  );
}

export default ActionButtons;
