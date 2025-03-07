import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@carbon/react';
import { useFormField } from '../../../../form-field-context';

const WorkspaceLauncher: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();

  return (
    <>
      <TextInput
        id="buttonLabel"
        labelText={t('buttonLabel', 'Button Label')}
        value={formField.questionOptions?.buttonLabel ?? ''}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const updatedQuestion = {
            ...formField,
            questionOptions: { ...formField.questionOptions, buttonLabel: event.target.value },
          };
          setFormField(updatedQuestion);
        }}
        placeholder={t('buttonLabelPlaceholder', 'Enter text to display on the button')}
        required
      />
      <TextInput
        id="workspaceName"
        labelText={t('workspaceName', 'Workspace Name')}
        value={formField.questionOptions?.workspaceName ?? ''}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const updatedQuestion = {
            ...formField,
            questionOptions: { ...formField.questionOptions, workspaceName: event.target.value },
          };
          setFormField(updatedQuestion);
        }}
        placeholder={t('workspaceNamePlaceholder', 'Enter the name of the workspace to launch')}
        required
      />
    </>
  );
};

export default WorkspaceLauncher;
