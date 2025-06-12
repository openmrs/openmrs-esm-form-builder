import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  InlineLoading,
  InlineNotification,
  IconButton,
  Tabs,
  Tab,
  TabList,
  Dropdown,
  ComposedModal,
} from '@carbon/react';
import { TrashCan, Add, Download, Edit } from '@carbon/react/icons';
import { useParams } from 'react-router-dom';
import styles from './translation-builder.module.scss';
import { showSnackbar } from '@openmrs/esm-framework';
import EditTranslationModal from './edit-translation.modal';

interface TranslationBuilderProps {
  formSchema: any;
  onUpdateSchema: (updatedSchema: any) => void;
}

function extractTranslatableStrings(form: any): Record<string, string> {
  const result: Record<string, string> = {};
  if (form.pages) {
    form.pages.forEach((page: any) => {
      if (page.label) result[page.label] = page.label;
      if (page.sections) {
        page.sections.forEach((section: any) => {
          if (section.label) result[section.label] = section.label;
          if (section.questions) {
            section.questions.forEach((question: any) => {
              if (question.label) result[question.label] = question.label;
              if (question.questions) {
                question.questions.forEach((subQuestion: any) => {
                  if (subQuestion.label) result[subQuestion.label] = subQuestion.label;
                  subQuestion.questionOptions?.answers?.forEach((answer: any) => {
                    if (answer.label) result[answer.label] = answer.label;
                  });
                });
              }
              question.questionOptions?.answers?.forEach((answer: any) => {
                if (answer.label) result[answer.label] = answer.label;
              });
            });
          }
        });
      }
    });
  }
  return result;
}

const TranslationBuilder: React.FC<TranslationBuilderProps> = ({ formSchema, onUpdateSchema }) => {
  const { t } = useTranslation();
  const { formId } = useParams<{ formId: string }>();

  const languageOptions = ['French (fr)', 'Spanish (es)', 'German (de)'];
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const getLangCode = useCallback(() => {
    return selectedLanguage.match(/\((.*?)\)/)?.[1] ?? selectedLanguage;
  }, [selectedLanguage]);

  useEffect(() => {
    if (!formSchema) return;

    const langCode = getLangCode();
    const schemaTranslations = formSchema.translations?.[langCode];

    if (schemaTranslations) {
      setTranslations(schemaTranslations);
    } else {
      const fallbackStrings = extractTranslatableStrings(formSchema);
      setTranslations(fallbackStrings);
    }
  }, [formSchema, getLangCode]);

  const handleUpdateValue = (key: string, newValue: string) => {
    const updatedTranslations = { ...translations, [key]: newValue };
    setTranslations(updatedTranslations);

    if (formSchema) {
      const updatedSchema = { ...formSchema };
      if (!updatedSchema.translations) {
        updatedSchema.translations = {};
      }
      updatedSchema.translations[getLangCode()] = updatedTranslations;
      onUpdateSchema(updatedSchema);
    }
  };

  const openEditModal = (key: string) => {
    setEditingKey(key);
    setModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingKey(null);
    setModalOpen(false);
  };

  const handleSaveEdit = (newValue: string) => {
    if (editingKey) {
      const updated = { ...translations, [editingKey]: newValue };
      setTranslations(updated);
      handleUpdateValue(editingKey, newValue);
    }
    closeEditModal();
  };
  return (
    <div className={styles.translationBuilderContainer}>
      <div className={styles.translationBuilderHeader}>
        <Tabs>
          <TabList aria-label="Form previews">
            <Tab>{t('all', 'All')}</Tab>
            <Tab>{t('translated', 'Translated')}</Tab>
            <Tab>{t('untranslated', 'Untranslated')}</Tab>
          </TabList>
        </Tabs>

        <div className={styles.languageTools}>
          <div className={styles.languagePath}>
            <span className={styles.language}>English (en)</span>
            <span className={styles.arrow}>→</span>
          </div>

          <Dropdown
            id="target-language"
            items={languageOptions}
            itemToString={(item) => (item ? item : '')}
            label="Select language"
            titleText=""
            selectedItem={selectedLanguage}
            onChange={({ selectedItem }) => setSelectedLanguage(selectedItem)}
          />

          <Button hasIconOnly kind="ghost" renderIcon={Download} iconDescription="Download" tooltipAlignment="end" />
        </div>
      </div>

      {loading ? (
        <InlineLoading description={t('loadingTranslations', 'Loading translations...')} />
      ) : error ? (
        <InlineNotification kind="error" title={t('error', 'Error')} subtitle={error} lowContrast />
      ) : (
        <div className={styles.translationEditor}>
          {Object.entries(translations).length > 0 ? (
            Object.entries(translations).map(([key, value]) => (
              <div key={key} className={styles.translationRow}>
                <strong className={styles.translationKey}>{key}</strong>
                <strong className={styles.translatedKey}>{value}</strong>
                <div className={styles.inlineControls}>
                  <IconButton
                    kind="ghost"
                    label={t('editString', 'Edit string')}
                    onClick={() => openEditModal(key)}
                    size="md"
                    className={styles.deleteButton}
                  >
                    <Edit />
                  </IconButton>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noTranslations}>{t('noTranslations', 'No translatable strings found.')}</p>
          )}
        </div>
      )}

      {isModalOpen && editingKey && (
        <ComposedModal open onClose={closeEditModal} size="sm">
          <EditTranslationModal
            closeModal={closeEditModal}
            originalKey={editingKey}
            initialValue={translations[editingKey]}
            onSave={handleSaveEdit}
          />
        </ComposedModal>
      )}
    </div>
  );
};

export default TranslationBuilder;
