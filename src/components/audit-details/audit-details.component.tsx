import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import { StructuredListWrapper, StructuredListRow, StructuredListCell, StructuredListBody } from '@carbon/react';
import type { EncounterType } from '@types';

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
          <StructuredListCell>{form.uuid}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('version', 'Version')}</StructuredListCell>
          <StructuredListCell>{form.version}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('encounterType', 'Encounter Type')}</StructuredListCell>
          <StructuredListCell>{form.encounterType.uuid}</StructuredListCell>
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
            {form?.auditInfo?.dateChanged
              ? `${form?.auditInfo?.changedBy.display} on ${formatDatetime(parseDate(form?.auditInfo?.dateChanged))}`
              : t('uneditedFormMsg', 'This form has never been edited')}
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
