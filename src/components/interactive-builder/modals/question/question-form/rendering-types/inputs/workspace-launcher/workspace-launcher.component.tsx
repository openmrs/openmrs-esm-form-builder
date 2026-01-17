import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@carbon/react';
import { useFormField } from '../../../../form-field-context';

const WorkspaceLauncher: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();

  const { buttonLabel, workspaceName } = useMemo(
    () => ({
      buttonLabel: formField.questionOptions?.buttonLabel ?? '',
      workspaceName: formField.questionOptions?.workspaceName ?? '',
    }),
    [formField.questionOptions?.buttonLabel, formField.questionOptions?.workspaceName],
  );

  const handleButtonLabelChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormField((prevFormField) => ({
        ...prevFormField,
        questionOptions: { ...prevFormField.questionOptions, buttonLabel: event.target.value },
      }));
    },
    [setFormField],
  );

  const handleWorkspaceNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormField((prevFormField) => ({
        ...prevFormField,
        questionOptions: { ...prevFormField.questionOptions, workspaceName: event.target.value },
      }));
    },
    [setFormField],
  );

  return (
    <>
      <TextInput
        id="buttonLabel"
        labelText={t('buttonLabel', 'Button Label')}
        value={buttonLabel}
        onChange={handleButtonLabelChange}
        placeholder={t('buttonLabelPlaceholder', 'Enter text to display on the button')}
        required
      />
      <TextInput
        id="workspaceName"
        labelText={t('workspaceName', 'Workspace Name')}
        value={workspaceName}
        onChange={handleWorkspaceNameChange}
        placeholder={t('workspaceNamePlaceholder', 'Enter the name of the workspace to launch')}
        required
      />
    </>
  );
};

export default React.memo(WorkspaceLauncher);
