import {
  IAltNode,
  ILiteralNode,
  IPathNode,
  IRegExpNode,
  IVariableNode,
  IWildcardNode,
  NodeType,
  parseRoutePattern,
} from '../main/parseRoutePattern';

describe('parseRoutePattern', () => {

  test('parses wildcard', () => {
    const a: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 0, end: 1};
    const b: IWildcardNode = {nodeType: NodeType.WILDCARD, greedy: false, parent: a, start: 0, end: 1};
    a.children.push(b);

    expect(parseRoutePattern('*')).toEqual(a);
  });

  test('parses greedy wildcard', () => {
    const a: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 0, end: 2};
    const b: IWildcardNode = {nodeType: NodeType.WILDCARD, greedy: true, parent: a, start: 0, end: 2};
    a.children.push(b);

    expect(parseRoutePattern('**')).toEqual(a);
  });

  test('throws if sequential wildcards', () => {
    expect(() => parseRoutePattern('* *')).toThrow();
    expect(() => parseRoutePattern('* **')).toThrow();
    expect(() => parseRoutePattern('** *')).toThrow();
    expect(() => parseRoutePattern('** **')).toThrow();
  });

  test('parses literals', () => {
    const a: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 0, end: 7};
    const b: ILiteralNode = {nodeType: NodeType.LITERAL, value: 'foo', parent: a, start: 0, end: 3};
    const c: ILiteralNode = {nodeType: NodeType.LITERAL, value: 'bar', parent: a, start: 4, end: 7};
    a.children.push(b, c);

    expect(parseRoutePattern('foo/bar')).toEqual(a);
  });

  test('concatenates non-separated literals', () => {
    const a: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 0, end: 7};
    const b: ILiteralNode = {nodeType: NodeType.LITERAL, value: 'foobar', parent: a, start: 0, end: 7};
    a.children.push(b);

    expect(parseRoutePattern('foo bar')).toEqual(a);
  });

  test('parses separated literals', () => {
    const a: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 0, end: 19};
    const b: ILiteralNode = {nodeType: NodeType.LITERAL, value: 'foobar', parent: a, start: 0, end: 7};
    const c: ILiteralNode = {nodeType: NodeType.LITERAL, value: 'baz qux', parent: a, start: 10, end: 19};
    a.children.push(b, c);

    expect(parseRoutePattern('foo bar / "baz qux"')).toEqual(a);
  });

  test('parses reg exp', () => {
    const a: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 0, end: 5};
    const b: IRegExpNode = {nodeType: NodeType.REG_EXP, pattern: '\\d+', parent: a, start: 0, end: 5};
    a.children.push(b);

    expect(parseRoutePattern('(\\d+)')).toEqual(a);
  });

  test('throws if two sequential reg exps', () => {
    expect(() => parseRoutePattern('(\\d+)(\\d+)')).toThrow();
  });

  test('parses variable', () => {
    const a: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 0, end: 4};
    const b: IVariableNode = {nodeType: NodeType.VARIABLE, name: 'foo', constraint: null, parent: a, start: 0, end: 4};
    a.children.push(b);

    expect(parseRoutePattern(':foo')).toEqual(a);
  });

  test('parses variable with literal constraint', () => {
    const a: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 0, end: 12};
    const b: IVariableNode = {nodeType: NodeType.VARIABLE, name: 'foo', constraint: null, parent: a, start: 0, end: 12};
    const c: ILiteralNode = {nodeType: NodeType.LITERAL, value: 'barbaz', parent: b, start: 5, end: 12};

    b.constraint = c;
    a.children.push(b);

    expect(parseRoutePattern(':foo bar baz')).toEqual(a);
  });

  test('parses variable with quoted literal constraint', () => {
    const a: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 0, end: 9};
    const b: IVariableNode = {nodeType: NodeType.VARIABLE, name: 'foo', constraint: null, parent: a, start: 0, end: 9};
    const c: ILiteralNode = {nodeType: NodeType.LITERAL, value: 'bar', parent: b, start: 4, end: 9};

    b.constraint = c;
    a.children.push(b);

    expect(parseRoutePattern(':foo"bar"')).toEqual(a);
  });

  test('parses variable with reg exp constraint', () => {
    const a: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 0, end: 9};
    const b: IVariableNode = {nodeType: NodeType.VARIABLE, name: 'foo', constraint: null, parent: a, start: 0, end: 9};
    const c: IRegExpNode = {nodeType: NodeType.REG_EXP, pattern: '\\d+', parent: b, start: 4, end: 9};

    b.constraint = c;
    a.children.push(b);

    expect(parseRoutePattern(':foo(\\d+)')).toEqual(a);
  });

  test('parses path-separated variables', () => {
    const a: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 0, end: 9};
    const b: IVariableNode = {nodeType: NodeType.VARIABLE, name: 'foo', constraint: null, parent: a, start: 0, end: 4};
    const c: IVariableNode = {nodeType: NodeType.VARIABLE, name: 'bar', constraint: null, parent: a, start: 5, end: 9};

    a.children.push(b, c);

    expect(parseRoutePattern(':foo/:bar')).toEqual(a);
  });

  test('throws if sequential variables', () => {
    expect(() => parseRoutePattern(':foo :bar')).toThrow();
  });

  test('throws if condition is overridden by reg exp', () => {
    expect(() => parseRoutePattern(':foo"bar"(\\d+)')).toThrow();
  });

  test('throws if condition is overridden by literal', () => {
    expect(() => parseRoutePattern(':foo(\\d+)"bar"')).toThrow();
  });

  test('parses path with leading slash', () => {
    const a: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 2, end: 11};
    const b: ILiteralNode = {nodeType: NodeType.LITERAL, value: 'foo', parent: a, start: 2, end: 5};
    const c: ILiteralNode = {nodeType: NodeType.LITERAL, value: 'bar', parent: a, start: 8, end: 11};
    a.children.push(b, c);

    expect(parseRoutePattern('/ foo / bar ')).toEqual(a);
  });

  test('throws if sequential path separators', () => {
    expect(() => parseRoutePattern('//')).toThrow();
  });

  test('parses alternation with literals', () => {
    const root: IPathNode = {nodeType: NodeType.PATH, children: [], parent: null, start: 0, end: 10};
    const alt: IAltNode = {nodeType: NodeType.ALT, children: [], parent: root, start: 0, end: 10};
    const path1: IPathNode = {nodeType: NodeType.PATH, children: [], parent: alt, start: 1, end: 4};
    const path2: IPathNode = {nodeType: NodeType.PATH, children: [], parent: alt, start: 6, end: 9};
    const literal1: ILiteralNode = {nodeType: NodeType.LITERAL, value: 'foo', parent: path1, start: 1, end: 4};
    const literal2: ILiteralNode = {nodeType: NodeType.LITERAL, value: 'bar', parent: path2, start: 6, end: 9};

    root.children.push(alt);
    alt.children.push(path1, path2);
    path1.children.push(literal1);
    path2.children.push(literal2);

    expect(parseRoutePattern('{foo, bar}')).toEqual(root);
  });
});
