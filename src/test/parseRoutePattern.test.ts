import {parseRoutePattern} from '../main/parseRoutePattern';
import {AstNode, AstNodeType} from '../main/ast-types';

describe('parseRoutePattern', () => {

  test('parses blank pattern', () => {
    expect(parseRoutePattern(' ')).toEqual(<AstNode>{
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 0,
    });
  });

  test('parses absolute path', () => {
    const rootNode: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: true,
      children: [],
      parent: null,
      start: 1,
      end: 2,
    };

    const segNode: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 1,
      end: 2,
    };
    rootNode.children.push(segNode);

    expect(parseRoutePattern(' / ')).toEqual(rootNode);
  });

  test('parses sequential path separators', () => {
    const rootNode: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: true,
      children: [],
      parent: null,
      start: 0,
      end: 2,
    };

    const segNode1: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 1,
    };
    rootNode.children.push(segNode1);

    const segNode2: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 1,
      end: 2,
    };
    rootNode.children.push(segNode2);

    expect(parseRoutePattern('//')).toEqual(rootNode);
  });

  test('parses wildcard', () => {
    const rootNode: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 1,
    };

    const segNode: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 1,
    };
    rootNode.children.push(segNode);

    const wildcardNode: AstNode = {
      nodeType: AstNodeType.WILDCARD,
      greedy: false,
      parent: segNode,
      start: 0,
      end: 1,
    };
    segNode.children.push(wildcardNode);

    expect(parseRoutePattern('*')).toEqual(rootNode);
  });

  test('parses greedy wildcard', () => {
    const rootNode: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 2,
    };

    const segNode: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 2,
    };
    rootNode.children.push(segNode);

    const wildcardNode: AstNode = {
      nodeType: AstNodeType.WILDCARD,
      greedy: true,
      parent: segNode,
      start: 0,
      end: 2,
    };
    segNode.children.push(wildcardNode);

    expect(parseRoutePattern('**')).toEqual(rootNode);
  });

  test('parses text', () => {
    const rootNode: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 7,
    };

    const segNode1: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 3,
    };
    rootNode.children.push(segNode1);

    const textNode1: AstNode = {
      nodeType: AstNodeType.TEXT,
      value: 'foo',
      parent: segNode1,
      start: 0,
      end: 3,
    };
    segNode1.children.push(textNode1);

    const segNode2: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 3,
      end: 7,
    };
    rootNode.children.push(segNode2);

    const textNode2: AstNode = {
      nodeType: AstNodeType.TEXT,
      value: 'bar',
      parent: segNode2,
      start: 4,
      end: 7,
    };
    segNode2.children.push(textNode2);

    expect(parseRoutePattern('foo/bar')).toEqual(rootNode);
  });

  test('parses quoted text', () => {
    const rootNode: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 1,
      end: 10,
    };

    const segNode: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 1,
      end: 10,
    };
    rootNode.children.push(segNode);

    const textNode: AstNode = {
      nodeType: AstNodeType.TEXT,
      value: 'foo bar',
      parent: segNode,
      start: 1,
      end: 10,
    };
    segNode.children.push(textNode);

    expect(parseRoutePattern(' "foo bar" ')).toEqual(rootNode);
  });

  test('parses regexp', () => {
    const rootNode: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 5,
    };

    const segNode: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 5,
    };
    rootNode.children.push(segNode);

    const regExpNode: AstNode = {
      nodeType: AstNodeType.REG_EXP,
      pattern: '\\d+',
      groupCount: 0,
      parent: segNode,
      start: 0,
      end: 5,
    };
    segNode.children.push(regExpNode);

    expect(parseRoutePattern('(\\d+)')).toEqual(rootNode);
  });

  test('parses variable', () => {
    const rootNode: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 4,
    };

    const segNode: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 4,
    };
    rootNode.children.push(segNode);

    const varNode: AstNode = {
      nodeType: AstNodeType.VARIABLE,
      name: 'foo',
      constraint: null,
      parent: segNode,
      start: 0,
      end: 4,
    };
    segNode.children.push(varNode);

    expect(parseRoutePattern(':foo')).toEqual(rootNode);
  });

  test('parses variable with text constraint', () => {
    const rootNode: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 8,
    };

    const segNode: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 8,
    };
    rootNode.children.push(segNode);

    const varNode: AstNode = {
      nodeType: AstNodeType.VARIABLE,
      name: 'foo',
      constraint: null,
      parent: segNode,
      start: 0,
      end: 8,
    };
    segNode.children.push(varNode);

    varNode.constraint = {
      nodeType: AstNodeType.TEXT,
      value: 'bar',
      parent: varNode,
      start: 5,
      end: 8,
    };

    expect(parseRoutePattern(':foo bar')).toEqual(rootNode);
  });

  test('parses variable with quoted text constraint', () => {
    const rootNode: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 9,
    };

    const segNode: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 9,
    };
    rootNode.children.push(segNode);

    const varNode: AstNode = {
      nodeType: AstNodeType.VARIABLE,
      name: 'foo',
      constraint: null,
      parent: segNode,
      start: 0,
      end: 9,
    };
    segNode.children.push(varNode);

    varNode.constraint = {
      nodeType: AstNodeType.TEXT,
      value: 'bar',
      parent: varNode,
      start: 4,
      end: 9,
    };

    expect(parseRoutePattern(':foo"bar"')).toEqual(rootNode);
  });

  test('does not overwrite variable constraint', () => {
    const rootNode: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 13,
    };

    const segNode: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 13,
    };
    rootNode.children.push(segNode);

    const varNode: AstNode = {
      nodeType: AstNodeType.VARIABLE,
      name: 'foo',
      constraint: null,
      parent: segNode,
      start: 0,
      end: 9,
    };
    segNode.children.push(varNode);

    varNode.constraint = {
      nodeType: AstNodeType.TEXT,
      value: 'bar',
      parent: varNode,
      start: 4,
      end: 9,
    };

    const textNode: AstNode = {
      nodeType: AstNodeType.TEXT,
      value: 'qux',
      parent: segNode,
      start: 10,
      end: 13,
    };
    segNode.children.push(textNode);

    expect(parseRoutePattern(':foo"bar" qux')).toEqual(rootNode);
  });

  test('throws on sequential variables', () => {
    expect(() => parseRoutePattern(':foo :bar')).toThrow();
  });

  test('parses empty alternation', () => {
    const rootNode: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 2,
    };

    const segNode: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 2,
    };
    rootNode.children.push(segNode);

    const altNode: AstNode = {
      nodeType: AstNodeType.ALT,
      children: [],
      parent: segNode,
      start: 0,
      end: 2,
    };
    segNode.children.push(altNode);

    const pathNode: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: altNode,
      start: 1,
      end: 1,
    };
    altNode.children.push(pathNode);

    expect(parseRoutePattern('{}')).toEqual(rootNode);
  });

  test('parses alternation', () => {
    const rootNode: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 10,
    };

    const segNode: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 10,
    };
    rootNode.children.push(segNode);

    const altNode: AstNode = {
      nodeType: AstNodeType.ALT,
      children: [],
      parent: segNode,
      start: 0,
      end: 10,
    };
    segNode.children.push(altNode);

    const pathNode1: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: altNode,
      start: 1,
      end: 4,
    };
    altNode.children.push(pathNode1);

    const segNode1: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: pathNode1,
      start: 1,
      end: 4,
    };
    pathNode1.children.push(segNode1);

    const textNode1: AstNode = {
      nodeType: AstNodeType.TEXT,
      value: 'foo',
      parent: segNode1,
      start: 1,
      end: 4,
    };
    segNode1.children.push(textNode1);

    const pathNode2: AstNode = {
      nodeType: AstNodeType.PATH,
      absolute: false,
      children: [],
      parent: altNode,
      start: 6,
      end: 9,
    };
    altNode.children.push(pathNode2);

    const segNode2: AstNode = {
      nodeType: AstNodeType.PATH_SEGMENT,
      children: [],
      parent: pathNode2,
      start: 6,
      end: 9,
    };
    pathNode2.children.push(segNode2);

    const textNode2: AstNode = {
      nodeType: AstNodeType.TEXT,
      value: 'bar',
      parent: segNode2,
      start: 6,
      end: 9,
    };
    segNode2.children.push(textNode2);

    expect(parseRoutePattern('{foo, bar}')).toEqual(rootNode);
  });

  test('throws on unexpected alternation separator', () => {
    expect(() => parseRoutePattern('foo, bar}')).toThrow();
  });

  test('throws on unexpected alternation end', () => {
    expect(() => parseRoutePattern('foo}')).toThrow();
  });

  test('throws on unterminated alternation', () => {
    expect(() => parseRoutePattern('{foo')).toThrow();
  });
});
