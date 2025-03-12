import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import ValueEditor from '../interactive-builder/value-editor/value-editor.component';
import styles from './TranslationEditableValue.scss';

interface EditableValueProps {
  elementType?: 'translation';
  id: string;
  value: string;
  onSave: (value: string) => void;
}

const TranslationEditableValue: React.FC<EditableValueProps> = ({ elementType, id, value, onSave }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);

  const closeEditor = () => {
    setEditing(false);
  };

  if (editing) {
    return (
      <ValueEditor
        handleCancel={closeEditor}
        handleSave={(val) => {
          onSave(val);
          closeEditor();
        }}
        id={id}
        value={value}
      />
    );
  }

  return (
    <>
      <span className={styles[`${elementType}` + 'Label']}>{value}</span>
      <IconButton
        enterDelayMs={300}
        kind="ghost"
        label={t('editButton', 'Edit {{elementType}}', {
          elementType: elementType,
        })}
        onClick={() => setEditing(true)}
        size="md"
      >
        <Edit />
      </IconButton>
    </>
  );
};

export default TranslationEditableValue;
