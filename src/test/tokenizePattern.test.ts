import {IPatternTokenizerOptions, tokenizePattern} from '../main/tokenizePattern';

describe('tokenizePattern', () => {

  const onVariableMock = jest.fn();
  const onAltStartMock = jest.fn();
  const onAltEndMock = jest.fn();
  const onAltSeparatorMock = jest.fn();
  const onWildcardMock = jest.fn();
  const onRegExpMock = jest.fn();
  const onTextMock = jest.fn();
  const onPathSeparatorMock = jest.fn();

  const options: IPatternTokenizerOptions = {
    onVariable: onVariableMock,
    onAltStart: onAltStartMock,
    onAltEnd: onAltEndMock,
    onAltSeparator: onAltSeparatorMock,
    onWildcard: onWildcardMock,
    onRegExp: onRegExpMock,
    onText: onTextMock,
    onPathSeparator: onPathSeparatorMock,
  };

  beforeEach(() => {
    onVariableMock.mockReset();
    onAltStartMock.mockReset();
    onAltEndMock.mockReset();
    onAltSeparatorMock.mockReset();
    onWildcardMock.mockReset();
    onRegExpMock.mockReset();
    onTextMock.mockReset();
    onPathSeparatorMock.mockReset();
  });

  test('does not call callbacks on blank string', () => {
    expect(tokenizePattern('', options)).toBe(0);
    expect(tokenizePattern('  ', options)).toBe(2);
    expect(tokenizePattern('\t', options)).toBe(1);
    expect(tokenizePattern('\n', options)).toBe(1);
    expect(tokenizePattern('\r', options)).toBe(1);

    expect(onVariableMock).not.toHaveBeenCalled();
    expect(onAltStartMock).not.toHaveBeenCalled();
    expect(onAltEndMock).not.toHaveBeenCalled();
    expect(onAltSeparatorMock).not.toHaveBeenCalled();
    expect(onWildcardMock).not.toHaveBeenCalled();
    expect(onRegExpMock).not.toHaveBeenCalled();
    expect(onTextMock).not.toHaveBeenCalled();
    expect(onPathSeparatorMock).not.toHaveBeenCalled();
  });

  test('parses variables', () => {
    expect(tokenizePattern(':foo', options)).toBe(4);

    expect(onVariableMock).toHaveBeenCalledTimes(1);
    expect(onVariableMock).toHaveBeenCalledWith('foo', 0, 4);
  });

  test('parses variables with numbers', () => {
    expect(tokenizePattern(':foo123', options)).toBe(7);

    expect(onVariableMock).toHaveBeenCalledTimes(1);
    expect(onVariableMock).toHaveBeenCalledWith('foo123', 0, 7);
  });

  test('parses alternation start', () => {
    expect(tokenizePattern('{', options)).toBe(1);

    expect(onAltStartMock).toHaveBeenCalledTimes(1);
    expect(onAltStartMock).toHaveBeenCalledWith(0, 1);
  });

  test('parses alternation end', () => {
    expect(tokenizePattern('}', options)).toBe(1);

    expect(onAltEndMock).toHaveBeenCalledTimes(1);
    expect(onAltEndMock).toHaveBeenCalledWith(0, 1);
  });

  test('parses alternation separator', () => {
    expect(tokenizePattern(',', options)).toBe(1);

    expect(onAltSeparatorMock).toHaveBeenCalledTimes(1);
    expect(onAltSeparatorMock).toHaveBeenCalledWith(0, 1);
  });

  test('parses greedy wildcard', () => {
    expect(tokenizePattern('**', options)).toBe(2);

    expect(onWildcardMock).toHaveBeenCalledTimes(1);
    expect(onWildcardMock).toHaveBeenCalledWith(true, 0, 2);
  });

  test('parses wildcard', () => {
    expect(tokenizePattern('*', options)).toBe(1);

    expect(onWildcardMock).toHaveBeenCalledTimes(1);
    expect(onWildcardMock).toHaveBeenCalledWith(false, 0, 1);
  });

  test('parses empty reg exp', () => {
    expect(tokenizePattern('()', options)).toBe(2);

    expect(onRegExpMock).toHaveBeenCalledTimes(1);
    expect(onRegExpMock).toHaveBeenCalledWith('', 0, 0, 2);
  });

  test('parses reg exp with groups', () => {
    expect(tokenizePattern('((a)((b)c))', options)).toBe(11);

    expect(onRegExpMock).toHaveBeenCalledTimes(1);
    expect(onRegExpMock).toHaveBeenCalledWith('(a)((b)c)', 3, 0, 11);
  });

  test('parses reg exp with escaped open brackets', () => {
    expect(tokenizePattern('(\\()', options)).toBe(4);

    expect(onRegExpMock).toHaveBeenCalledTimes(1);
    expect(onRegExpMock).toHaveBeenCalledWith('\\(', 0, 0, 4);
  });

  test('parses reg exp with escaped close brackets', () => {
    expect(tokenizePattern('(\\))', options)).toBe(4);

    expect(onRegExpMock).toHaveBeenCalledTimes(1);
    expect(onRegExpMock).toHaveBeenCalledWith('\\)', 0, 0, 4);
  });

  test('stops parsing if reg exp is not closed', () => {
    expect(tokenizePattern('(foo', options)).toBe(0);

    expect(onRegExpMock).not.toHaveBeenCalled();
  });

  test('parses text', () => {
    expect(tokenizePattern('\'foo\'', options)).toBe(5);

    expect(onTextMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenCalledWith('foo', 0, 5);
  });

  test('parses text in quotes', () => {
    expect(tokenizePattern('"foo"', options)).toBe(5);

    expect(onTextMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenCalledWith('foo', 0, 5);
  });

  test('respects escape char in text', () => {
    expect(tokenizePattern('"fo\\"o"', options)).toBe(7);

    expect(onTextMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenCalledWith('fo"o', 0, 7);
  });

  test('parses unquoted text', () => {
    expect(tokenizePattern('foo', options)).toBe(3);

    expect(onTextMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenCalledWith('foo', 0, 3);
  });

  test('ignores spaces around unquoted text', () => {
    expect(tokenizePattern('  \nfoo\t', options)).toBe(7);

    expect(onTextMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenCalledWith('foo', 3, 6);
  });

  test('ignores spaces between unquoted text', () => {
    expect(tokenizePattern('  \nfoo  bar\t', options)).toBe(12);

    expect(onTextMock).toHaveBeenCalledTimes(2);
    expect(onTextMock).toHaveBeenNthCalledWith(1, 'foo', 3, 6);
    expect(onTextMock).toHaveBeenNthCalledWith(2, 'bar', 8, 11);
  });

  test('stops parsing if text closing quote is missing', () => {
    expect(tokenizePattern('"foo', options)).toBe(0);

    expect(onTextMock).not.toHaveBeenCalled();
  });

  test('parses path separators', () => {
    expect(tokenizePattern('//', options)).toBe(2);

    expect(onPathSeparatorMock).toHaveBeenCalledTimes(2);
    expect(onPathSeparatorMock).toHaveBeenNthCalledWith(1, 0, 1);
    expect(onPathSeparatorMock).toHaveBeenNthCalledWith(2, 1, 2);
  });

  test('parses complex expressions', () => {
    expect(tokenizePattern('/aaa/{ :foo (\\d+) , :baz "qqq" }/**', options)).toBe(35);

    expect(onPathSeparatorMock).toHaveBeenCalledTimes(3);
    expect(onPathSeparatorMock).toHaveBeenNthCalledWith(1, 0, 1);
    expect(onPathSeparatorMock).toHaveBeenNthCalledWith(2, 4, 5);
    expect(onPathSeparatorMock).toHaveBeenNthCalledWith(3, 32, 33);

    expect(onTextMock).toHaveBeenCalledTimes(2);
    expect(onTextMock).toHaveBeenNthCalledWith(1, 'aaa', 1, 4);
    expect(onTextMock).toHaveBeenNthCalledWith(2, 'qqq', 25, 30);

    expect(onVariableMock).toHaveBeenCalledTimes(2);
    expect(onVariableMock).toHaveBeenNthCalledWith(1, 'foo', 7, 11);
    expect(onVariableMock).toHaveBeenNthCalledWith(2, 'baz', 20, 24);

    expect(onRegExpMock).toHaveBeenCalledTimes(1);
    expect(onRegExpMock).toHaveBeenCalledWith('\\d+', 0, 12, 17);

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
    expect(tokenizePattern('/aaa/{ :foo (\\d+', options)).toBe(12);

    expect(onPathSeparatorMock).toHaveBeenCalledTimes(2);
    expect(onPathSeparatorMock).toHaveBeenNthCalledWith(1, 0, 1);
    expect(onPathSeparatorMock).toHaveBeenNthCalledWith(2, 4, 5);

    expect(onAltStartMock).toHaveBeenCalledTimes(1);
    expect(onAltStartMock).toHaveBeenCalledWith(5, 6);

    expect(onVariableMock).toHaveBeenCalledTimes(1);
    expect(onVariableMock).toHaveBeenNthCalledWith(1, 'foo', 7, 11);

    expect(onRegExpMock).not.toHaveBeenCalled();
  });

  test('parses weird chars as text', () => {
    expect(tokenizePattern('!@#$%^&', options)).toBe(7);

    expect(onTextMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenNthCalledWith(1, '!@#$%^&', 0, 7);
  });

  test('parses newline as a space char', () => {
    expect(tokenizePattern('foo\nbar', options)).toBe(7);

    expect(onTextMock).toHaveBeenCalledTimes(2);
    expect(onTextMock).toHaveBeenNthCalledWith(1, 'foo', 0, 3);
    expect(onTextMock).toHaveBeenNthCalledWith(2, 'bar', 4, 7);
  });
});
