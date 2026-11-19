import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, Switch, TextArea } from '@carbon/react';
import ReactMarkdown from 'react-markdown';
import { useFormField } from '../../../../form-field-context';
import styles from './markdown.scss';

type EditorTab = 'write' | 'preview';

// Schemas can store markdown as an array of lines, which the form engine renders as separate paragraphs.
// The editor shows them the same way and writes a single string back once the content is edited.
const toMarkdownString = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join('\n\n');
  }
  return typeof value === 'string' ? value : '';
};

const MarkdownQuestion: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();
  const [selectedTab, setSelectedTab] = useState<EditorTab>('write');
  const markdown = toMarkdownString(formField.value);

  return (
    <div className={styles.container}>
      <ContentSwitcher
        size="sm"
        selectedIndex={selectedTab === 'write' ? 0 : 1}
        onChange={({ name }) => setSelectedTab(name as EditorTab)}
      >
        <Switch name="write" text={t('write', 'Write')} />
        <Switch name="preview" text={t('preview', 'Preview')} />
      </ContentSwitcher>
      {selectedTab === 'write' ? (
        <TextArea
          id="markdownContent"
          labelText={t('markdownContent', 'Markdown content')}
          rows={6}
          value={markdown}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormField({ ...formField, value: event.target.value })
          }
        />
      ) : (
        <div className={styles.preview}>
          {markdown ? <ReactMarkdown>{markdown}</ReactMarkdown> : t('nothingToPreview', 'Nothing to preview')}
        </div>
      )}
    </div>
  );
};

export default MarkdownQuestion;
