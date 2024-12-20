import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactMde from 'react-mde';
import ReactMarkdown from 'react-markdown';
import type { ComponentProps } from '@types';
import styles from './markdown.scss';

const MarkdownQuestion: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>('write');

  const handleEditorChange = (newValue: string) => {
    const updatedFormField = { ...formField, value: newValue };
    setFormField(updatedFormField);
  };

  const handleTabChange = () => {
    setSelectedTab((prevTab) => (prevTab === 'write' ? 'preview' : 'write'));
  };

  return (
    <div className={styles.container}>
      <ReactMde
        value={formField.value}
        onChange={handleEditorChange}
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        toolbarCommands={[['bold', 'italic']]}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(<ReactMarkdown children={Array.isArray(markdown) ? markdown.join('\n') : markdown} />)
        }
        childProps={{
          writeButton: {
            tabIndex: -1,
          },
        }}
        loadingPreview={t('loadingPreview', 'Loading preview...')}
      />
    </div>
  );
};

export default MarkdownQuestion;
