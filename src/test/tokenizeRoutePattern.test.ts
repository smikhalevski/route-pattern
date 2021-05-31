import {RoutePatternTokenizerOptions, tokenizeRoutePattern} from '../main/tokenizeRoutePattern';

describe('tokenizeRoutePattern', () => {

  const onVariableMock = jest.fn();
  const onAltStartMock = jest.fn();
  const onAltEndMock = jest.fn();
  const onAltSeparatorMock = jest.fn();
  const onWildcardMock = jest.fn();
  const onRegExpMock = jest.fn();
  const onLiteralMock = jest.fn();
  const onPathSeparatorMock = jest.fn();

  const options: RoutePatternTokenizerOptions = {
    onVariable: onVariableMock,
    onAltStart: onAltStartMock,
    onAltEnd: onAltEndMock,
    onAltSeparator: onAltSeparatorMock,
    onWildcard: onWildcardMock,
    onRegExp: onRegExpMock,
    onLiteral: onLiteralMock,
    onPathSeparator: onPathSeparatorMock,
  };

  beforeEach(() => {
    onVariableMock.mockReset();
    onAltStartMock.mockReset();
    onAltEndMock.mockReset();
    onAltSeparatorMock.mockReset();
    onWildcardMock.mockReset();
    onRegExpMock.mockReset();
    onLiteralMock.mockReset();
    onPathSeparatorMock.mockReset();
  });

  test('does not call callbacks on blank string', () => {
    expect(tokenizeRoutePattern('', options)).toBe(0);
    expect(tokenizeRoutePattern('  ', options)).toBe(2);
    expect(tokenizeRoutePattern('\t', options)).toBe(1);
    expect(tokenizeRoutePattern('\n', options)).toBe(1);
    expect(tokenizeRoutePattern('\r', options)).toBe(1);

    expect(onVariableMock).not.toHaveBeenCalled();
    expect(onAltStartMock).not.toHaveBeenCalled();
    expect(onAltEndMock).not.toHaveBeenCalled();
    expect(onAltSeparatorMock).not.toHaveBeenCalled();
    expect(onWildcardMock).not.toHaveBeenCalled();
    expect(onRegExpMock).not.toHaveBeenCalled();
    expect(onLiteralMock).not.toHaveBeenCalled();
    expect(onPathSeparatorMock).not.toHaveBeenCalled();
  });

  test('parses variables', () => {
    expect(tokenizeRoutePattern(':foo', options)).toBe(4);

    expect(onVariableMock).toHaveBeenCalledTimes(1);
    expect(onVariableMock).toHaveBeenCalledWith('foo', 0, 4);
  });

  test('parses alternation start', () => {
    expect(tokenizeRoutePattern('{', options)).toBe(1);

    expect(onAltStartMock).toHaveBeenCalledTimes(1);
    expect(onAltStartMock).toHaveBeenCalledWith(0, 1);
  });

  test('parses alternation end', () => {
    expect(tokenizeRoutePattern('}', options)).toBe(1);

    expect(onAltEndMock).toHaveBeenCalledTimes(1);
    expect(onAltEndMock).toHaveBeenCalledWith(0, 1);
  });

  test('parses alternation separator', () => {
    expect(tokenizeRoutePattern(',', options)).toBe(1);

    expect(onAltSeparatorMock).toHaveBeenCalledTimes(1);
    expect(onAltSeparatorMock).toHaveBeenCalledWith(0, 1);
  });

  test('parses greedy wildcard', () => {
    expect(tokenizeRoutePattern('**', options)).toBe(2);

    expect(onWildcardMock).toHaveBeenCalledTimes(1);
    expect(onWildcardMock).toHaveBeenCalledWith(true, 0, 2);
  });

  test('parses wildcard', () => {
    expect(tokenizeRoutePattern('*', options)).toBe(1);

    expect(onWildcardMock).toHaveBeenCalledTimes(1);
    expect(onWildcardMock).toHaveBeenCalledWith(false, 0, 1);
  });

  test('parses empty reg exp', () => {
    expect(tokenizeRoutePattern('()', options)).toBe(2);

    expect(onRegExpMock).toHaveBeenCalledTimes(1);
    expect(onRegExpMock).toHaveBeenCalledWith('', 0, 2);
  });

  test('parses reg exp with groups', () => {
    expect(tokenizeRoutePattern('((a)((b)c))', options)).toBe(11);

    expect(onRegExpMock).toHaveBeenCalledTimes(1);
    expect(onRegExpMock).toHaveBeenCalledWith('(a)((b)c)', 0, 11);
  });

  test('parses reg exp with escaped open brackets', () => {
    expect(tokenizeRoutePattern('(\\()', options)).toBe(4);

    expect(onRegExpMock).toHaveBeenCalledTimes(1);
    expect(onRegExpMock).toHaveBeenCalledWith('\\(', 0, 4);
  });

  test('parses reg exp with escaped close brackets', () => {
    expect(tokenizeRoutePattern('(\\))', options)).toBe(4);

    expect(onRegExpMock).toHaveBeenCalledTimes(1);
    expect(onRegExpMock).toHaveBeenCalledWith('\\)', 0, 4);
  });

  test('stops parsing if reg exp is not cloed', () => {
    expect(tokenizeRoutePattern('(foo', options)).toBe(0);

    expect(onRegExpMock).not.toHaveBeenCalled();
  });

  test('parses literals', () => {
    expect(tokenizeRoutePattern('"foo"', options)).toBe(5);

    expect(onLiteralMock).toHaveBeenCalledTimes(1);
    expect(onLiteralMock).toHaveBeenCalledWith('foo', 0, 5);
  });

  test('respects escape char in literals', () => {
    expect(tokenizeRoutePattern('"fo\\"o"', options)).toBe(7);

    expect(onLiteralMock).toHaveBeenCalledTimes(1);
    expect(onLiteralMock).toHaveBeenCalledWith('fo"o', 0, 7);
  });

  test('parses unquoted literals', () => {
    expect(tokenizeRoutePattern('foo', options)).toBe(3);

    expect(onLiteralMock).toHaveBeenCalledTimes(1);
    expect(onLiteralMock).toHaveBeenCalledWith('foo', 0, 3);
  });

  test('ignores spaces around unquoted literals', () => {
    expect(tokenizeRoutePattern('  \nfoo\t', options)).toBe(7);

    expect(onLiteralMock).toHaveBeenCalledTimes(1);
    expect(onLiteralMock).toHaveBeenCalledWith('foo', 3, 6);
  });

  test('ignores spaces between unquoted literals', () => {
    expect(tokenizeRoutePattern('  \nfoo  bar\t', options)).toBe(12);

    expect(onLiteralMock).toHaveBeenCalledTimes(2);
    expect(onLiteralMock).toHaveBeenNthCalledWith(1, 'foo', 3, 6);
    expect(onLiteralMock).toHaveBeenNthCalledWith(2, 'bar', 8, 11);
  });

  test('stops parsing if literal is not closed', () => {
    expect(tokenizeRoutePattern('"foo', options)).toBe(0);

    expect(onLiteralMock).not.toHaveBeenCalled();
  });

  test('parses path separators', () => {
    expect(tokenizeRoutePattern('//', options)).toBe(2);

    expect(onPathSeparatorMock).toHaveBeenCalledTimes(2);
    expect(onPathSeparatorMock).toHaveBeenNthCalledWith(1, 0, 1);
    expect(onPathSeparatorMock).toHaveBeenNthCalledWith(2, 1, 2);
  });

  test('parses complex expressions', () => {
    expect(tokenizeRoutePattern('/aaa/{ :foo (\\d+) , :baz "qqq" }/**', options)).toBe(35);

    expect(onPathSeparatorMock).toHaveBeenCalledTimes(3);
    expect(onPathSeparatorMock).toHaveBeenNthCalledWith(1, 0, 1);
    expect(onPathSeparatorMock).toHaveBeenNthCalledWith(2, 4, 5);
    expect(onPathSeparatorMock).toHaveBeenNthCalledWith(3, 32, 33);

    expect(onLiteralMock).toHaveBeenCalledTimes(2);
    expect(onLiteralMock).toHaveBeenNthCalledWith(1, 'aaa', 1, 4);
    expect(onLiteralMock).toHaveBeenNthCalledWith(2, 'qqq', 25, 30);

    expect(onVariableMock).toHaveBeenCalledTimes(2);
    expect(onVariableMock).toHaveBeenNthCalledWith(1, 'foo', 7, 11);
    expect(onVariableMock).toHaveBeenNthCalledWith(2, 'baz', 20, 24);

    expect(onRegExpMock).toHaveBeenCalledTimes(1);
    expect(onRegExpMock).toHaveBeenCalledWith('\\d+', 12, 17);

    expect(onAltStartMock).toHaveBeenCalledTimes(1);
    expect(onAltStartMock).toHaveBeenCalledWith(5, 6);

    expect(onAltEndMock).toHaveBeenCalledTimes(1);
    expect(onAltEndMock).toHaveBeenCalledWith(31, 32);

    expect(onAltSeparatorMock).toHaveBeenCalledTimes(1);
    expect(onAltSeparatorMock).toHaveBeenCalledWith(18, 19);

    expect(onWildcardMock).toHaveBeenCalledTimes(1);
    expect(onWildcardMock).toHaveBeenCalledWith(true, 33, 35);
  });

  test('stops stops parsing complex expressions', () => {
    expect(tokenizeRoutePattern('/aaa/{ :foo (\\d+', options)).toBe(12);

    expect(onPathSeparatorMock).toHaveBeenCalledTimes(2);
    expect(onPathSeparatorMock).toHaveBeenNthCalledWith(1, 0, 1);
    expect(onPathSeparatorMock).toHaveBeenNthCalledWith(2, 4, 5);

    expect(onAltStartMock).toHaveBeenCalledTimes(1);
    expect(onAltStartMock).toHaveBeenCalledWith(5, 6);

    expect(onVariableMock).toHaveBeenCalledTimes(1);
    expect(onVariableMock).toHaveBeenNthCalledWith(1, 'foo', 7, 11);

    expect(onRegExpMock).not.toHaveBeenCalled();
  });
});
