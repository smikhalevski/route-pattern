import {tokenizeRoutePattern} from './tokenizeRoutePattern';

export const enum NodeType {
  PATH = 'path',
  VARIABLE = 'variable',
  ALT = 'alt',
  WILDCARD = 'wildcard',
  REG_EXP = 'reg_exp',
  LITERAL = 'literal',
}

export type Node =
    | IPathNode
    | IVariableNode
    | IAltNode
    | IWildcardNode
    | IRegExpNode
    | ILiteralNode;

export interface INode {
  parent: IPathNode | IAltNode | IVariableNode | null;
  start: number;
  end: number;
}

export interface IPathNode extends INode {
  nodeType: NodeType.PATH;
  children: Array<Node>;
}

export interface IVariableNode extends INode {
  nodeType: NodeType.VARIABLE;
  name: string;
  constraint: ILiteralNode | IRegExpNode | IAltNode | IWildcardNode | null;
}

export interface IAltNode extends INode {
  nodeType: NodeType.ALT;
  children: Array<Node>;
}

export interface IWildcardNode extends INode {
  nodeType: NodeType.WILDCARD;
  greedy: boolean;
}

export interface IRegExpNode extends INode {
  nodeType: NodeType.REG_EXP;
  pattern: string;
}

export interface ILiteralNode extends INode {
  nodeType: NodeType.LITERAL;
  value: string;
}

export function parseRoutePattern(str: string): IPathNode {

  let root: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 0, end: 0};

  let parent: IPathNode | IAltNode | IVariableNode = root;
  let separated: boolean | undefined;

  const pushNode = (node: Node): void => {
    if (parent.nodeType === NodeType.VARIABLE) {
      if (parent.constraint) {
        throw new Error(`Variable constraint is redefined at ${node.start}`);
      }
      if (node.nodeType === NodeType.VARIABLE || node.nodeType === NodeType.PATH) {
        throw new Error(`Variables are nested at ${node.start}`);
      }
      parent.constraint = node;
    } else {
      if (parent.children.length !== 0 && separated === false) {
        throw new Error(`Expected path separator at ${node.start}`);
      }
      if (parent.nodeType === NodeType.PATH && parent.children.length === 0) {
        parent.start = node.start;
      }
      parent.children.push(node);
      separated = false;
    }
    shiftEnd(node.end);
  };

  const shiftEnd = (end: number) => {
    for (let p: typeof parent | null = parent; p != null; p = p.parent) {
      p.end = end;
    }
  };

  tokenizeRoutePattern(str, {

    onVariable(data, start, end) {
      const node: IVariableNode = {nodeType: NodeType.VARIABLE, name: data, constraint: null, parent, start, end};
      pushNode(node);
      parent = node;
    },

    onAltStart(start, end) {
      const altNode: IAltNode = {nodeType: NodeType.ALT, children: [], parent, start, end};
      const pathNode: IPathNode = {nodeType: NodeType.PATH, children: [], parent: altNode, start: start + 1, end: start + 1};

      altNode.children.push(pathNode);
      pushNode(altNode);
      parent = pathNode;
      separated = true;
    },

    onAltEnd(start, end) {
      while (parent.nodeType !== NodeType.ALT) {
        if (!parent.parent) {
          throw new SyntaxError(`Unexpected alternation end at ${start}`);
        }
        parent = parent.parent;
      }
      shiftEnd(end);
    },

    onAltSeparator(start, end) {
      while (parent.nodeType !== NodeType.ALT) {
        if (!parent.parent) {
          throw new SyntaxError(`Unexpected alternation separator at ${start}`);
        }
        parent = parent.parent;
      }
      separated = true;
      const node: IPathNode = {nodeType: NodeType.PATH, children: [], parent, start: start + 1, end: start + 1};
      pushNode(node);
      parent = node;
      separated = true;
    },

    onWildcard(greedy, start, end) {
      pushNode({nodeType: NodeType.WILDCARD, greedy, parent, start, end});
    },

    onRegExp(pattern, start, end) {
      pushNode({nodeType: NodeType.REG_EXP, pattern, parent, start, end});
    },

    onLiteral(data, start, end) {
      if (!separated) {
        const lastNode =
            parent.nodeType === NodeType.VARIABLE ? parent.constraint :
            parent.nodeType === NodeType.PATH ? parent.children[parent.children.length - 1] :
            null;

        if (lastNode?.nodeType === NodeType.LITERAL) {
          lastNode.value += data;
          lastNode.end = end;
          shiftEnd(end);
          return;
        }
      }
      pushNode({nodeType: NodeType.LITERAL, value: data, parent, start, end});
    },

    onPathSeparator(start) {
      if (separated) {
        throw new SyntaxError(`Unexpected path separator at ${start}`);
      }
      while (parent.nodeType !== NodeType.PATH) {
        parent = parent.parent!;
      }
      separated = true;
    },
  });

  return root;
}
