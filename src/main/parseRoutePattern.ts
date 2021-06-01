import {AstNode, AstNodeType, IPathAstNode} from './ast-types';
import {tokenizeRoutePattern} from './tokenizeRoutePattern';

export function parseRoutePattern(str: string): IPathAstNode {

  let root: AstNode = {
    nodeType: AstNodeType.PATH,
    absolute: false,
    children: [],
    parent: null,
    start: 0,
    end: 0,
  };

  let parent: AstNode = root;
  let altDepth = 0;

  const pushNode = (node: AstNode): void => {

    if (parent.nodeType === AstNodeType.VARIABLE) {
      parent.constraint = node;
      setEnd(node.end);
      parent = parent.parent!;
      return;
    }

    if (parent.nodeType === AstNodeType.PATH) {
      const segNode: AstNode = {
        nodeType: AstNodeType.PATH_SEGMENT,
        children: [node],
        parent,
        start: node.start,
        end: 0,
      };

      if (parent.children.length === 0) {
        parent.start = node.start;
      }

      node.parent = segNode;
      parent.children.push(segNode);
      parent = segNode;
      setEnd(node.end);
      return;
    }

    if (parent.nodeType === AstNodeType.PATH_SEGMENT) {
      parent.children.push(node);
      setEnd(node.end);
      return;
    }

    throw new SyntaxError(`Unexpected syntax at ${node.start}`);
  };

  const setEnd = (end: number): void => {
    for (let node: AstNode | null = parent; node !== null; node = node.parent) {
      node.end = end;
    }
  };

  let length = tokenizeRoutePattern(str, {

    onVariable(name, start, end) {
      const node: AstNode = {
        nodeType: AstNodeType.VARIABLE,
        name,
        constraint: null,
        parent,
        start,
        end,
      };

      if (parent.nodeType === AstNodeType.VARIABLE) {
        throw new SyntaxError(`Consequent variables at ${start}`);
      }
      pushNode(node);
      parent = node;
    },

    onAltStart(start, end) {
      altDepth++;

      const altNode: AstNode = {
        nodeType: AstNodeType.ALT,
        children: [],
        parent,
        start,
        end,
      };

      const pathNode: AstNode = {
        nodeType: AstNodeType.PATH,
        absolute: false,
        children: [],
        parent: altNode,
        start: end,
        end,
      };

      altNode.children.push(pathNode);
      pushNode(altNode);
      parent = pathNode;
    },

    onAltEnd(start, end) {
      altDepth--;

      while (parent.nodeType !== AstNodeType.ALT) {
        if (!parent.parent) {
          throw new SyntaxError(`Unexpected alternation end at ${start}`);
        }
        parent = parent.parent;
      }
      setEnd(end);
      parent = parent.parent!;
    },

    onAltSeparator(start, end) {
      while (parent.nodeType !== AstNodeType.ALT) {
        if (!parent.parent) {
          throw new SyntaxError(`Unexpected alternation separator at ${start}`);
        }
        parent = parent.parent;
      }

      const node: AstNode = {
        nodeType: AstNodeType.PATH,
        absolute: false,
        children: [],
        parent,
        start: end,
        end,
      };

      parent.children.push(node);
      parent = node;
      setEnd(end);
    },

    onWildcard(greedy, start, end) {
      pushNode({
        nodeType: AstNodeType.WILDCARD,
        greedy,
        parent,
        start,
        end,
      });
    },

    onRegExp(pattern, groupCount, start, end) {
      pushNode({
        nodeType: AstNodeType.REG_EXP,
        pattern,
        groupCount,
        parent,
        start,
        end,
      });
    },

    onText(value, start, end) {
      pushNode({
        nodeType: AstNodeType.TEXT,
        value,
        parent,
        start,
        end,
      });
    },

    onPathSeparator(start, end) {
      while (parent.nodeType !== AstNodeType.PATH) {
        parent = parent.parent!;
      }

      if (parent.children.length === 0) {
        parent.absolute = true;
        parent.start = start;
      }

      const node: AstNode = {
        nodeType: AstNodeType.PATH_SEGMENT,
        children: [],
        parent,
        start,
        end,
      };

      parent.children.push(node);
      parent = node;
      setEnd(end);
    },
  });

  if (length !== str.length) {
    throw new SyntaxError(`Unexpected syntax after ${length}`);
  }
  if (altDepth !== 0) {
    throw new SyntaxError(`Unterminated alternation at ${length}`);
  }

  return root;
}
