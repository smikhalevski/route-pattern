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
  onPath?: (node: IPathNode, next: () => void) => void;
  onPathSegment?: (node: IPathSegmentNode, next: () => void) => void;
  onAlt?: (node: IAltNode, next: () => void) => void;
  onVariable?: (node: IVariableNode, next: () => void) => void;
  onWildcard?: (node: IWildcardNode) => void;
  onRegExp?: (node: IRegExpNode) => void;
  onText?: (node: ITextNode) => void;
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
      visitor.onPath?.(node, () => visitChildren(node.children, visitor));
      break;

    case NodeType.PATH_SEGMENT:
      visitor.onPathSegment?.(node, () => visitChildren(node.children, visitor));
      break;

    case NodeType.ALT:
      visitor.onAlt?.(node, () => visitChildren(node.children, visitor));
      break;

    case NodeType.VARIABLE:
      visitor.onVariable?.(node, () => visitNode(node.constraint, visitor));
      break;

    case NodeType.WILDCARD:
      visitor.onWildcard?.(node);
      break;

    case NodeType.REG_EXP:
      visitor.onRegExp?.(node);
      break;

    case NodeType.TEXT:
      visitor.onText?.(node);
      break;
  }
}

function visitChildren(nodes: Array<Node>, visitor: INodeVisitor): void {
  for (let i = 0; i < nodes.length; i++) {
    visitNode(nodes[i], visitor);
  }
}
