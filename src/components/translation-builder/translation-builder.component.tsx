import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextInput, InlineLoading, InlineNotification } from '@carbon/react';
import styles from './translation-builder.module.scss';

interface TranslationNode {
  [key: string]: any;
}

interface RecursiveTranslationEditorProps {
  data: TranslationNode;
  path: string[];
  onChange: (path: string[], value: any) => void;
}

const RecursiveTranslationEditor: React.FC<RecursiveTranslationEditorProps> = ({ data, path, onChange }) => {
  return (
    <div className={styles.recursiveContainer}>
      {Object.entries(data).map(([key, value]) => {
        const currentPath = [...path, key];
        if (typeof value === 'object' && value !== null) {
          return (
            <div key={currentPath.join('.')} className={styles.nestedSection}>
              <div className={styles.sectionLabel}>{key}</div>
              <RecursiveTranslationEditor data={value} path={currentPath} onChange={onChange} />
            </div>
          );
        } else {
          return (
            <div key={currentPath.join('.')} className={styles.translationField}>
              <label>{key}</label>
              <TextInput value={value} onChange={(e) => onChange(currentPath, e.target.value)} />
            </div>
          );
        }
      })}
    </div>
  );
};

const TranslationBuilder: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState<TranslationNode>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching translation JSON based on language
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let dummyData: TranslationNode;
      if (language === 'en') {
        dummyData = {
          name: 'COVID-19',
          description: 'COVID-19 Form',
          pages: [
            {
              label: 'COVID-19 Signs and Symptoms',
              sections: [
                {
                  label: 'COVID-19 Signs and Symptoms',
                  questions: [
                    {
                      label: 'COVID-19 Set',
                      questions: [
                        { label: 'COVID-19 Signs and Symptoms in the past 14 days' },
                        { label: 'Onset Date' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        };
      } else if (language === 'fr') {
        dummyData = {
          name: 'COVID-19',
          description: 'Formulaire COVID-19',
          pages: [
            {
              label: 'Signes et symptômes du COVID-19',
              sections: [
                {
                  label: 'Signes et symptômes du COVID-19',
                  questions: [
                    {
                      label: 'Ensemble COVID-19',
                      questions: [
                        { label: 'Signes et symptômes dans les 14 derniers jours' },
                        { label: "Date d'apparition" },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        };
      } else if (language === 'es') {
        dummyData = {
          name: 'COVID-19',
          description: 'Formulario COVID-19',
          pages: [
            {
              label: 'Signos y síntomas del COVID-19',
              sections: [
                {
                  label: 'Signos y síntomas del COVID-19',
                  questions: [
                    {
                      label: 'Conjunto COVID-19',
                      questions: [
                        { label: 'Signos y síntomas en los últimos 14 días' },
                        { label: 'Fecha de aparición' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        };
      }
      setTranslations(dummyData);
      setLoading(false);
    }, 1000);
  }, [language]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    i18n.changeLanguage(selectedLang);
  };

  const updateTranslationAtPath = (path: string[], value: any) => {
    setTranslations((prev) => {
      const newTranslations = { ...prev };
      const updateNested = (obj: any, pathArr: string[], value: any) => {
        const [first, ...rest] = pathArr;
        if (rest.length === 0) {
          obj[first] = value;
        } else {
          obj[first] = { ...obj[first] };
          updateNested(obj[first], rest, value);
        }
      };
      updateNested(newTranslations, path, value);
      return newTranslations;
    });
  };

  const handleSaveTranslations = () => {
    alert('Translations saved:\n' + JSON.stringify(translations, null, 2));
    // In production, this would be a PUT API call.
  };

  return (
    <div className={styles.translationBuilderContainer}>
      <h2>{t('translationBuilder', 'Translation Builder')}</h2>
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
          <RecursiveTranslationEditor data={translations} path={[]} onChange={updateTranslationAtPath} />
          <Button onClick={handleSaveTranslations} style={{ marginTop: '1rem' }}>
            {t('saveTranslations', 'Save Translations')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TranslationBuilder;
