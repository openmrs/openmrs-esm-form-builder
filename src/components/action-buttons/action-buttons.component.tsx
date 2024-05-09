import React, { useState } from 'react';
import { Button, ComposedModal, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import type { TFunction } from 'i18next';
import { useParams } from 'react-router-dom';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';

import type { Schema } from '../../types';
import { publishForm, unpublishForm } from '../../forms.resource';
import { useForm } from '../../hooks/useForm';
import SaveFormModal from '../modals/save-form-modal.component';
import { handleFormValidation } from '../../form-validator.resource';
import styles from './action-buttons.scss';

interface ActionButtonsProps {
  schema: Schema;
  t: TFunction;
  isValidating: boolean;
  setPublishedWithErrors: (status: boolean) => void;
  setValidationComplete: (validationStatus: boolean) => void;
  setValidationResponse: (errors: Array<unknown>) => void;
  onFormValidation: () => Promise<void>;
}

type Status =
  | 'idle'
  | 'publishing'
  | 'published'
  | 'unpublishing'
  | 'unpublished'
  | 'error'
  | 'validateBeforePublishing'
  | 'validated';

function ActionButtons({
  schema,
  t,
  isValidating,
  setPublishedWithErrors,
  onFormValidation,
  setValidationComplete,
  setValidationResponse,
}: ActionButtonsProps) {
  const { formUuid } = useParams<{ formUuid?: string }>();
  const { form, mutate } = useForm(formUuid);
  const [status, setStatus] = useState<Status>('idle');
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const { dataTypeToRenderingMap, enableFormValidation } = useConfig();

  const launchUnpublishModal = () => {
    setShowUnpublishModal(true);
  };

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

  async function handleUnpublish() {
    setStatus('unpublishing');

    try {
      await unpublishForm(form.uuid);

      showSnackbar({
        title: t('formUnpublished', 'Form unpublished'),
        kind: 'success',
        isLowContrast: true,
        subtitle: `${form.name} ` + t('formUnpublishedSuccessfully', 'form was unpublished successfully'),
      });

      setStatus('unpublished');
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
    setShowUnpublishModal(false);
  }

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
              disabled={status === 'validateBeforePublishing'}
            >
              {status === 'validateBeforePublishing' ? (
                <InlineLoading className={styles.spinner} description={t('validating', 'Validating') + '...'} />
              ) : (
                <span>{t('validateAndPublishForm', 'Validate and publish form')}</span>
              )}
            </Button>
          ) : (
            <Button kind="secondary" onClick={handlePublish} disabled={status === 'publishing'}>
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
        {showUnpublishModal ? (
          <ComposedModal open={true} onClose={() => setShowUnpublishModal(false)} preventCloseOnClickOutside>
            <ModalHeader
              title={t('unpublishConfirmation', 'Are you sure you want to unpublish this form?')}
            ></ModalHeader>
            <ModalBody>
              <p>
                {t(
                  'unpublishExplainerText',
                  'Unpublishing a form means you can no longer access it from your frontend. Unpublishing forms does not delete their associated schemas, it only affects whether or not you can access them in your frontend.',
                )}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button kind="secondary" onClick={() => setShowUnpublishModal(false)}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button
                disabled={status === 'unpublishing'}
                kind={status === 'unpublishing' ? 'secondary' : 'danger'}
                onClick={handleUnpublish}
              >
                {status === 'unpublishing' ? (
                  <InlineLoading className={styles.spinner} description={t('unpublishing', 'Unpublishing') + '...'} />
                ) : (
                  <span>{t('confirm', 'Confirm')}</span>
                )}
              </Button>
            </ModalFooter>
          </ComposedModal>
        ) : (
          false
        )}
      </>
    </div>
  );
}

export default ActionButtons;
