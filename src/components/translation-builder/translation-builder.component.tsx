import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, InlineNotification, IconButton } from '@carbon/react';
import { TrashCan, Add } from '@carbon/react/icons';
import { useParams } from 'react-router-dom';
import TranslationEditableValue from './TranslationEditableValue.component';
import styles from './translation-builder.module.scss';
import { showSnackbar } from '@openmrs/esm-framework';

interface TranslationBuilderProps {
  formSchema: any; // The current form schema JSON passed from SchemaEditor
  onUpdateSchema: (updatedSchema: any) => void; // Callback to update the schema in SchemaEditor
  languages: string[]; // Available language codes passed from Form Editor
}

/**
 * Extract translatable strings from the form schema.
 * Traverses pages, sections, questions, nested questions, and answers
 * and builds an object with the original strings as both keys and default values.
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
              // Check for nested questions (e.g. in obsGroup)
              if (question.questions) {
                question.questions.forEach((subQuestion: any) => {
                  if (subQuestion.label) {
                    result[subQuestion.label] = subQuestion.label;
                  }
                  if (subQuestion.questionOptions?.answers) {
                    subQuestion.questionOptions.answers.forEach((answer: any) => {
                      if (answer.label) {
                        result[answer.label] = answer.label;
                      }
                    });
                  }
                });
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

const TranslationBuilder: React.FC<TranslationBuilderProps> = ({ formSchema, onUpdateSchema, languages }) => {
  const { t, i18n } = useTranslation();
  const { formId } = useParams<{ formId: string }>();

  // Local state for the selected language within Translation Builder
  const [localSelectedLanguage, setLocalSelectedLanguage] = useState('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * On every change to the form schema,
   * extract all translatable strings from the schema.
   */
  useEffect(() => {
    if (!formSchema) return;
    const fallbackStrings = extractTranslatableStrings(formSchema);
    setTranslations(fallbackStrings);
  }, [formSchema]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLocalSelectedLanguage(newLang);
    i18n.changeLanguage(newLang);
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

    // Update the form schema's "translations" property for the selected language.
    const updatedSchema = { ...formSchema };
    if (!updatedSchema.translations) {
      updatedSchema.translations = {};
    }
    updatedSchema.translations[localSelectedLanguage] = translations;

    // Pass the updated schema back to the parent (Schema Editor).
    onUpdateSchema(updatedSchema);

    showSnackbar({
      title: t('success', 'Success!'),
      kind: 'success',
      isLowContrast: true,
      subtitle: t('translationSaveSuccess', '{{language}} translations are saved successfully..!', {
        language: localSelectedLanguage.toLowerCase(),
      }),
    });
  };

  return (
    <div className={styles.translationBuilderContainer}>
      <h2 className={styles.title}>{t('translationBuilder', 'Translation Builder')}</h2>

      <div className={styles.languageSelector}>
        <label htmlFor="language-selector">{t('selectLanguage', 'Select Language:')}</label>
        <select id="language-selector" value={localSelectedLanguage} onChange={handleLanguageChange}>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.toLowerCase()}
            </option>
          ))}
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
                  <TranslationEditableValue
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
                // Optionally, you can implement adding a new string manually.
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
