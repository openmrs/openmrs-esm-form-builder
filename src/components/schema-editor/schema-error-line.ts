import { jsonLanguage } from '@codemirror/lang-json';
import { Text } from '@codemirror/state';

type SyntaxNode = ReturnType<typeof jsonLanguage.parser.parse>['topNode'];

const pathSegment = /\.([A-Za-z_$][\w$]*)|\[(\d+)\]|\[("(?:[^"\\]|\\.)*")\]/g;
const valueNodes = new Set(['Object', 'Array', 'String', 'Number', 'True', 'False', 'Null']);

/**
 * Splits an Ajv instance path written with `jsPropertySyntax`, such as `.pages[0]["odd-key"]`, into object keys and
 * array indexes.
 */
function parseInstancePath(instancePath: string): Array<string | number> {
  return Array.from(
    instancePath.matchAll(pathSegment),
    ([, name, index, quotedName]) => name ?? (index !== undefined ? Number(index) : JSON.parse(quotedName)),
  );
}

function children(node: SyntaxNode) {
  const result: Array<SyntaxNode> = [];
  for (let child = node.firstChild; child; child = child.nextSibling) {
    result.push(child);
  }
  return result;
}

/**
 * Returns a function that finds the one-based line of the value an Ajv error is about: the line its property name is
 * on, or the line an array element starts on. When the path can't be followed all the way, it returns the line of the
 * deepest part that was found, which is line 1 for errors about the whole schema. The content is parsed once, so one
 * finder can place every error from a validation.
 */
export function createInstanceLineFinder(content: string) {
  const root = jsonLanguage.parser.parse(content).topNode.firstChild;
  const text = Text.of(content.split('\n'));

  return (instancePath: string, extraPropertyName?: string): number => {
    const segments = parseInstancePath(instancePath);
    if (extraPropertyName !== undefined) {
      segments.push(extraPropertyName);
    }

    let node = root;
    let position = node?.from ?? 0;

    for (const segment of segments) {
      if (typeof segment === 'number' && node?.name === 'Array') {
        const element = children(node).filter((child) => valueNodes.has(child.name))[segment];
        if (!element) break;
        node = element;
        position = element.from;
      } else if (typeof segment === 'string' && node?.name === 'Object') {
        // The last property with the name wins, as it does in JSON.parse
        const property = node
          .getChildren('Property')
          .filter((child) => {
            const name = child.getChild('PropertyName');
            return name && JSON.parse(content.slice(name.from, name.to)) === segment;
          })
          .at(-1);
        if (!property) break;
        node = children(property).find((child) => valueNodes.has(child.name)) ?? null;
        position = property.from;
      } else {
        break;
      }
    }

    return text.lineAt(position).number;
  };
}
