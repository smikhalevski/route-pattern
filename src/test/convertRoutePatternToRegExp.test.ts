import {convertNodeToRegExp} from '../main/convertNodeToRegExp';
import {parsePattern} from '../main';

describe('convertRoutePatternToRegExp', () => {

  test('converts variable', () => {
    expect(convertNodeToRegExp(parsePattern(':foo'))).toEqual({
      re: /^([^\\/]*)/,
      varMap: {foo: 1},
    });
  });

  test('converts variable with text constraint', () => {
    expect(convertNodeToRegExp(parsePattern(':foo"bar"'))).toEqual({
      re: /^(bar)/,
      varMap: {foo: 1},
    });
  });

  test('converts variable with regexp constraint', () => {
    expect(convertNodeToRegExp(parsePattern(':foo(\\d+)'))).toEqual({
      re: /^((?:\d+))/,
      varMap: {foo: 1},
    });
  });

  test('converts variable with alternation constraint', () => {
    expect(convertNodeToRegExp(parsePattern(':foo { foo, bar }'))).toEqual({
      re: /^((?:foo|bar))/,
      varMap: {foo: 1},
    });
  });

  test('converts variables with respect to regexp group count', () => {
    expect(convertNodeToRegExp(parsePattern('(([abc]))/:foo(\\d+)'))).toEqual({
      re: /^(?:([abc]))[\\/]((?:\d+))/,
      varMap: {foo: 2},
    });
  });

  test('converts text', () => {
    expect(convertNodeToRegExp(parsePattern('foo'))).toEqual({
      re: /^foo/,
      varMap: {},
    });
  });

  test('converts text with regexp control chars', () => {
    expect(convertNodeToRegExp(parsePattern('$fo[o]'))).toEqual({
      re: /^\$fo\[o\]/,
      varMap: {},
    });
  });

  test('converts wildcards', () => {
    expect(convertNodeToRegExp(parsePattern('*'))).toEqual({
      re: /^[^\\/]+?/,
      varMap: {},
    });
  });

  test('converts greedy wildcards', () => {
    expect(convertNodeToRegExp(parsePattern('**'))).toEqual({
      re: /^.+/,
      varMap: {},
    });
  });

  test('converts alternation', () => {
    expect(convertNodeToRegExp(parsePattern('{foo,bar}'))).toEqual({
      re: /^(?:foo|bar)/,
      varMap: {},
    });
  });

  test('converts alternation with leading path separator', () => {
    expect(convertNodeToRegExp(parsePattern('/{foo,bar}'))).toEqual({
      re: /^[\\/](?:foo|bar)/,
      varMap: {},
    });
  });

  test('converts alternation with path separator inside branch', () => {
    expect(convertNodeToRegExp(parsePattern('{ /foo, bar }'))).toEqual({
      re: /^(?:[\\/]foo|bar)/,
      varMap: {},
    });
  });

  test('converts complex pattern', () => {
    expect(convertNodeToRegExp(parsePattern('/aaa{ :foo{ /bbb, :bar(ccc|ddd) }/**}'))).toEqual({
      re: /^[\\/]aaa(?:((?:[\\/]bbb|((?:ccc|ddd))))[\\/].+)/,
      varMap: {foo: 1, bar: 2},
    });
  });
});
