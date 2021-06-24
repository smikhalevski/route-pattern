import {convertNodeToRegExp} from '../main/convertNodeToRegExp';
import {parsePattern} from '../main';

describe('convertNodeToRegExp', () => {

  test('converts variable', () => {
    expect(convertNodeToRegExp(parsePattern(':foo'))).toEqual(/^([^/]*)/);
  });

  test('converts variable with text constraint', () => {
    expect(convertNodeToRegExp(parsePattern(':foo"bar"'))).toEqual(/^(bar)/);
  });

  test('converts variable with regexp constraint', () => {
    expect(convertNodeToRegExp(parsePattern(':foo(\\d+)'))).toEqual(/^((?:\d+))/);
  });

  test('converts variable with alternation constraint', () => {
    expect(convertNodeToRegExp(parsePattern(':foo { foo, bar }'))).toEqual(/^((?:foo|bar))/);
  });

  test('converts variables with respect to regexp group count', () => {
    expect(convertNodeToRegExp(parsePattern('(([abc]))/:foo(\\d+)'))).toEqual(/^(?:([abc]))\/((?:\d+))/);
  });

  test('converts text', () => {
    expect(convertNodeToRegExp(parsePattern('foo'))).toEqual(/^foo/);
  });

  test('converts text with regexp control chars', () => {
    expect(convertNodeToRegExp(parsePattern('$fo[o]'))).toEqual(/^\$fo\[o\]/);
  });

  test('converts wildcards', () => {
    expect(convertNodeToRegExp(parsePattern('*'))).toEqual(/^[^/]+?/);
  });

  test('converts greedy wildcards', () => {
    expect(convertNodeToRegExp(parsePattern('**'))).toEqual(/^.+/);
  });

  test('converts alternation', () => {
    expect(convertNodeToRegExp(parsePattern('{foo,bar}'))).toEqual(/^(?:foo|bar)/);
  });

  test('converts alternation with leading path separator', () => {
    expect(convertNodeToRegExp(parsePattern('/{foo,bar}'))).toEqual(/^\/(?:foo|bar)/);
  });

  test('converts alternation with path separator inside branch', () => {
    expect(convertNodeToRegExp(parsePattern('{ /foo, bar }'))).toEqual(/^(?:\/foo|bar)/);
  });

  test('converts complex pattern', () => {
    expect(convertNodeToRegExp(parsePattern('/aaa{ :foo{ /bbb, :bar(ccc|ddd) }/**}'))).toEqual(/^\/aaa(?:((?:\/bbb|((?:ccc|ddd))))\/.+)/);
  });

  test('adds exec to support groups', () => {
    const re = convertNodeToRegExp(parsePattern('/:foo{:bar,aaa}'));
    const arr = re.exec('/abc');

    expect(arr?.groups?.foo).toEqual('abc');
    expect(arr?.groups?.bar).toEqual('abc');
  });

  test('regexp with groups supports string match', () => {
    const re = convertNodeToRegExp(parsePattern('/:foo'));
    const arr = '/abc'.match(re);

    expect(arr?.groups?.foo).toEqual('abc');
  });

  test('creates case-sensitive regexp', () => {
    const re = convertNodeToRegExp(parsePattern('/ABC'));

    expect(re.exec('/abc')).toBeNull();
    expect(re.exec('/ABC')).toEqual(expect.objectContaining(['/ABC']));
  });

  test('creates case-insensitive regexp', () => {
    const re = convertNodeToRegExp(parsePattern('/ABC'), {caseInsensitive: true});

    expect(re.exec('/abc')).toEqual(expect.objectContaining(['/abc']));
    expect(re.exec('/ABC')).toEqual(expect.objectContaining(['/ABC']));
  });

  test('merges native groups and vars', () => {
    const re = convertNodeToRegExp(parsePattern('/:foo/((?<bar>\\w+))'));

    expect(re.exec('/abc/123')?.groups).toEqual({foo: 'abc', bar: '123'});
  });

  test('vars overwrite native groups with the same name', () => {
    const re = convertNodeToRegExp(parsePattern('/:foo/((?<foo>\\w+))'));

    expect(re.exec('/abc/123')?.groups).toEqual({foo: 'abc'});
  });

  test('var can be named __proto__', () => {
    const re = convertNodeToRegExp(parsePattern('/:__proto__'));

    expect(re.exec('/abc')?.groups?.__proto__).toBe('abc');
  });
});
