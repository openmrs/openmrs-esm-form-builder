import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import ValueEditor from './value-editor.component';
import styles from './editable-value.scss';

interface EditableValueProps {
  elementType?: 'schema' | 'page' | 'section';
  id: string;
  value: string;
  onSave: (value: string) => void;
}

const EditableValue: React.FC<EditableValueProps> = ({ elementType, id, value, onSave }) => {
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
      <h1 className={styles[`${elementType}` + 'Label']}>{value}</h1>
      <Button
        kind="ghost"
        size="sm"
        enterDelayMs={300}
        iconDescription={t('editButton', 'Edit {{elementType}}', {
          elementType: elementType,
        })}
        onClick={() => setEditing(true)}
        renderIcon={(props) => <Edit size={16} {...props} />}
        hasIconOnly
      />
    </>
  );
};

export default EditableValue;
