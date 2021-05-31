import {parseRoutePattern} from './parseRoutePattern';
import {visitRoutePattern} from './visitRoutePattern';
import {escapeRegExp} from './escapeRegExp';
import {AstNodeType} from './ast-types';

export function convertRoutePatternToRegExp(str: string): RegExp {
  let re = '';

  let varIndex = 1;
  let varMap = new Map<string, number>();

  visitRoutePattern(parseRoutePattern(str), {

    onPath(node, next) {
      if (node.parent?.nodeType === AstNodeType.ALT && node.parent.children[0] !== node) {
        re += '|';
      }
      next();
    },

    onPathSegment(node, next) {
      if (node.parent?.nodeType === AstNodeType.PATH && (node.parent.children[0] === node && node.parent.absolute || node.parent.children[0] !== node)) {
        re += '[\\\\/]';
      }
      next();
    },

    onAlt(node, next) {
      re += '(?:';
      next();
      re += ')';
    },

    onVariable(node, next) {
      varMap.set(node.name, varIndex++);
      re += '(';
      if (node.constraint) {
        next();
      } else {
        re += '[^\\\\/]*';
      }
      re += ')';
    },

    onWildcard(node) {
      re += node.greedy ? '.+' : '[^\\\\/]+?';
    },

    onRegExp(node) {
      varIndex += node.groupCount;
      re += '(?:' + node.pattern + ')';
    },

    onLiteral(node) {
      re += escapeRegExp(node.value);
    },
  });

  return RegExp('^' + re);
}
