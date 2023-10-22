import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import { StructuredListWrapper, StructuredListRow, StructuredListCell, StructuredListBody } from '@carbon/react';
import type { EncounterType } from '../../types';

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
  console.log('form: ', form);

  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [encounterType, setEncounterType] = useState('');
  const [name, setName] = useState('');
  const [published, setPublished] = useState(false);
  const [retired, setRetired] = useState(false);
  const [version, setVersion] = useState('');

  useEffect(() => {
    if (form) {
      setName(form.name);
      setDescription(form.description);
      setEncounterType(`${form.encounterType.display} - ${form.encounterType.uuid}`);
      setVersion(form.version);
      setPublished(form.published);
      setRetired(form.retired);
    }
  }, [form]);

  return (
    <StructuredListWrapper isCondensed selection={false}>
      <StructuredListBody>
        <StructuredListRow>
          <StructuredListCell>
            <b>{t('formName', 'Form Name')}</b>
          </StructuredListCell>
          <StructuredListCell>{name}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('description', 'Description')}</StructuredListCell>
          <StructuredListCell>{description}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('formUuid', 'Form UUID')}</StructuredListCell>
          <StructuredListCell>{form?.uuid}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('version', 'Version')}</StructuredListCell>
          <StructuredListCell>{version}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('encounterType', 'Encounter Type')}</StructuredListCell>
          <StructuredListCell>{encounterType}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('createdBy', 'Created By')}</StructuredListCell>
          <StructuredListCell>
            {`${form?.auditInfo?.creator?.display} on ${formatDatetime(parseDate(form?.auditInfo?.dateCreated))}`}
          </StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('editedBy', 'Edited By')}</StructuredListCell>
          <StructuredListCell>
            {form?.auditInfo?.changedBy?.display
              ? `${form?.auditInfo?.changedBy?.display} on ${formatDatetime(parseDate(form?.auditInfo?.dateChanged))}`
              : t('uneditedFormMsg', 'This form has never been edited')}
          </StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('published', 'Published')}</StructuredListCell>
          <StructuredListCell>{published ? t('yes', 'Yes') : t('no', 'No')}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('retired', 'Retired')}</StructuredListCell>
          <StructuredListCell>{retired ? t('yes', 'Yes') : t('no', 'No')}</StructuredListCell>
        </StructuredListRow>
      </StructuredListBody>
    </StructuredListWrapper>
  );
};

export default AuditDetails;
