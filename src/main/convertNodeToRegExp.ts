import {visitNode} from './visitNode';
import {escapeRegExp} from './escapeRegExp';
import {Node, NodeType} from './ast-types';

export interface IPatternRegExp {

  /**
   * The compiled regular expression.
   */
  re: RegExp;

  /**
   * Map from variable name to group index in `re`.
   *
   * @example
   * const result = convertNodeToRegExp(parsePattern('/(\\d+)/:foo'));
   * const match = result.re.match('/123/bar');
   *
   * console.log(match[result.foo]); // → 'bar'
   */
  varMap: Record<string, number>;
}

/**
 * Converts pattern AST node to regular expression.
 *
 * @param node The node to convert to `RegExp`.
 */
export function convertNodeToRegExp(node: Node): IPatternRegExp {
  let pattern = '';

  let groupIndex = 1;
  let varMap: Record<string, number> = {};

  visitNode(node, {

    onPath(node, next) {
      const parent = node.parent;
      if (parent?.nodeType === NodeType.ALT && parent.children[0] !== node) {
        pattern += '|';
      }
      next();
    },

    onPathSegment(node, next) {
      const parent = node.parent;
      if (parent?.nodeType === NodeType.PATH && (parent.children[0] !== node || parent.absolute)) {
        pattern += '/';
      }
      next();
    },

    onAlt(node, next) {
      pattern += '(?:';
      next();
      pattern += ')';
    },

    onVariable(node, next) {
      varMap[node.name] = groupIndex++;
      pattern += '(';
      if (node.constraint) {
        next();
      } else {
        pattern += '[^/]*';
      }
      pattern += ')';
    },

    onWildcard(node) {
      pattern += node.greedy ? '.+' : '[^/]+?';
    },

    onRegExp(node) {
      groupIndex += node.groupCount;
      pattern += '(?:' + node.pattern + ')';
    },

    onText(node) {
      pattern += escapeRegExp(node.value);
    },
  });

  return {
    re: RegExp('^' + pattern),
    varMap,
  };
}
