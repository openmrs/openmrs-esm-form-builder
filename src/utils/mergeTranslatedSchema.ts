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
