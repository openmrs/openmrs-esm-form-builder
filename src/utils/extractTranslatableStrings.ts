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
