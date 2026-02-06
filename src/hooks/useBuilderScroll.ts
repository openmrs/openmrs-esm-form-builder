import { useEffect } from 'react';
import { useSelection } from '../context/selection-context';
import { getBuilderElementId, type ElementKind } from '../utils/builder-ids';

export function useBuilderScroll() {
  const { source, kind, pageIndex, sectionIndex, questionIndex } = useSelection();

  useEffect(() => {
    if (source === 'editor' && kind) {
      const elementId = getBuilderElementId(kind as ElementKind, pageIndex, sectionIndex, questionIndex);
      if (elementId) {
        let attempts = 0;
        // Accordion animation is ~250ms-300ms.
        // We retry for ~1.5s total (15 attempts * 100ms) to ensure it renders.
        const maxAttempts = 15;

        const tryScroll = () => {
          const element = document.getElementById(elementId);
          if (element && element.offsetParent !== null) {
            // Check visibility
            // Ensure it's fully rendered
            setTimeout(() => {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('builder-highlight');
              setTimeout(() => {
                element.classList.remove('builder-highlight');
              }, 3000); // Highlight for 3s
            }, 100);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryScroll, 100);
          }
        };

        tryScroll();
      }
    }
  }, [source, kind, pageIndex, sectionIndex, questionIndex]);
}
