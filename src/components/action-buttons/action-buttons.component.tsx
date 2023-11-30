import React, { useState } from 'react';
import { Button, ComposedModal, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import type { TFunction } from 'i18next';
import { useParams } from 'react-router-dom';
import { showSnackbar } from '@openmrs/esm-framework';

import type { Schema } from '../../types';
import { publishForm, unpublishForm } from '../../forms.resource';
import { useForm } from '../../hooks/useForm';
import SaveFormModal from '../modals/save-form-modal.component';
import styles from './action-buttons.scss';

interface ActionButtonsProps {
  schema: Schema;
  t: TFunction;
}

type Status = 'idle' | 'publishing' | 'published' | 'unpublishing' | 'unpublished' | 'error';

function ActionButtons({ schema, t }: ActionButtonsProps) {
  const { formUuid } = useParams<{ formUuid?: string }>();
  const { form, mutate } = useForm(formUuid);
  const [status, setStatus] = useState<Status>('idle');
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);

  const launchUnpublishModal = () => {
    setShowUnpublishModal(true);
  };

  async function handlePublish() {
    setStatus('publishing');
    try {
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
        {form && !form.published ? (
          <Button kind="secondary" onClick={handlePublish} disabled={status === 'publishing'}>
            {status === 'publishing' && !form?.published ? (
              <InlineLoading className={styles.spinner} description={t('publishing', 'Publishing') + '...'} />
            ) : (
              <span>{t('publishForm', 'Publish form')}</span>
            )}
          </Button>
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
