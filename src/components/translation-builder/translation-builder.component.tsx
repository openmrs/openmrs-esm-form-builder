import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  InlineLoading,
  InlineNotification,
  IconButton,
  Tabs,
  Tab,
  TabList,
  Dropdown,
  ComposedModal,
} from '@carbon/react';
import { Download, Edit, ArrowRight } from '@carbon/react/icons';
import { useLanguageOptions } from '@hooks/getLanguageOptionsFromSession';
import EditTranslationModal from './edit-translation.modal';
import { extractTranslatableStrings } from '../../utils/extractTranslatableStrings';

import styles from './translation-builder.module.scss';
interface TranslationBuilderProps {
  formSchema: any;
  onUpdateSchema: (updatedSchema: any) => void;
}

const TranslationBuilder: React.FC<TranslationBuilderProps> = ({ formSchema, onUpdateSchema }) => {
  const { t } = useTranslation();
  const { formId } = useParams<{ formId: string }>();
  const languageOptions = useLanguageOptions();
  const [selectedLanguageCode, setSelectedLanguageCode] = useState(() => languageOptions[0]?.code ?? 'en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const langCode = selectedLanguageCode;

  useEffect(() => {
    if (!formSchema) return;

    const schemaTranslations = formSchema.translations?.[langCode];

    if (schemaTranslations) {
      setTranslations(schemaTranslations);
    } else {
      const fallbackStrings = extractTranslatableStrings(formSchema);
      setTranslations(fallbackStrings);
    }
  }, [formSchema, langCode]);

  const handleUpdateValue = (key: string, newValue: string) => {
    const updatedTranslations = { ...translations, [key]: newValue };
    setTranslations(updatedTranslations);

    if (formSchema) {
      const updatedSchema = { ...formSchema };
      if (!updatedSchema.translations) {
        updatedSchema.translations = {};
      }
      updatedSchema.translations[langCode] = updatedTranslations;
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
            <ArrowRight className={styles.arrow} />
          </div>

          <Dropdown
            id="target-language"
            items={languageOptions}
            itemToString={(item) => item?.label ?? ''}
            label={t('selectLanguage', 'Select language')}
            titleText=""
            selectedItem={languageOptions.find((opt) => opt.code === selectedLanguageCode)}
            onChange={({ selectedItem }) => {
              if (selectedItem) setSelectedLanguageCode(selectedItem.code);
            }}
          />

          <IconButton kind="ghost" label={t('downloadTranslation', 'Download translation')} size="md">
            <Download />
          </IconButton>
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
                <div className={styles.translationKey}>{key}</div>
                <div className={styles.translatedKey}>{value}</div>
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
