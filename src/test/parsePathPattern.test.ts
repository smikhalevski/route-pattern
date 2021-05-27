import {parsePathPattern, PathPatternParserOptions} from '../main/parsePathPattern';

describe('parsePathPattern', () => {

  const variableMock = jest.fn();
  const altStartMock = jest.fn();
  const altEndMock = jest.fn();
  const altSeparatorMock = jest.fn();
  const greedyWildcardMock = jest.fn();
  const wildcardMock = jest.fn();
  const regExpMock = jest.fn();
  const literalMock = jest.fn();
  const pathSeparatorMock = jest.fn();

  const options: PathPatternParserOptions = {
    variable: variableMock,
    altStart: altStartMock,
    altEnd: altEndMock,
    altSeparator: altSeparatorMock,
    greedyWildcard: greedyWildcardMock,
    wildcard: wildcardMock,
    regExp: regExpMock,
    literal: literalMock,
    pathSeparator: pathSeparatorMock,
  };

  beforeEach(() => {
    variableMock.mockReset();
    altStartMock.mockReset();
    altEndMock.mockReset();
    altSeparatorMock.mockReset();
    greedyWildcardMock.mockReset();
    wildcardMock.mockReset();
    regExpMock.mockReset();
    literalMock.mockReset();
    pathSeparatorMock.mockReset();
  });

  test('does not call callbacks on blank string', () => {
    expect(parsePathPattern('', options)).toBe(0);
    expect(parsePathPattern('  ', options)).toBe(2);
    expect(parsePathPattern('\t', options)).toBe(1);
    expect(parsePathPattern('\n', options)).toBe(1);
    expect(parsePathPattern('\r', options)).toBe(1);

    expect(variableMock).not.toHaveBeenCalled();
    expect(altStartMock).not.toHaveBeenCalled();
    expect(altEndMock).not.toHaveBeenCalled();
    expect(altSeparatorMock).not.toHaveBeenCalled();
    expect(greedyWildcardMock).not.toHaveBeenCalled();
    expect(wildcardMock).not.toHaveBeenCalled();
    expect(regExpMock).not.toHaveBeenCalled();
    expect(literalMock).not.toHaveBeenCalled();
    expect(pathSeparatorMock).not.toHaveBeenCalled();
  });

  test('parses variables', () => {
    expect(parsePathPattern(':foo', options)).toBe(4);

    expect(variableMock).toHaveBeenCalledTimes(1);
    expect(variableMock).toHaveBeenCalledWith('foo', 0, 4);
  });

  test('parses alternation start', () => {
    expect(parsePathPattern('{', options)).toBe(1);

    expect(altStartMock).toHaveBeenCalledTimes(1);
    expect(altStartMock).toHaveBeenCalledWith(0, 1);
  });

  test('parses alternation end', () => {
    expect(parsePathPattern('}', options)).toBe(1);

    expect(altEndMock).toHaveBeenCalledTimes(1);
    expect(altEndMock).toHaveBeenCalledWith(0, 1);
  });

  test('parses alternation separator', () => {
    expect(parsePathPattern(',', options)).toBe(1);

    expect(altSeparatorMock).toHaveBeenCalledTimes(1);
    expect(altSeparatorMock).toHaveBeenCalledWith(0, 1);
  });

  test('parses greedy wildcard', () => {
    expect(parsePathPattern('**', options)).toBe(2);

    expect(greedyWildcardMock).toHaveBeenCalledTimes(1);
    expect(greedyWildcardMock).toHaveBeenCalledWith(0, 2);
  });

  test('parses wildcard', () => {
    expect(parsePathPattern('*', options)).toBe(1);

    expect(wildcardMock).toHaveBeenCalledTimes(1);
    expect(wildcardMock).toHaveBeenCalledWith(0, 1);
  });

  test('parses empty reg exp', () => {
    expect(parsePathPattern('()', options)).toBe(2);

    expect(regExpMock).toHaveBeenCalledTimes(1);
    expect(regExpMock).toHaveBeenCalledWith('', 0, 2);
  });

  test('parses reg exp with groups', () => {
    expect(parsePathPattern('((a)((b)c))', options)).toBe(11);

    expect(regExpMock).toHaveBeenCalledTimes(1);
    expect(regExpMock).toHaveBeenCalledWith('(a)((b)c)', 0, 11);
  });

  test('parses reg exp with escaped open brackets', () => {
    expect(parsePathPattern('(\\()', options)).toBe(4);

    expect(regExpMock).toHaveBeenCalledTimes(1);
    expect(regExpMock).toHaveBeenCalledWith('\\(', 0, 4);
  });

  test('parses reg exp with escaped close brackets', () => {
    expect(parsePathPattern('(\\))', options)).toBe(4);

    expect(regExpMock).toHaveBeenCalledTimes(1);
    expect(regExpMock).toHaveBeenCalledWith('\\)', 0, 4);
  });

  test('parses literals', () => {
    expect(parsePathPattern('"foo"', options)).toBe(5);

    expect(literalMock).toHaveBeenCalledTimes(1);
    expect(literalMock).toHaveBeenCalledWith('foo', 0, 5);
  });

  test('parses unquoted literals', () => {
    expect(parsePathPattern('foo', options)).toBe(3);

    expect(literalMock).toHaveBeenCalledTimes(1);
    expect(literalMock).toHaveBeenCalledWith('foo', 0, 3);
  });

  test('ignores spaces around unquoted literals', () => {
    expect(parsePathPattern('  \nfoo\t', options)).toBe(7);

    expect(literalMock).toHaveBeenCalledTimes(1);
    expect(literalMock).toHaveBeenCalledWith('foo', 3, 6);
  });

  test('ignores spaces between unquoted literals', () => {
    expect(parsePathPattern('  \nfoo  bar\t', options)).toBe(12);

    expect(literalMock).toHaveBeenCalledTimes(2);
    expect(literalMock).toHaveBeenNthCalledWith(1, 'foo', 3, 6);
    expect(literalMock).toHaveBeenNthCalledWith(2, 'bar', 8, 11);
  });

  test('parses path separators', () => {
    expect(parsePathPattern('//', options)).toBe(2);

    expect(pathSeparatorMock).toHaveBeenCalledTimes(2);
    expect(pathSeparatorMock).toHaveBeenNthCalledWith(1, 0, 1);
    expect(pathSeparatorMock).toHaveBeenNthCalledWith(2, 1, 2);
  });

  test('parses complex expressions', () => {
    expect(parsePathPattern('/aaa/{ :foo (\\d+) , :baz "qqq" }/**', options)).toBe(35);

    expect(pathSeparatorMock).toHaveBeenCalledTimes(3);
    expect(pathSeparatorMock).toHaveBeenNthCalledWith(1, 0, 1);
    expect(pathSeparatorMock).toHaveBeenNthCalledWith(2, 4, 5);
    expect(pathSeparatorMock).toHaveBeenNthCalledWith(3, 32, 33);

    expect(literalMock).toHaveBeenCalledTimes(2);
    expect(literalMock).toHaveBeenNthCalledWith(1, 'aaa', 1, 4);
    expect(literalMock).toHaveBeenNthCalledWith(2, 'qqq', 25, 30);

    expect(variableMock).toHaveBeenCalledTimes(2);
    expect(variableMock).toHaveBeenNthCalledWith(1, 'foo', 7, 11);
    expect(variableMock).toHaveBeenNthCalledWith(2, 'baz', 20, 24);

    expect(regExpMock).toHaveBeenCalledTimes(1);
    expect(regExpMock).toHaveBeenCalledWith('\\d+', 12, 17);

    expect(altStartMock).toHaveBeenCalledTimes(1);
    expect(altStartMock).toHaveBeenCalledWith(5, 6);

    expect(altEndMock).toHaveBeenCalledTimes(1);
    expect(altEndMock).toHaveBeenCalledWith(31, 32);

    expect(altSeparatorMock).toHaveBeenCalledTimes(1);
    expect(altSeparatorMock).toHaveBeenCalledWith(18, 19);

    expect(greedyWildcardMock).toHaveBeenCalledTimes(1);
    expect(greedyWildcardMock).toHaveBeenCalledWith(33, 35);
  });
});
