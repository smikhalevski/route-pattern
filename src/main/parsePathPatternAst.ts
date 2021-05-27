import {parsePathPattern} from './parsePathPattern';

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
  constraint: Node | null;
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
  pattern: RegExp;
}

export interface ILiteralNode extends INode {
  nodeType: NodeType.LITERAL;
  value: string;
}

export function parsePathPatternAst(str: string): IPathNode {

  let root: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 0, end: 0};

  let parent: IPathNode | IAltNode | IVariableNode = root;

  root.end = parsePathPattern(str, {

    variable(data, start, end) {
      if (parent.nodeType === NodeType.VARIABLE) {
        throw new SyntaxError('Unexpected variable');
      }
      const node: IVariableNode = {nodeType: NodeType.VARIABLE, name: data, constraint: null, parent, start, end};
      parent.children.push(node);
      parent = node;
    },

    altStart(start, end) {
      const altNode: IAltNode = {nodeType: NodeType.ALT, children: [], parent, start, end};
      const pathNode: IPathNode = {nodeType: NodeType.PATH, children: [], parent: altNode, start, end};

      altNode.children.push(pathNode);

      if (parent.nodeType === NodeType.VARIABLE) {
        parent.constraint = altNode;
      } else {
        parent.children.push(altNode);
      }
      parent = pathNode;
    },

    altEnd(start, end) {
      while (parent.nodeType !== NodeType.ALT) {
        if (!parent.parent) {
          throw new SyntaxError('Unexpected alt separator');
        }
        parent = parent.parent;
      }
    },

    altSeparator(start, end) {
      while (parent.nodeType !== NodeType.ALT) {
        if (!parent.parent) {
          throw new SyntaxError('Unexpected alt separator');
        }
        parent = parent.parent;
      }

      const node: IPathNode = {nodeType: NodeType.PATH, children: [], parent, start, end};
      (parent.parent as IAltNode).children.push({nodeType: NodeType.ALT, children: [node], parent, start, end});
      parent = node;
    },

    greedyWildcard(start, end) {
      const node: IWildcardNode = {nodeType: NodeType.WILDCARD, greedy: true, parent, start, end};

      if (parent.nodeType === NodeType.VARIABLE) {
        parent.constraint = node;
      } else {
        parent.children.push(node);
      }
    },

    wildcard(start, end) {
      const node: IWildcardNode = {nodeType: NodeType.WILDCARD, greedy: false, parent, start, end};

      if (parent.nodeType === NodeType.VARIABLE) {
        parent.constraint = node;
      } else {
        parent.children.push(node);
      }
    },

    regExp(pattern, start, end) {
      const node: IRegExpNode = {nodeType: NodeType.REG_EXP, pattern: RegExp(pattern), parent, start, end};

      if (parent.nodeType === NodeType.VARIABLE) {
        parent.constraint = node;
      } else {
        parent.children.push(node);
      }
    },

    literal(data, start, end) {
      const node: ILiteralNode = {nodeType: NodeType.LITERAL, value: data, parent, start, end};

      if (parent.nodeType === NodeType.VARIABLE) {
        parent.constraint = node;
      } else {
        parent.children.push(node);
      }
    },

    pathSeparator(start, end) {
      if (parent.nodeType === NodeType.VARIABLE) {
        if (!parent.parent) {
          throw new Error('Illegal state');
        }
        parent = parent.parent;
      }
    },
  });

  return root;
}
