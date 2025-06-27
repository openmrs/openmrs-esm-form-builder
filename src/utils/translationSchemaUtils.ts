export function extractTranslatableStrings(form: any): Record<string, string> {
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
            section.questions = section.questions.map((question: any) => {
              if (translations[question.label]) {
                question.label = translations[question.label];
              }
              if (question.questions) {
                question.questions = question.questions.map((subQuestion: any) => {
                  if (translations[subQuestion.label]) {
                    subQuestion.label = translations[subQuestion.label];
                  }
                  return subQuestion;
                });
              }
              return question;
            });
          }
          return section;
        });
      }
      return page;
    });
  }

  return merged;
}
