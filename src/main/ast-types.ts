export const enum AstNodeType {
  PATH,
  PATH_SEGMENT,
  VARIABLE,
  ALT,
  WILDCARD,
  REG_EXP,
  TEXT,
}

export type AstNode =
    | IPathAstNode
    | IPathSegmentAstNode
    | IAltAstNode
    | IVariableAstNode
    | IWildcardAstNode
    | IRegExpAstNode
    | ITextAstNode;

export interface IAstNode {
  parent: AstNode | null;
  start: number;
  end: number;
}

export interface IPathAstNode extends IAstNode {
  nodeType: AstNodeType.PATH;
  children: Array<AstNode>;
  absolute: boolean;
}

export interface IPathSegmentAstNode extends IAstNode {
  nodeType: AstNodeType.PATH_SEGMENT;
  children: Array<AstNode>;
}

export interface IAltAstNode extends IAstNode {
  nodeType: AstNodeType.ALT;
  children: Array<AstNode>;
}

export interface IVariableAstNode extends IAstNode {
  nodeType: AstNodeType.VARIABLE;
  name: string;
  constraint: AstNode | null;
}

export interface IWildcardAstNode extends IAstNode {
  nodeType: AstNodeType.WILDCARD;
  greedy: boolean;
}

export interface IRegExpAstNode extends IAstNode {
  nodeType: AstNodeType.REG_EXP;
  pattern: string;
  groupCount: number;
}

export interface ITextAstNode extends IAstNode {
  nodeType: AstNodeType.TEXT;
  value: string;
}
