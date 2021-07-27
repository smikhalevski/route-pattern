import {visitNode} from './visitNode';
import {escapeRegExp} from './escapeRegExp';
import {Node, NodeType} from './ast-types';

export interface INodeToRegExpConverterOptions {
  caseInsensitive?: boolean;
}

/**
 * Converts pattern AST node to regular expression.
 *
 * @param node The node to convert to `RegExp`.
 * @param options Other options.
 */
export function convertNodeToRegExp(node: Node, options: INodeToRegExpConverterOptions = {}): RegExp {
  const {caseInsensitive} = options;

  let pattern = '';
  let groupIndex = 1;

  const varMap: Record<string, number> = Object.create(null);

  visitNode(node, {

    path(node, next) {
      const parent = node.parent;
      if (parent?.nodeType === NodeType.ALT && parent.children[0] !== node) {
        pattern += '|';
      }
      next();
    },

    pathSegment(node, next) {
      const parent = node.parent;
      if (parent?.nodeType === NodeType.PATH && (parent.children[0] !== node || parent.absolute)) {
        pattern += '/';
      }
      next();
    },

    alt(node, next) {
      pattern += '(?:';
      next();
      pattern += ')';
    },

    variable(node, next) {
      varMap[node.name] = groupIndex++;
      pattern += '(';
      if (node.constraint) {
        next();
      } else {
        pattern += '[^/]*';
      }
      pattern += ')';
    },

    wildcard(node) {
      pattern += node.greedy ? '.*' : '[^/]*';
    },

    regExp(node) {
      groupIndex += node.groupCount;
      pattern += '(?:' + node.pattern + ')';
    },

    text(node) {
      pattern += escapeRegExp(node.value);
    },
  });

  const re = RegExp('^' + pattern, caseInsensitive ? 'i' : '');

  if (groupIndex === 1) {
    return re;
  }

  const reExec = re.exec;

  re.exec = (str) => {
    const arr = reExec.call(re, str);
    if (arr != null) {
      arr.groups ||= Object.create(null) as Record<string, string>;

      for (const key in varMap) {
        arr.groups[key] = arr[varMap[key]];
      }
    }
    return arr;
  };

  return re;
}
