import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, InlineNotification, IconButton, Tabs, Tab, TabList, Dropdown } from '@carbon/react';
import { Download, Edit, ArrowRight, Upload } from '@carbon/react/icons';
import { useParams } from 'react-router-dom';
import { showModal, showSnackbar } from '@openmrs/esm-framework';
import { useLanguageOptions } from '@hooks/getLanguageOptionsFromSession';
import { uploadBackendTranslations } from '@hooks/uploadBackendTranslations';
import { fetchBackendTranslations } from '@hooks/useBackendTranslations';

import { extractTranslatableStrings } from '../../utils/translationSchemaUtils';
import styles from './translation-builder.module.scss';

interface TranslationBuilderProps {
  formSchema: any;
  onUpdateSchema: (updatedSchema: any) => void;
}

const TranslationBuilder: React.FC<TranslationBuilderProps> = ({ formSchema, onUpdateSchema }) => {
  const { t } = useTranslation();
  const languageOptions = useLanguageOptions();
  const [localTranslations, setLocalTranslations] = useState<Record<string, Record<string, string>>>({});
  const [selectedLanguageCode, setSelectedLanguageCode] = useState(() => languageOptions[0]?.code ?? 'en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [translationsUploading, setTranslationsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'translated' | 'untranslated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const { formUuid } = useParams<{ formUuid?: string }>();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const langCode = selectedLanguageCode;

  const fallbackStrings = useMemo(() => {
    return formSchema ? extractTranslatableStrings(formSchema) : {};
  }, [formSchema]);

  useEffect(() => {
    if (!formSchema) return;

    const fallback = fallbackStrings;
    const current = translations;

    const updated: Record<string, string> = {};
    Object.keys(fallback).forEach((key) => {
      updated[key] = current[key] ?? fallback[key] ?? '';
    });

    const changed =
      Object.keys(updated).length !== Object.keys(current).length ||
      Object.keys(updated).some((k) => updated[k] !== current[k]);

    if (changed) {
      setTranslations(updated);
      setLocalTranslations((prev) => ({
        ...prev,
        [selectedLanguageCode]: updated,
      }));

      // Removed the onUpdateSchema call from here
      // The schema should only be updated on user-initiated actions
    }
  }, [formSchema, fallbackStrings, selectedLanguageCode, translations]);

  const handleUpdateValue = useCallback(
    (key: string, newValue: string) => {
      const updatedTranslations = { ...translations, [key]: newValue };
      setTranslations(updatedTranslations);
      setLocalTranslations((prev) => ({
        ...prev,
        [langCode]: updatedTranslations,
      }));

      if (formSchema) {
        const updatedSchema = { ...formSchema };
        if (!updatedSchema.translations) {
          updatedSchema.translations = {};
        }
        updatedSchema.translations[langCode] = updatedTranslations;
        onUpdateSchema(updatedSchema);
      }
    },
    [formSchema, langCode, onUpdateSchema, translations],
  );

  const handleEditClick = useCallback(
    (editingKey: string) => {
      const dispose = showModal('edit-translation-modal', {
        onClose: () => dispose(),
        originalKey: editingKey,
        initialValue: translations[editingKey],
        onSave: (newValue: string) => {
          const updated = { ...translations, [editingKey]: newValue };
          setTranslations(updated);
          handleUpdateValue(editingKey, newValue);
          dispose();
        },
      });
    },
    [translations, handleUpdateValue],
  );

  const downloadableTranslationResource = useMemo(() => {
    if (!formSchema) return null;
    const schemaTranslations = formSchema.translations?.[langCode];
    const translationsToExport = langCode === 'en' ? fallbackStrings : schemaTranslations;

    if (!translationsToExport) return null;

    return new Blob(
      [
        JSON.stringify(
          {
            uuid: formSchema.uuid || '',
            form: formSchema.name,
            description: `${langCode.toUpperCase()} Translations for '${formSchema.name}'`,
            language: langCode,
            translations: translationsToExport,
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
  }, [formSchema, langCode, fallbackStrings]);

  const isTranslated = useCallback(
    (key: string, value: string | undefined | null): boolean => {
      const fallback = fallbackStrings[key] ?? '';
      return value != null && value.trim() !== '' && value.trim() !== fallback.trim();
    },
    [fallbackStrings],
  );

  function mergeTranslations(
    local: Record<string, string> = {},
    backend: Record<string, string> = {},
    fallback: Record<string, string> = {},
  ): Record<string, string> {
    const merged: Record<string, string> = {};
    const allKeys = new Set([...Object.keys(fallback), ...Object.keys(backend), ...Object.keys(local)]);
    allKeys.forEach((key) => {
      if (local[key] !== undefined) {
        merged[key] = local[key];
      } else if (backend[key] !== undefined) {
        merged[key] = backend[key];
      } else {
        merged[key] = fallback[key] ?? '';
      }
    });
    return merged;
  }

  const languageChanger = async (newLangCode: string) => {
    setSelectedLanguageCode(newLangCode);

    if (!formSchema) {
      setTranslations({});
      return;
    }
    if (localTranslations[newLangCode]) {
      setTranslations(localTranslations[newLangCode]);
      return;
    }

    setLoading(true);
    try {
      let backend = await fetchBackendTranslations(formUuid, newLangCode, fallbackStrings);
      let schemaTranslations = formSchema.translations?.[newLangCode] || {};

      const merged = mergeTranslations(schemaTranslations, backend || {}, fallbackStrings);

      setLocalTranslations((prev) => ({
        ...prev,
        [newLangCode]: merged,
      }));

      setTranslations(merged);

      const updatedSchema = {
        ...formSchema,
        translations: {
          ...(formSchema.translations || {}),
          [newLangCode]: merged,
        },
      };
      onUpdateSchema(updatedSchema);
    } catch (err) {
      setError('Failed to load backend translations.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTranslations = useMemo(() => {
    return Object.entries(translations).filter(([key, value]) => {
      if (activeTab === 'translated' && !isTranslated(key, value)) return false;
      if (activeTab === 'untranslated' && isTranslated(key, value)) return false;

      const lowerQuery = debouncedQuery.toLowerCase();
      return key.toLowerCase().includes(lowerQuery) || (value ?? '').toLowerCase().includes(lowerQuery);
    });
  }, [translations, activeTab, debouncedQuery, isTranslated]);

  const handleDownloadTranslation = useCallback(() => {
    setDownloadError(null);
    if (!downloadableTranslationResource) {
      if (langCode !== 'en') {
        setDownloadError(t('noTranslationForLang', 'No translations found for selected language.'));
      }
      return;
    }

    const url = URL.createObjectURL(downloadableTranslationResource);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formSchema?.name}_translations_${langCode}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [downloadableTranslationResource, langCode, formSchema?.name, t]);

  const handleUploadTranslationFromSchema = useCallback(async () => {
    if (!formSchema) return;

    const schemaTranslations = formSchema.translations?.[langCode];
    const translationsToUpload = langCode === 'en' ? fallbackStrings : schemaTranslations;

    if (!translationsToUpload) {
      setError(t('noTranslationForLang', 'No translations found for selected language.'));
      showSnackbar({
        title: t('noTranslations', 'No translatable strings found.'),
        kind: 'error',
        subtitle: t('noTranslationFileToUpload', `No translations found for the selected language to upload`),
      });
      return;
    }
    setTranslationsUploading(true);
    try {
      await uploadBackendTranslations(formUuid, langCode, formSchema.name, translationsToUpload);
      showSnackbar({
        title: t('translationsUploaded', 'Translations Uploaded.'),
        kind: 'success',
        subtitle: t('translationsUploadedSuccessfully', `Translation file uploaded successfully.`),
      });
    } catch (err: any) {
      setError(t('translationFileUploadFail', 'Failed to upload translation file.'));
      showSnackbar({
        title: t('uploadFailed', 'Upload Failed'),
        kind: 'error',
        subtitle: t('translationFileUploadFail', `Failed to upload translation file`),
      });
      console.error(err);
    } finally {
      setTranslationsUploading(false);
    }
  }, [formSchema, langCode, fallbackStrings, formUuid, t]);

  return (
    <div className={styles.translationBuilderContainer}>
      <div className={styles.translationBuilderHeader}>
        <div className={styles.languageTools}>
          <div className={styles.languagePath}>
            <span className={styles.language}>English (en)</span>
            <ArrowRight className={styles.arrow} />
            <Dropdown
              id="target-language"
              items={languageOptions}
              itemToString={(item) => item?.label ?? ''}
              titleText=""
              selectedItem={languageOptions.find((opt) => opt.code === selectedLanguageCode)}
              onChange={({ selectedItem }) => selectedItem && languageChanger(selectedItem.code)}
            />
          </div>

          <div className={styles.translationActions}>
            <button className={styles.linkButton} onClick={handleDownloadTranslation}>
              {t('downloadTranslation', 'Download translation')}
              <Download size={16} />
            </button>
            <button
              className={styles.linkButton}
              onClick={handleUploadTranslationFromSchema}
              disabled={translationsUploading}
            >
              {t('uploadTranslation', 'Upload translation')}
              {!translationsUploading ? <Upload size={16} /> : <InlineLoading />}
            </button>
          </div>
        </div>

        <div className={styles.translationTabs}>
          <Tabs
            onChange={({ selectedIndex }) => {
              if (selectedIndex === 0) setActiveTab('all');
              if (selectedIndex === 1) setActiveTab('translated');
              if (selectedIndex === 2) setActiveTab('untranslated');
            }}
          >
            <TabList aria-label="Translation filter">
              <Tab>{t('all', 'All')}</Tab>
              <Tab>{t('translated', 'Translated')}</Tab>
              <Tab>{t('untranslated', 'Untranslated')}</Tab>
            </TabList>
          </Tabs>
        </div>
      </div>

      {loading ? (
        <InlineLoading description={t('loadingTranslations', 'Loading translations...')} />
      ) : error ? (
        <InlineNotification kind="error" title={t('error', 'Error')} subtitle={error} lowContrast />
      ) : (
        <>
          {downloadError && (
            <InlineNotification
              className={styles.downloadError}
              kind="error"
              title={t('error', 'Error')}
              subtitle={downloadError}
              lowContrast
              onClose={() => setDownloadError(null)}
            />
          )}

          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder={t('searchTranslationKeys', 'Search Translation Keys...')}
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.translationEditor}>
            {filteredTranslations.length > 0 ? (
              filteredTranslations.map(([key, value]) => (
                <div key={key} className={styles.translationRow}>
                  <div className={styles.translationKey}>{key}</div>
                  <div className={styles.translatedKey}>{value}</div>
                  <div className={styles.inlineControls}>
                    <IconButton
                      kind="ghost"
                      label={t('editString', 'Edit string')}
                      onClick={() => handleEditClick(key)}
                      size="md"
                      className={styles.deleteButton}
                    >
                      <Edit />
                    </IconButton>
                  </div>
                </div>
              ))
            ) : (
              <InlineNotification
                kind="info"
                subtitle={
                  activeTab === 'translated'
                    ? t('noTranslatedStrings', 'No strings are translated yet.')
                    : activeTab === 'untranslated'
                      ? t('noUntranslatedStrings', 'All strings are translated.')
                      : t('noTranslations', 'No translatable strings found.')
                }
                hideCloseButton
                lowContrast
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TranslationBuilder;
