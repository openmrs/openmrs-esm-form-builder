import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton,
  StructuredListBody,
  StructuredListCell,
  StructuredListRow,
  StructuredListWrapper,
} from '@carbon/react';
import { Copy } from '@carbon/react/icons';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import type { EncounterType } from '@types';

function CopyableValue({ value }: { value: string }) {
  const { t } = useTranslation();
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
  }, [value]);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      <span>{value}</span>
      <IconButton kind="ghost" size="sm" label={t('copyToClipboard', 'Copy to clipboard')} onClick={handleCopy}>
        <Copy />
      </IconButton>
    </span>
  );
}

interface AuditDetailsProps {
  form: FormGroupData;
}

export interface AuditInfo {
  creator: Creator;
  dateCreated: string;
  changedBy: ChangedBy;
  dateChanged: string;
}

interface Creator {
  display: string;
}

interface ChangedBy {
  uuid: string;
  display: string;
}

interface FormGroupData {
  auditInfo: AuditInfo;
  name: string;
  uuid: string;
  version: string;
  encounterType: EncounterType;
  description: string;
  display?: string;
  published?: boolean;
  retired?: boolean;
}

const AuditDetails: React.FC<AuditDetailsProps> = ({ form }) => {
  const { t } = useTranslation();

  return (
    <StructuredListWrapper isCondensed selection={false}>
      <StructuredListBody>
        <StructuredListRow>
          <StructuredListCell>
            <b>{t('formName', 'Form Name')}</b>
          </StructuredListCell>
          <StructuredListCell>{form.name}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('description', 'Description')}</StructuredListCell>
          <StructuredListCell>{form.description}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('formUuid', 'Form UUID')}</StructuredListCell>
          <StructuredListCell>
            <CopyableValue value={form.uuid} />
          </StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('version', 'Version')}</StructuredListCell>
          <StructuredListCell>{form.version}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('encounterType', 'Encounter Type')}</StructuredListCell>
          <StructuredListCell>
            <CopyableValue value={form.encounterType.uuid} />
          </StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('createdBy', 'Created By')}</StructuredListCell>
          <StructuredListCell>
            {`${form?.auditInfo?.creator?.display ?? t('unknownUser', 'Unknown')} on ${formatDatetime(
              parseDate(form?.auditInfo?.dateCreated),
            )}`}
          </StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('lastEditedBy', 'Last Edited By')}</StructuredListCell>
          <StructuredListCell>
            {form?.auditInfo?.dateChanged ? (
              `${form?.auditInfo?.changedBy.display} on ${formatDatetime(parseDate(form?.auditInfo?.dateChanged))}`
            ) : (
              <span
                aria-label={t('uneditedFormMsg', 'This form has never been edited')}
                style={{ color: 'var(--cds-text-placeholder)' }}
              >
                —
              </span>
            )}
          </StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('published', 'Published')}</StructuredListCell>
          <StructuredListCell>{form.published ? t('yes', 'Yes') : t('no', 'No')}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('retired', 'Retired')}</StructuredListCell>
          <StructuredListCell>{form.retired ? t('yes', 'Yes') : t('no', 'No')}</StructuredListCell>
        </StructuredListRow>
      </StructuredListBody>
    </StructuredListWrapper>
  );
};

export default AuditDetails;
