import {NodeType, parsePathPatternAst} from '../main/parsePathPatternAst';

describe('parsePathPatternAst', () => {

  test('parses complex expressions', () => {


    const rootNode = {
      nodeType: NodeType.PATH,
      children: [
        {
          nodeType: NodeType.LITERAL,
          parent: null,
          start: 1,
          end: 4,
          value: 'aaa',
        },
        {
          nodeType: NodeType.ALT,
          children: [
            {
              nodeType: NodeType.PATH,
              children: [
                {
                  nodeType: NodeType.VARIABLE,
                  name: 'foo',
                  constraint: {
                    nodeType: NodeType.REG_EXP,
                    pattern: /\d+/,
                    parent: '[Circular reference found] Truncated by IDE',
                    start: 12,
                    end: 17,
                  },
                  parent: '[Circular reference found] Truncated by IDE',
                  start: 7,
                  end: 11,
                },
              ],
              parent: '[Circular reference found] Truncated by IDE',
              start: 5,
              end: 6,
            },
          ],
          parent: '[Circular reference found] Truncated by IDE',
          start: 5,
          end: 6,
        },
        {
          nodeType: NodeType.ALT,
          children: [
            {
              nodeType: NodeType.PATH,
              children: [
                {
                  nodeType: NodeType.VARIABLE,
                  name: 'baz',
                  constraint: {
                    nodeType: NodeType.LITERAL,
                    value: 'qqq',
                    parent: '[Circular reference found] Truncated by IDE',
                    start: 25,
                    end: 30,
                  },
                  parent: '[Circular reference found] Truncated by IDE',
                  start: 20,
                  end: 24,
                },
              ],
              parent: '[Circular reference found] Truncated by IDE',
              start: 18,
              end: 19,
            },
          ],
          parent: '[Circular reference found] Truncated by IDE',
          start: 18,
          end: 19,
        },
      ],
      parent: null,
      start: 0,
      end: 35,
    };


    expect(parsePathPatternAst('/aaa/{ :foo (\\d+) , :baz "qqq" }/**')).toEqual({});
  });
});
