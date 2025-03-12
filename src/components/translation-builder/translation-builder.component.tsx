import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, InlineNotification, IconButton } from '@carbon/react';
import { TrashCan, Add } from '@carbon/react/icons';
import { useParams } from 'react-router-dom';
import EditableValue from '../interactive-builder/editable/editable-value.component';
import styles from './translation-builder.module.scss';

interface TranslationBuilderProps {
  formSchema: any; // The current form schema JSON passed from SchemaEditor
  onUpdateSchema: (updatedSchema: any) => void; // Callback to update the schema in SchemaEditor
}

/**
 * Always extract translatable strings from the form schema.
 * We traverse pages, sections, questions, and answers
 * and build an object with the original strings as keys & values.
 */
function extractTranslatableStrings(form: any): Record<string, string> {
  const result: Record<string, string> = {};

  if (form.pages) {
    form.pages.forEach((page: any) => {
      if (page.label) {
        result[page.label] = page.label;
      }
      if (page.sections) {
        page.sections.forEach((section: any) => {
          if (section.label) {
            result[section.label] = section.label;
          }
          if (section.questions) {
            section.questions.forEach((question: any) => {
              if (question.label) {
                result[question.label] = question.label;
              }
              if (question.questionOptions?.answers) {
                question.questionOptions.answers.forEach((answer: any) => {
                  if (answer.label) {
                    result[answer.label] = answer.label;
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  return result;
}

const TranslationBuilder: React.FC<TranslationBuilderProps> = ({ formSchema, onUpdateSchema }) => {
  const { t, i18n } = useTranslation();
  const { formId } = useParams<{ formId: string }>();

  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * On every language or schema change:
   * Always call extractTranslatableStrings to show
   * all possible translatable strings, ignoring any
   * existing translations in formSchema.translations.
   */
  useEffect(() => {
    if (!formSchema) return;
    const fallbackStrings = extractTranslatableStrings(formSchema);
    setTranslations(fallbackStrings);
  }, [formSchema, language]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    i18n.changeLanguage(selectedLang);
  };

  const handleUpdateValue = (key: string, newValue: string) => {
    setTranslations((prev) => ({ ...prev, [key]: newValue }));
  };

  const handleDeleteString = (key: string) => {
    setTranslations((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const handleSaveTranslations = () => {
    if (!formSchema) return;

    // Create or update the "translations" object for the chosen language.
    const updatedSchema = { ...formSchema };
    if (!updatedSchema.translations) {
      updatedSchema.translations = {};
    }
    updatedSchema.translations[language] = translations;

    // Pass updated schema back to the parent (Schema Editor).
    onUpdateSchema(updatedSchema);
    alert(t('saveSuccess', 'Translations saved successfully.'));
  };

  return (
    <div className={styles.translationBuilderContainer}>
      <h2 className={styles.title}>{t('translationBuilder', 'Translation Builder')}</h2>

      <div className={styles.languageSelector}>
        <label htmlFor="language-selector">{t('selectLanguage', 'Select Language:')}</label>
        <select id="language-selector" value={language} onChange={handleLanguageChange}>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
        </select>
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
                <div className={styles.inlineControls}>
                  <EditableValue
                    id={key}
                    value={typeof value === 'string' ? value : ''}
                    onSave={(newValue) => handleUpdateValue(key, newValue)}
                    elementType="translation"
                  />
                  <IconButton
                    kind="ghost"
                    label={t('deleteString', 'Delete string')}
                    onClick={() => handleDeleteString(key)}
                    size="md"
                  >
                    <TrashCan size={16} />
                  </IconButton>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noTranslations}>{t('noTranslations', 'No translatable strings found.')}</p>
          )}

          <div className={styles.addNewStringContainer}>
            <Button
              kind="ghost"
              renderIcon={Add}
              iconDescription={t('addNewString', 'Add new string')}
              onClick={() => {
                // Optional: let user add brand new string
                // (which would not normally be extracted from the form).
              }}
            >
              {t('addNewString', 'Add new string')}
            </Button>
          </div>

          <Button onClick={handleSaveTranslations} className={styles.saveButton}>
            {t('saveTranslations', 'Save Translations')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TranslationBuilder;
