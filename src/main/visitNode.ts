import {
  IAltNode,
  IPathNode,
  IPathSegmentNode,
  IRegExpNode,
  ITextNode,
  IVariableNode,
  IWildcardNode,
  Node,
  NodeType,
} from './ast-types';

export interface INodeVisitor {
  path?(node: IPathNode, next: () => void): void;
  pathSegment?(node: IPathSegmentNode, next: () => void): void;
  alt?(node: IAltNode, next: () => void): void;
  variable?(node: IVariableNode, next: () => void): void;
  wildcard?(node: IWildcardNode): void;
  regExp?(node: IRegExpNode): void;
  text?(node: ITextNode): void;
}

/**
 * The pattern AST visitor.
 *
 * @param node The pattern AST root node to visit.
 * @param visitor The set of callbacks to invoke when particular node is visited.
 */
export function visitNode(node: Node | null | undefined, visitor: INodeVisitor): void {
  switch (node?.nodeType) {

    case NodeType.PATH:
      visitor.path?.(node, () => visitChildren(node.children, visitor));
      break;

    case NodeType.PATH_SEGMENT:
      visitor.pathSegment?.(node, () => visitChildren(node.children, visitor));
      break;

    case NodeType.ALT:
      visitor.alt?.(node, () => visitChildren(node.children, visitor));
      break;

    case NodeType.VARIABLE:
      visitor.variable?.(node, () => visitNode(node.constraint, visitor));
      break;

    case NodeType.WILDCARD:
      visitor.wildcard?.(node);
      break;

    case NodeType.REG_EXP:
      visitor.regExp?.(node);
      break;

    case NodeType.TEXT:
      visitor.text?.(node);
      break;
  }
}

function visitChildren(nodes: Node[], visitor: INodeVisitor): void {
  for (let i = 0; i < nodes.length; i++) {
    visitNode(nodes[i], visitor);
  }
}
