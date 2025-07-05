import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, InlineNotification, IconButton, Tabs, Tab, TabList, Dropdown } from '@carbon/react';
import { Download, Edit, ArrowRight } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import { useLanguageOptions } from '@hooks/getLanguageOptionsFromSession';
import { extractTranslatableStrings } from '../../utils/translationSchemaUtils';
import styles from './translation-builder.module.scss';

interface TranslationBuilderProps {
  formSchema: any;
  onUpdateSchema: (updatedSchema: any) => void;
}

const TranslationBuilder: React.FC<TranslationBuilderProps> = ({ formSchema, onUpdateSchema }) => {
  const { t } = useTranslation();
  const languageOptions = useLanguageOptions();
  const [selectedLanguageCode, setSelectedLanguageCode] = useState(() => languageOptions[0]?.code ?? 'en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'translated' | 'untranslated'>('all');

  const langCode = selectedLanguageCode;

  useEffect(() => {
    if (!formSchema) return;
    const translationsMap = formSchema.translations as Record<string, Record<string, string>> | undefined;

    const schemaTranslations = translationsMap?.[langCode];
    if (schemaTranslations) {
      setTranslations(schemaTranslations);
    } else {
      const fallbackStrings = extractTranslatableStrings(formSchema);
      setTranslations(fallbackStrings);
    }
  }, [formSchema, langCode]);

  const handleUpdateValue = useCallback(
    (key: string, newValue: string) => {
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

  const fallbackStrings: Record<string, string> = useMemo(() => {
    return formSchema ? extractTranslatableStrings(formSchema) : {};
  }, [formSchema]);

  const isTranslated: (key: string, value: string | undefined | null) => boolean = (key, value) => {
    const fallback = fallbackStrings[key] ?? '';
    return value != null && value.trim() !== '' && value.trim() !== fallback.trim();
  };

  const filteredTranslations: Array<[string, string]> = Object.entries(translations).filter(([key, value]) => {
    if (activeTab === 'translated') {
      return isTranslated(key, value);
    }
    if (activeTab === 'untranslated') {
      return !isTranslated(key, value);
    }
    return true;
  });

  return (
    <div className={styles.translationBuilderContainer}>
      <div className={styles.translationBuilderHeader}>
        <Tabs
          onChange={({ selectedIndex }) => {
            if (selectedIndex === 0) setActiveTab('all');
            if (selectedIndex === 1) setActiveTab('translated');
            if (selectedIndex === 2) setActiveTab('untranslated');
          }}
        >
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
          {filteredTranslations.length > 0 ? (
            filteredTranslations.map(([key, value]) => (
              <div key={key} className={styles.translationRow}>
                <div className={styles.translationKey}>{key}</div>
                <div className={styles.translatedKey}>{value}</div>
                <div className={styles.inlineControls}>
                  <IconButton
                    kind="ghost"
                    label={t('editString', 'Edit string')}
                    onClick={() => {
                      handleEditClick(key);
                    }}
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
      )}
    </div>
  );
};

export default TranslationBuilder;
