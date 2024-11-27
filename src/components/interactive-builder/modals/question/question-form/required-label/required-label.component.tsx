import React from 'react';
import type { TFunction } from 'react-i18next';
import styles from './required-label.scss';

interface RequiredLabelProps {
  isRequired: boolean;
  text: string;
  t: TFunction;
}

const RequiredLabel: React.FC<RequiredLabelProps> = ({ isRequired, text, t }) => {
  return (
    <>
      <span>{text}</span>
      {isRequired && (
        <span title={t('required', 'Required')} className={styles.required}>
          *
        </span>
      )}
    </>
  );
};

export default RequiredLabel;
