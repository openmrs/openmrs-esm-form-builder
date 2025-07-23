import { type FormField, type QuestionAnswerOption } from '@openmrs/esm-form-engine-lib';

export function extractTranslatableStrings(form: any): Record<string, string> {
  const result: Record<string, string> = {};
  if (form.pages) {
    form.pages.forEach((page: any) => {
      if (page.label) result[page.label] = page.label;
      if (page.sections) {
        page.sections.forEach((section: any) => {
          if (section.label) result[section.label] = section.label;
          if (section.questions) {
            section.questions.forEach((question: FormField) => handleExtractQuestion(question, result));
          }
        });
      }
    });
  }
  return result;
}

export function mergeTranslatedSchema(schema: any, langCode: string): any {
  if (!schema?.translations?.[langCode]) return schema;

  const merged = JSON.parse(JSON.stringify(schema));
  const translations = schema.translations[langCode];

  if (merged.pages) {
    merged.pages = merged.pages.map((page: any) => {
      if (translations[page.label]) {
        page.label = translations[page.label];
      }
      if (page.sections) {
        page.sections = page.sections.map((section: any) => {
          if (translations[section.label]) {
            section.label = translations[section.label];
          }
          if (section.questions) {
            section.questions = section.questions.map((question: any) => handleMergeQuestion(question, translations));
          }
          return section;
        });
      }
      return page;
    });
  }

  return merged;
}

function handleExtractQuestion(question: FormField, translatableStrings: Record<string, string>) {
  // handle question label
  if (question.label) {
    translatableStrings[question.label] = question.label;
  }

  // handle answer labels
  question.questionOptions?.answers?.forEach((answer: QuestionAnswerOption) => {
    if (answer.label) {
      translatableStrings[answer.label] = answer.label;
    }
  });

  // handle markdown content
  if (question.questionOptions?.rendering === 'markdown') {
    if (Array.isArray(question.value)) {
      question.value.forEach((item) => {
        if (typeof item === 'string' && item.trim()) {
          translatableStrings[item] = item;
        }
      });
    } else if (typeof question.value === 'string' && question.value.trim()) {
      translatableStrings[question.value] = question.value;
    }
  }

  question.questions?.forEach((nestedQuestion) => handleExtractQuestion(nestedQuestion, translatableStrings));
}

function handleMergeQuestion(question: FormField, translations: Record<string, string>): FormField {
  // handle label
  if (question.label && translations[question.label]) {
    question.label = translations[question.label];
  }

  // handle answer labels
  if (question.questionOptions?.answers) {
    question.questionOptions = {
      ...question.questionOptions,
      answers: question.questionOptions.answers.map((answer: any) => ({
        ...answer,
        label: answer.label && translations[answer.label] ? translations[answer.label] : answer.label,
      })),
    };
  }

  // handle markdown content
  if (question.questionOptions?.rendering === 'markdown') {
    if (Array.isArray(question.value)) {
      question.value = question.value.map((item) => translations[item]);
    } else {
      question.value = translations[question.value];
    }
  }

  if (question.questions) {
    question.questions = question.questions.map((nestedQuestion) => handleMergeQuestion(nestedQuestion, translations));
  }

  return question;
}
