export type Frame = {
  type: 'object' | 'array';
  key: string | null;
  index: number | null;
};

export type CursorKind = 'page' | 'section' | 'question' | 'form';

export interface SchemaCursorInfo {
  kind: CursorKind;
  pageIndex: number | null;
  sectionIndex: number | null;
  questionIndex: number | null;
}

/**
 * Given the full JSON text and a cursor position (row, column),
 * walk the JSON structure and infer the nearest enclosing page/section/question indices.
 */
export function getSchemaCursorInfo(text: string, row: number, column: number): SchemaCursorInfo | null {
  if (!text) {
    return null;
  }

  const lines = text.split('\n');
  if (row < 0 || row >= lines.length) {
    return null;
  }

  const safeColumn = Math.min(column, lines[row].length);

  let offset = 0;
  for (let r = 0; r < row; r++) {
    offset += lines[r].length + 1;
  }
  offset += safeColumn;

  const stack: Frame[] = [];
  let inString = false;
  let escape = false;
  let currentKey: string | null = null;

  const pushObject = () => {
    stack.push({ type: 'object', key: currentKey, index: null });
    currentKey = null;
  };

  const pushArray = (key: string | null) => {
    stack.push({ type: 'array', key, index: 0 });
    currentKey = null;
  };

  for (let i = 0; i <= offset && i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (inString) {
      if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      let j = i + 1;
      let str = '';
      let localEscape = false;
      for (; j < text.length; j++) {
        const c2 = text[j];
        if (localEscape) {
          str += c2;
          localEscape = false;
          continue;
        }
        if (c2 === '\\') {
          localEscape = true;
          continue;
        }
        if (c2 === '"') {
          break;
        }
        str += c2;
      }
      inString = false;

      let k = j + 1;
      while (k < text.length && /\s/.test(text[k])) {
        k++;
      }
      if (text[k] === ':') {
        currentKey = str;
      }
      i = j;
      continue;
    }

    if (ch === '{') {
      pushObject();
    } else if (ch === '}') {
      while (stack.length && stack[stack.length - 1].type !== 'object') {
        stack.pop();
      }
      if (stack.length) {
        stack.pop();
      }
      currentKey = null;
    } else if (ch === '[') {
      pushArray(currentKey);
    } else if (ch === ']') {
      while (stack.length && stack[stack.length - 1].type !== 'array') {
        stack.pop();
      }
      if (stack.length) {
        stack.pop();
      }
      currentKey = null;
    } else if (ch === ',') {
      const top = stack[stack.length - 1];
      if (top && top.type === 'array' && top.index !== null) {
        top.index += 1;
      }
      currentKey = null;
    }
  }

  let pageIndex: number | null = null;
  let sectionIndex: number | null = null;
  let questionIndex: number | null = null;

  stack.forEach((frame) => {
    if (frame.type === 'array' && frame.index !== null) {
      if (frame.key === 'pages') {
        pageIndex = frame.index;
      } else if (frame.key === 'sections') {
        sectionIndex = frame.index;
      } else if (frame.key === 'questions') {
        questionIndex = frame.index;
      }
    }
  });

  const findNearestByArrayKey = (arrayKey: 'questions' | 'sections' | 'pages') => {
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].type !== 'object') {
        continue;
      }
      for (let j = i - 1; j >= 0; j--) {
        const parent = stack[j];
        if (parent.type === 'array' && parent.key === arrayKey && parent.index !== null) {
          return parent.index;
        }
      }
    }
    return null;
  };

  const qIdx = findNearestByArrayKey('questions');
  if (qIdx !== null) {
    return { kind: 'question', pageIndex, sectionIndex, questionIndex: qIdx };
  }

  const sIdx = findNearestByArrayKey('sections');
  if (sIdx !== null) {
    return { kind: 'section', pageIndex, sectionIndex: sIdx, questionIndex: null };
  }

  const pIdx = findNearestByArrayKey('pages');
  if (pIdx !== null) {
    return { kind: 'page', pageIndex: pIdx, sectionIndex: null, questionIndex: null };
  }

  // If we are deep enough to be in an object but not in any known array,
  // and checking the stack suggests we are in the root object (depth 1 or 0),
  // return form kind.
  // Actually, standard stack traversal: if we haven't found a page/section/question,
  // we might be at the form level.
  // Simplest check: if we are inside the root object (stack[0] is object) and no array parent found.
  if (stack.length > 0 && stack[0].type === 'object') {
    return { kind: 'form', pageIndex: null, sectionIndex: null, questionIndex: null };
  }

  return null;
}

/**
 * Finds the line number where a specific page, section, or question starts.
 * It prioritizes finding the line containing the "label" property of the target object.
 */
export function findLineForIndices(
  text: string,
  targetPageIndex: number | null,
  targetSectionIndex: number | null,
  targetQuestionIndex: number | null,
): number {
  if (!text) return 0;

  const stack: Frame[] = [];
  let inString = false;
  let escape = false;
  let currentKey: string | null = null;

  const pushObject = () => {
    stack.push({ type: 'object', key: currentKey, index: null });
    currentKey = null;
  };

  const pushArray = (key: string | null) => {
    stack.push({ type: 'array', key, index: 0 });
    currentKey = null;
  };

  // We need to count newlines as we scan
  let lineNumber = 0;

  // State for label searching
  let targetFound = false;
  let targetStartLine = 0;
  let targetStackDepth = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '\n') {
      lineNumber++;
    }

    if (escape) {
      escape = false;
      continue;
    }

    if (inString) {
      if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      let j = i + 1;
      let str = '';
      let localEscape = false;
      for (; j < text.length; j++) {
        const c2 = text[j];
        if (c2 === '\n') lineNumber++; // Track lines inside strings too!

        if (localEscape) {
          str += c2;
          localEscape = false;
          continue;
        }
        if (c2 === '\\') {
          localEscape = true;
          continue;
        }
        if (c2 === '"') {
          break;
        }
        str += c2;
      }
      inString = false;

      let k = j + 1;
      while (k < text.length && /\s/.test(text[k])) {
        k++;
      }
      if (text[k] === ':') {
        currentKey = str;
        // Optimization: If we are searching for label, and this key is "label",
        // and we are at the right depth, return current line!
        // For Form (root), we look for "name". For others, we look for "label".
        const isFormTarget = targetPageIndex === null && targetSectionIndex === null && targetQuestionIndex === null;
        const targetKey = isFormTarget ? 'name' : 'label';

        if (targetFound && str === targetKey && stack.length === targetStackDepth) {
          return lineNumber;
        }
      }
      i = j;
      continue;
    }

    if (ch === '{') {
      pushObject();

      if (!targetFound) {
        // Check if we hit the target
        let currentPage: number | null = null;
        let currentSection: number | null = null;
        let currentQuestion: number | null = null;
        let isTarget = false;

        // Check the stack for our indices
        stack.forEach((frame) => {
          if (frame.type === 'array' && frame.index !== null) {
            if (frame.key === 'pages') currentPage = frame.index;
            if (frame.key === 'sections') currentSection = frame.index;
            if (frame.key === 'questions') currentQuestion = frame.index;
          }
        });

        // Does this match the requested target?
        if (targetQuestionIndex !== null) {
          if (
            currentPage === targetPageIndex &&
            currentSection === targetSectionIndex &&
            currentQuestion === targetQuestionIndex &&
            stack.length >= 2 &&
            stack[stack.length - 2].type === 'array' &&
            stack[stack.length - 2].key === 'questions'
          ) {
            isTarget = true;
          }
        } else if (targetSectionIndex !== null) {
          if (
            currentPage === targetPageIndex &&
            currentSection === targetSectionIndex &&
            stack.length >= 2 &&
            stack[stack.length - 2].type === 'array' &&
            stack[stack.length - 2].key === 'sections'
          ) {
            isTarget = true;
          }
        } else if (targetPageIndex !== null) {
          if (
            currentPage === targetPageIndex &&
            stack.length >= 2 &&
            stack[stack.length - 2].type === 'array' &&
            stack[stack.length - 2].key === 'pages'
          ) {
            isTarget = true;
          }
        } else {
          // Form level target (all indices null)
          // If we rely on valid indices for other types, then all-null implies form.
          // The root object is the first object pushed (stack length 1).
          if (stack.length === 1 && lineNumber >= 0) {
            isTarget = true;
          }
        }

        if (isTarget) {
          targetFound = true;
          targetStartLine = lineNumber;
          targetStackDepth = stack.length; // The object we just pushed is at this depth
        }
      }
    } else if (ch === '}') {
      if (targetFound && stack.length === targetStackDepth) {
        // We are closing the target object and haven't returned a label line yet.
        // Return the start line of the object.
        return targetStartLine;
      }

      while (stack.length && stack[stack.length - 1].type !== 'object') {
        stack.pop();
      }
      if (stack.length) {
        stack.pop();
      }
      currentKey = null;
    } else if (ch === '[') {
      pushArray(currentKey);
    } else if (ch === ']') {
      while (stack.length && stack[stack.length - 1].type !== 'array') {
        stack.pop();
      }
      if (stack.length) {
        stack.pop();
      }
      currentKey = null;
    } else if (ch === ',') {
      const top = stack[stack.length - 1];
      if (top && top.type === 'array' && top.index !== null) {
        top.index += 1;
      }
      currentKey = null;
    }
  }

  return 0; // Not found
}
