import { ensureSyntaxTree, syntaxTree } from '@codemirror/language';
import type { EditorState } from '@codemirror/state';

export interface DuplicateKey {
  /** Where the overridden property name starts */
  from: number;
  /** Where the overridden property name ends */
  to: number;
  name: string;
  /** The one-based line of the last property with this name, the one JSON.parse keeps */
  lineOfLast: number;
}

/**
 * Finds property names that appear more than once in the same object. JSON.parse keeps the last one and drops the
 * others without an error, and JSON Schema only sees the parsed object, so validation can't catch them. Every
 * occurrence but the last is returned.
 */
export function findDuplicateKeys(state: EditorState): Array<DuplicateKey> {
  const tree = ensureSyntaxTree(state, state.doc.length, 200) ?? syntaxTree(state);
  const duplicates: Array<DuplicateKey> = [];

  tree.iterate({
    enter(node) {
      if (node.name !== 'Object') {
        return;
      }

      const namesByKey = new Map<string, Array<{ from: number; to: number }>>();
      for (const property of node.node.getChildren('Property')) {
        const propertyName = property.getChild('PropertyName');
        if (!propertyName) {
          continue;
        }
        let key: string;
        try {
          // Escapes such as "a" name the same key as "a", as they do for JSON.parse
          key = JSON.parse(state.sliceDoc(propertyName.from, propertyName.to));
        } catch {
          continue;
        }
        namesByKey.set(key, [...(namesByKey.get(key) ?? []), { from: propertyName.from, to: propertyName.to }]);
      }

      for (const [name, names] of namesByKey) {
        if (names.length > 1) {
          const lineOfLast = state.doc.lineAt(names[names.length - 1].from).number;
          for (const { from, to } of names.slice(0, -1)) {
            duplicates.push({ from, to, name, lineOfLast });
          }
        }
      }
    },
  });

  return duplicates.sort((a, b) => a.from - b.from);
}
