import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextInput , Checkbox } from '@carbon/react';
import { Close, Save } from '@carbon/react/icons';
import styles from './value-editor.scss';

interface ValueEditorProps {
  id: string;
  handleCancel: () => void;
  handleSave: (value: string) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}

const ValueEditor: React.FC<ValueEditorProps> = ({ id, handleCancel, handleSave, value }) => {
  const { t } = useTranslation();
  const [tmpValue, setTmpValue] = useState(value);

  return (
    <>
      <TextInput
        id={id}
        labelText=""
        value={tmpValue}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTmpValue(event.target.value)}
      />
      <div className={styles.actionButtons}>
        <Button
          size="md"
          renderIcon={(props) => <Save {...props} size={16} />}
          kind="primary"
          onClick={() => handleSave(tmpValue)}
        >
          {t('saveButtonText', 'Save')}
        </Button>
        <Button
          size="md"
          renderIcon={(props) => <Close {...props} size={16} />}
          kind="secondary"
          onClick={handleCancel}
        >
          {t('cancelButtonText', 'Cancel')}
        </Button>
        <br></br>
        <Checkbox id="isExpanded" labelText={t('expandedSection', 'Expanded section')} />
      </div>
    </>
  );
};

export default ValueEditor;
