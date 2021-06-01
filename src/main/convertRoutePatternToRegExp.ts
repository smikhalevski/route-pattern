import {visitRoutePattern} from './visitRoutePattern';
import {escapeRegExp} from './escapeRegExp';
import {AstNode, AstNodeType} from './ast-types';

export function convertRoutePatternToRegExp(node: AstNode): { re: RegExp, vars: Record<string, number> } {
  let pattern = '';

  let groupIndex = 1;
  let vars: Record<string, number> = {};

  visitRoutePattern(node, {

    onPath(node, next) {
      const parent = node.parent;
      if (parent?.nodeType === AstNodeType.ALT && parent.children[0] !== node) {
        pattern += '|';
      }
      next();
    },

    onPathSegment(node, next) {
      const parent = node.parent;
      if (parent?.nodeType === AstNodeType.PATH && (parent.children[0] !== node || parent.absolute)) {
        pattern += '[\\\\/]';
      }
      next();
    },

    onAlt(node, next) {
      pattern += '(?:';
      next();
      pattern += ')';
    },

    onVariable(node, next) {
      vars[node.name] = groupIndex++;
      pattern += '(';
      if (node.constraint) {
        next();
      } else {
        pattern += '[^\\\\/]*';
      }
      pattern += ')';
    },

    onWildcard(node) {
      pattern += node.greedy ? '.+' : '[^\\\\/]+?';
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
    vars,
  };
}
