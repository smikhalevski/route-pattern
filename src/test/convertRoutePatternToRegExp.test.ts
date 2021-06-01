import {convertRoutePatternToRegExp} from '../main/convertRoutePatternToRegExp';
import {parseRoutePattern} from '../main';

describe('convertRoutePatternToRegExp', () => {

  test('converts variable', () => {
    expect(convertRoutePatternToRegExp(parseRoutePattern(':foo'))).toEqual({
      re: /^([^\\/]*)/,
      vars: {foo: 1},
    });
  });

  test('converts variable with text constraint', () => {
    expect(convertRoutePatternToRegExp(parseRoutePattern(':foo"bar"'))).toEqual({
      re: /^(bar)/,
      vars: {foo: 1},
    });
  });

  test('converts variable with regexp constraint', () => {
    expect(convertRoutePatternToRegExp(parseRoutePattern(':foo(\\d+)'))).toEqual({
      re: /^((?:\d+))/,
      vars: {foo: 1},
    });
  });

  test('converts variable with alternation constraint', () => {
    expect(convertRoutePatternToRegExp(parseRoutePattern(':foo { foo, bar }'))).toEqual({
      re: /^((?:foo|bar))/,
      vars: {foo: 1},
    });
  });

  test('converts variables with respect to regexp group count', () => {
    expect(convertRoutePatternToRegExp(parseRoutePattern('(([abc]))/:foo(\\d+)'))).toEqual({
      re: /^(?:([abc]))[\\/]((?:\d+))/,
      vars: {foo: 2},
    });
  });

  test('converts text', () => {
    expect(convertRoutePatternToRegExp(parseRoutePattern('foo'))).toEqual({
      re: /^foo/,
      vars: {},
    });
  });

  test('converts text with regexp control chars', () => {
    expect(convertRoutePatternToRegExp(parseRoutePattern('$fo[o]'))).toEqual({
      re: /^\$fo\[o\]/,
      vars: {},
    });
  });

  test('converts wildcards', () => {
    expect(convertRoutePatternToRegExp(parseRoutePattern('*'))).toEqual({
      re: /^[^\\/]+?/,
      vars: {},
    });
  });

  test('converts greedy wildcards', () => {
    expect(convertRoutePatternToRegExp(parseRoutePattern('**'))).toEqual({
      re: /^.+/,
      vars: {},
    });
  });

  test('converts alternation', () => {
    expect(convertRoutePatternToRegExp(parseRoutePattern('{foo,bar}'))).toEqual({
      re: /^(?:foo|bar)/,
      vars: {},
    });
  });

  test('converts alternation with leading path separator', () => {
    expect(convertRoutePatternToRegExp(parseRoutePattern('/{foo,bar}'))).toEqual({
      re: /^[\\/](?:foo|bar)/,
      vars: {},
    });
  });

  test('converts alternation with path separator inside branch', () => {
    expect(convertRoutePatternToRegExp(parseRoutePattern('{ /foo, bar }'))).toEqual({
      re: /^(?:[\\/]foo|bar)/,
      vars: {},
    });
  });

  test('converts complex pattern', () => {
    expect(convertRoutePatternToRegExp(parseRoutePattern('/aaa{ :foo{ /bbb, :bar(ccc|ddd) }/**}'))).toEqual({
      re: /^[\\/]aaa(?:((?:[\\/]bbb|((?:ccc|ddd))))[\\/].+)/,
      vars: {foo: 1, bar: 2},
    });
  });
});
