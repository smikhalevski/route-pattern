import {
  AstNode,
  AstNodeType,
  IAltAstNode,
  ITextAstNode,
  IPathAstNode,
  IPathSegmentAstNode,
  IRegExpAstNode,
  IVariableAstNode,
  IWildcardAstNode,
} from './ast-types';

export interface IRoutePatternVisitor {
  onPath?: (node: IPathAstNode, next: () => void) => void;
  onPathSegment?: (node: IPathSegmentAstNode, next: () => void) => void;
  onAlt?: (node: IAltAstNode, next: () => void) => void;
  onVariable?: (node: IVariableAstNode, next: () => void) => void;
  onWildcard?: (node: IWildcardAstNode) => void;
  onRegExp?: (node: IRegExpAstNode) => void;
  onText?: (node: ITextAstNode) => void;
}

export function visitRoutePattern(node: AstNode | null | undefined, visitor: IRoutePatternVisitor): void {
  switch (node?.nodeType) {

    case AstNodeType.PATH:
      visitor.onPath?.(node, () => visitChildren(node.children, visitor));
      break;

    case AstNodeType.PATH_SEGMENT:
      visitor.onPathSegment?.(node, () => visitChildren(node.children, visitor));
      break;

    case AstNodeType.ALT:
      visitor.onAlt?.(node, () => visitChildren(node.children, visitor));
      break;

    case AstNodeType.VARIABLE:
      visitor.onVariable?.(node, () => visitRoutePattern(node.constraint, visitor));
      break;

    case AstNodeType.WILDCARD:
      visitor.onWildcard?.(node);
      break;

    case AstNodeType.REG_EXP:
      visitor.onRegExp?.(node);
      break;

    case AstNodeType.TEXT:
      visitor.onText?.(node);
      break;
  }
}

function visitChildren(nodes: Array<AstNode>, visitor: IRoutePatternVisitor): void {
  for (let i = 0; i < nodes.length; i++) {
    visitRoutePattern(nodes[i], visitor);
  }
}
