import React from 'react';
import { Layer, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './error-state.scss';

interface ErrorStateProps {
  error: Error;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  return (
    <Layer>
      <Tile className={styles.tile}>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{t('forms', 'Forms')}</h4>
        </div>
        <p className={styles.errorMessage}>
          {t('error', 'Error')}: {error?.message}
        </p>
        <p className={styles.errorCopy}>
          {t(
            'errorCopy',
            'Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above.',
          )}
        </p>
      </Tile>
    </Layer>
  );
};

export default ErrorState;
