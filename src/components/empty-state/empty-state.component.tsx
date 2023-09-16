import React from 'react';
import { Layer, Link, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { navigate, useLayoutType } from '@openmrs/esm-framework';

import { EmptyDataIllustration } from './empty-data-illustration.component';
import styles from './empty-state.scss';

function EmptyState() {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  return (
    <Layer>
      <Tile className={styles.tile}>
        <div
          className={isTablet ? styles.tabletHeading : styles.desktopHeading}
        >
          <h4>{t('forms', 'Forms')}</h4>
        </div>
        <EmptyDataIllustration />
        <p className={styles.content}>
          {t('noFormsToDisplay', 'There are no forms to display.')}
        </p>
        <p className={styles.action}>
          <Link
            onClick={() =>
              navigate({
                to: `${window.spaBase}/form-builder/new`,
              })
            }
          >
            {t('createNewForm', 'Create a new form')}
          </Link>
        </p>
      </Tile>
    </Layer>
  );
}

export default EmptyState;
