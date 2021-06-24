import {IPathNode, Node, NodeType} from './ast-types';
import {tokenizePattern} from './tokenizePattern';

/**
 * Converts pattern to an AST.
 *
 * @param str The pattern to parse.
 * @throws SyntaxError If unexpected syntax is met.
 * @returns The root node of the parsed AST.
 */
export function parsePattern(str: string): IPathNode {

  let root: Node = {
    nodeType: NodeType.PATH,
    absolute: false,
    children: [],
    parent: null,
    start: 0,
    end: 0,
  };

  let parent: Node = root;
  let altDepth = 0;

  const pushNode = (node: Node): void => {

    if (parent.nodeType === NodeType.VARIABLE) {
      if (parent.constraint) {
        parent = parent.parent!;
      } else {
        parent.constraint = node;
        setEnd(node.end);
        parent = parent.parent!;
        return;
      }
    }

    if (parent.nodeType === NodeType.PATH) {
      const segNode: Node = {
        nodeType: NodeType.PATH_SEGMENT,
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

    if (parent.nodeType === NodeType.PATH_SEGMENT) {
      parent.children.push(node);
      setEnd(node.end);
      return;
    }

    throw new SyntaxError(`Unexpected syntax at ${node.start}`);
  };

  const setEnd = (end: number): void => {
    for (let node: Node | null = parent; node !== null; node = node.parent) {
      node.end = end;
    }
  };

  let length = tokenizePattern(str, {

    onVariable(name, start, end) {
      if (parent.nodeType === NodeType.VARIABLE) {
        parent = parent.parent!;
      }
      const node: Node = {
        nodeType: NodeType.VARIABLE,
        name,
        constraint: null,
        parent,
        start,
        end,
      };

      pushNode(node);
      parent = node;
    },

    onAltStart(start, end) {
      altDepth++;

      const altNode: Node = {
        nodeType: NodeType.ALT,
        children: [],
        parent,
        start,
        end,
      };

      const pathNode: Node = {
        nodeType: NodeType.PATH,
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

      while (parent.nodeType !== NodeType.ALT) {
        if (!parent.parent) {
          throw new SyntaxError(`Unexpected alternation end at ${start}`);
        }
        parent = parent.parent;
      }
      setEnd(end);
      parent = parent.parent!;
    },

    onAltSeparator(start, end) {
      while (parent.nodeType !== NodeType.ALT) {
        if (!parent.parent) {
          throw new SyntaxError(`Unexpected alternation separator at ${start}`);
        }
        parent = parent.parent;
      }

      const node: Node = {
        nodeType: NodeType.PATH,
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
        nodeType: NodeType.WILDCARD,
        greedy,
        parent,
        start,
        end,
      });
    },

    onRegExp(pattern, groupCount, start, end) {
      pushNode({
        nodeType: NodeType.REG_EXP,
        pattern,
        groupCount,
        parent,
        start,
        end,
      });
    },

    onText(value, start, end) {
      pushNode({
        nodeType: NodeType.TEXT,
        value,
        parent,
        start,
        end,
      });
    },

    onPathSeparator(start, end) {
      while (parent.nodeType !== NodeType.PATH) {
        parent = parent.parent!;
      }

      if (parent.children.length === 0) {
        parent.absolute = true;
        parent.start = start;
      }

      const node: Node = {
        nodeType: NodeType.PATH_SEGMENT,
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
