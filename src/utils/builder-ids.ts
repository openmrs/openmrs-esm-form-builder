export type ElementKind = 'page' | 'section' | 'question' | 'form';

export function getBuilderElementId(
  kind: ElementKind | undefined,
  pageIndex: number | null,
  sectionIndex: number | null = null,
  questionIndex: number | null = null,
): string {
  if (kind === 'page' && pageIndex !== null) {
    return `builder-page-${pageIndex}`;
  }
  if (kind === 'section' && pageIndex !== null && sectionIndex !== null) {
    return `builder-section-${pageIndex}-${sectionIndex}`;
  }
  if (kind === 'question' && pageIndex !== null && sectionIndex !== null && questionIndex !== null) {
    return `builder-question-${pageIndex}-${sectionIndex}-${questionIndex}`;
  }
  if (kind === 'form') {
    return 'builder-form-header';
  }
  return '';
}
