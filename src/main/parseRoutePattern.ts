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
  let last: Node = root;

  root.end = tokenizeRoutePattern(str, {

    onVariable(data, start, end) {
      if (parent.nodeType === NodeType.VARIABLE) {
        throw new SyntaxError(`Unexpected variable at ${start}`);
      }
      const node: IVariableNode = {nodeType: NodeType.VARIABLE, name: data, constraint: null, parent, start, end};
      parent.children.push(node);
      parent = node;
      last = node;
    },

    onAltStart(start, end) {
      if (parent.nodeType === NodeType.VARIABLE && parent.constraint != null) {
        throw new SyntaxError('Variable condition cannot be overridden');
      }
      if (parent.nodeType !== NodeType.VARIABLE && !(parent.nodeType === NodeType.PATH && parent.children.length === 0)) {
        throw new SyntaxError('Unexpected alternation');
      }

      const altNode: IAltNode = {nodeType: NodeType.ALT, children: [], parent, start, end};
      const pathNode: IPathNode = {nodeType: NodeType.PATH, children: [], parent: altNode, start, end};

      altNode.children.push(pathNode);

      if (parent.nodeType === NodeType.VARIABLE) {
        parent.constraint = altNode;
      } else {
        parent.children.push(altNode);
      }
      parent = pathNode;
      last = pathNode;
    },

    onAltEnd(start, end) {
      while (parent.nodeType !== NodeType.ALT) {
        if (!parent.parent) {
          throw new SyntaxError('Unexpected alt end');
        }
        parent = parent.parent;
      }
      parent.end = end;
      last = parent;
    },

    onAltSeparator(start, end) {
      while (parent.nodeType !== NodeType.ALT) {
        if (!parent.parent) {
          throw new SyntaxError('Unexpected alt separator');
        }
        parent = parent.parent;
      }

      const node: IPathNode = {nodeType: NodeType.PATH, children: [], parent, start, end};
      parent.children.push(node);
      parent = node;
      last = node;
    },

    onWildcard(greedy, start, end) {
      if (parent.nodeType === NodeType.VARIABLE && parent.constraint != null) {
        throw new SyntaxError('Variable condition cannot be overridden');
      }
      if (parent.nodeType !== NodeType.VARIABLE && !(parent.nodeType === NodeType.PATH && parent.children.length === 0)) {
        throw new SyntaxError('Unexpected wildcard');
      }
      const node: IWildcardNode = {nodeType: NodeType.WILDCARD, greedy, parent, start, end};
      last = node;

      if (parent.nodeType === NodeType.VARIABLE) {
        parent.constraint = node;
      } else {
        parent.children.push(node);
      }
    },

    onRegExp(pattern, start, end) {
      if (last?.nodeType === NodeType.REG_EXP) {
        throw new SyntaxError('Unexpected regular expression');
      }
      if (parent.nodeType === NodeType.VARIABLE && parent.constraint != null) {
        throw new SyntaxError('Variable condition cannot be overridden');
      }
      const node: IRegExpNode = {nodeType: NodeType.REG_EXP, pattern, parent, start, end};
      last = node;

      if (parent.nodeType === NodeType.VARIABLE) {
        parent.constraint = node;
      } else {
        parent.children.push(node);
      }
    },

    onLiteral(data, start, end) {
      if (last?.nodeType === NodeType.LITERAL) {
        last.value += data;
        last.end = end;
        return;
      }
      if (parent.nodeType === NodeType.VARIABLE && parent.constraint != null) {
        throw new SyntaxError('Variable condition cannot be overridden');
      }

      const node: ILiteralNode = {nodeType: NodeType.LITERAL, value: data, parent, start, end};
      last = node;

      if (parent.nodeType === NodeType.VARIABLE) {
        parent.constraint = node;
      } else {
        parent.children.push(node);
      }
    },

    onPathSeparator(start, end) {
      while (parent.nodeType !== NodeType.PATH) {
        if (!parent.parent) {
          throw new Error('Illegal state');
        }
        parent = parent.parent;
      }
      last = parent;
    },
  });

  return root;
}
