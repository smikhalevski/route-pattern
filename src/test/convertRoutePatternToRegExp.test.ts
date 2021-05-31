import {convertRoutePatternToRegExp} from '../main/convertRoutePatternToRegExp';

describe('convertRoutePatternToRegExp', () => {

  test('converts alternation', () => {
    expect(convertRoutePatternToRegExp('{foo,bar}')).toEqual(/^(?:foo|bar)/);
  });

  test('converts variable', () => {
    expect(convertRoutePatternToRegExp(':foo')).toEqual( /^([^\\\/]*)/);
  });

  test('converts variable with literal constraint', () => {
    expect(convertRoutePatternToRegExp(':foo"bar"')).toEqual( /^(bar)/);
  });

  test('converts variable with regexp constraint', () => {
    expect(convertRoutePatternToRegExp(':foo(\\d+)')).toEqual( /^((?:\d+))/);
  });
});
