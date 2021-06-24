import {parsePattern} from '../main/parsePattern';
import {Node, NodeType} from '../main/ast-types';

describe('parsePattern', () => {

  test('parses blank pattern', () => {
    expect(parsePattern(' ')).toEqual<Node>({
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 0,
    });
  });

  test('parses absolute path', () => {
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: true,
      children: [],
      parent: null,
      start: 1,
      end: 2,
    };

    const segNode: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 1,
      end: 2,
    };
    rootNode.children.push(segNode);

    expect(parsePattern(' / ')).toEqual(rootNode);
  });

  test('parses sequential path separators', () => {
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: true,
      children: [],
      parent: null,
      start: 0,
      end: 2,
    };

    const segNode1: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 1,
    };
    rootNode.children.push(segNode1);

    const segNode2: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 1,
      end: 2,
    };
    rootNode.children.push(segNode2);

    expect(parsePattern('//')).toEqual(rootNode);
  });

  test('parses wildcard', () => {
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 1,
    };

    const segNode: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 1,
    };
    rootNode.children.push(segNode);

    const wildcardNode: Node = {
      nodeType: NodeType.WILDCARD,
      greedy: false,
      parent: segNode,
      start: 0,
      end: 1,
    };
    segNode.children.push(wildcardNode);

    expect(parsePattern('*')).toEqual(rootNode);
  });

  test('parses greedy wildcard', () => {
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 2,
    };

    const segNode: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 2,
    };
    rootNode.children.push(segNode);

    const wildcardNode: Node = {
      nodeType: NodeType.WILDCARD,
      greedy: true,
      parent: segNode,
      start: 0,
      end: 2,
    };
    segNode.children.push(wildcardNode);

    expect(parsePattern('**')).toEqual(rootNode);
  });

  test('parses text', () => {
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 7,
    };

    const segNode1: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 3,
    };
    rootNode.children.push(segNode1);

    const textNode1: Node = {
      nodeType: NodeType.TEXT,
      value: 'foo',
      parent: segNode1,
      start: 0,
      end: 3,
    };
    segNode1.children.push(textNode1);

    const segNode2: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 3,
      end: 7,
    };
    rootNode.children.push(segNode2);

    const textNode2: Node = {
      nodeType: NodeType.TEXT,
      value: 'bar',
      parent: segNode2,
      start: 4,
      end: 7,
    };
    segNode2.children.push(textNode2);

    expect(parsePattern('foo/bar')).toEqual(rootNode);
  });

  test('parses quoted text', () => {
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 1,
      end: 10,
    };

    const segNode: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 1,
      end: 10,
    };
    rootNode.children.push(segNode);

    const textNode: Node = {
      nodeType: NodeType.TEXT,
      value: 'foo bar',
      parent: segNode,
      start: 1,
      end: 10,
    };
    segNode.children.push(textNode);

    expect(parsePattern(' "foo bar" ')).toEqual(rootNode);
  });

  test('parses regexp', () => {
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 5,
    };

    const segNode: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 5,
    };
    rootNode.children.push(segNode);

    const regExpNode: Node = {
      nodeType: NodeType.REG_EXP,
      pattern: '\\d+',
      groupCount: 0,
      parent: segNode,
      start: 0,
      end: 5,
    };
    segNode.children.push(regExpNode);

    expect(parsePattern('(\\d+)')).toEqual(rootNode);
  });

  test('parses variable', () => {
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 4,
    };

    const segNode: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 4,
    };
    rootNode.children.push(segNode);

    const varNode: Node = {
      nodeType: NodeType.VARIABLE,
      name: 'foo',
      constraint: null,
      parent: segNode,
      start: 0,
      end: 4,
    };
    segNode.children.push(varNode);

    expect(parsePattern(':foo')).toEqual(rootNode);
  });

  test('parses variable with text constraint', () => {
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 8,
    };

    const segNode: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 8,
    };
    rootNode.children.push(segNode);

    const varNode: Node = {
      nodeType: NodeType.VARIABLE,
      name: 'foo',
      constraint: null,
      parent: segNode,
      start: 0,
      end: 8,
    };
    segNode.children.push(varNode);

    varNode.constraint = {
      nodeType: NodeType.TEXT,
      value: 'bar',
      parent: varNode,
      start: 5,
      end: 8,
    };

    expect(parsePattern(':foo bar')).toEqual(rootNode);
  });

  test('parses variable with quoted text constraint', () => {
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 9,
    };

    const segNode: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 9,
    };
    rootNode.children.push(segNode);

    const varNode: Node = {
      nodeType: NodeType.VARIABLE,
      name: 'foo',
      constraint: null,
      parent: segNode,
      start: 0,
      end: 9,
    };
    segNode.children.push(varNode);

    varNode.constraint = {
      nodeType: NodeType.TEXT,
      value: 'bar',
      parent: varNode,
      start: 4,
      end: 9,
    };

    expect(parsePattern(':foo"bar"')).toEqual(rootNode);
  });

  test('does not overwrite variable constraint', () => {
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 13,
    };

    const segNode: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 13,
    };
    rootNode.children.push(segNode);

    const varNode: Node = {
      nodeType: NodeType.VARIABLE,
      name: 'foo',
      constraint: null,
      parent: segNode,
      start: 0,
      end: 9,
    };
    segNode.children.push(varNode);

    varNode.constraint = {
      nodeType: NodeType.TEXT,
      value: 'bar',
      parent: varNode,
      start: 4,
      end: 9,
    };

    const textNode: Node = {
      nodeType: NodeType.TEXT,
      value: 'qux',
      parent: segNode,
      start: 10,
      end: 13,
    };
    segNode.children.push(textNode);

    expect(parsePattern(':foo"bar" qux')).toEqual(rootNode);
  });

  test('parses sequential variables', () => {
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 8,
    };

    const segNode: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 8,
    };
    rootNode.children.push(segNode);

    const var1Node: Node = {
      nodeType: NodeType.VARIABLE,
      name: 'foo',
      constraint: null,
      parent: segNode,
      start: 0,
      end: 4,
    };
    segNode.children.push(var1Node);

    const var2Node: Node = {
      nodeType: NodeType.VARIABLE,
      name: 'bar',
      constraint: null,
      parent: segNode,
      start: 4,
      end: 8,
    };
    segNode.children.push(var2Node);

    expect(parsePattern(':foo:bar')).toEqual(rootNode);
  });

  test('parses empty alternation', () => {
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 2,
    };

    const segNode: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 2,
    };
    rootNode.children.push(segNode);

    const altNode: Node = {
      nodeType: NodeType.ALT,
      children: [],
      parent: segNode,
      start: 0,
      end: 2,
    };
    segNode.children.push(altNode);

    const pathNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: altNode,
      start: 1,
      end: 1,
    };
    altNode.children.push(pathNode);

    expect(parsePattern('{}')).toEqual(rootNode);
  });

  test('parses alternation', () => {
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 10,
    };

    const segNode: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: rootNode,
      start: 0,
      end: 10,
    };
    rootNode.children.push(segNode);

    const altNode: Node = {
      nodeType: NodeType.ALT,
      children: [],
      parent: segNode,
      start: 0,
      end: 10,
    };
    segNode.children.push(altNode);

    const pathNode1: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: altNode,
      start: 1,
      end: 4,
    };
    altNode.children.push(pathNode1);

    const segNode1: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: pathNode1,
      start: 1,
      end: 4,
    };
    pathNode1.children.push(segNode1);

    const textNode1: Node = {
      nodeType: NodeType.TEXT,
      value: 'foo',
      parent: segNode1,
      start: 1,
      end: 4,
    };
    segNode1.children.push(textNode1);

    const pathNode2: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: altNode,
      start: 6,
      end: 9,
    };
    altNode.children.push(pathNode2);

    const segNode2: Node = {
      nodeType: NodeType.PATH_SEGMENT,
      children: [],
      parent: pathNode2,
      start: 6,
      end: 9,
    };
    pathNode2.children.push(segNode2);

    const textNode2: Node = {
      nodeType: NodeType.TEXT,
      value: 'bar',
      parent: segNode2,
      start: 6,
      end: 9,
    };
    segNode2.children.push(textNode2);

    expect(parsePattern('{foo, bar}')).toEqual(rootNode);
  });

  test('throws on unexpected alternation separator', () => {
    expect(() => parsePattern('foo, bar}')).toThrow();
  });

  test('throws on unexpected alternation end', () => {
    expect(() => parsePattern('foo}')).toThrow();
  });

  test('throws on unterminated alternation', () => {
    expect(() => parsePattern('{foo')).toThrow();
  });
});
