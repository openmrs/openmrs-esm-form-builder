import { type Schema } from '../types';

export const findQuestionIndexes = (schema: Schema, questionId: string, type: string = 'field') => {
  let pageIndex = -1,
    sectionIndex = -1,
    questionIndex = -1;
  schema.pages.some((page, pIndex) => {
    if (type === 'page' && page.label === questionId) {
      pageIndex = pIndex;
      return true;
    }

    return page.sections?.some((section, sIndex) => {
      if (type === 'section' && section.label === questionId) {
        pageIndex = pIndex;
        sectionIndex = sIndex;
        return true;
      }

      return section.questions?.some((question, qIndex) => {
        if (type === 'field' && question.id === questionId) {
          pageIndex = pIndex;
          sectionIndex = sIndex;
          questionIndex = qIndex;
          return true;
        }
        return false;
      });
    });
  });
  return { pageIndex, sectionIndex, questionIndex };
};
