import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, ClickableTile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';

const FormBuilderCardLink: React.FC = () => {
  const { t } = useTranslation();
  const header = t('manageForms', 'Manage Forms');
  return (
    <Layer>
      <ClickableTile href={`${window.spaBase}/form-builder`}>
        <div>
          <div className="heading">{header}</div>
          <div className="content">{t('formBuilder', 'Form builder')}</div>
        </div>
        <div className="iconWrapper">
          <ArrowRight size={16} />
        </div>
      </ClickableTile>
    </Layer>
  );
};

export default FormBuilderCardLink;
