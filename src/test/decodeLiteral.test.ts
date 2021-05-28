import {decodeLiteral} from '../main/decodeLiteral';

describe('decodeLiteral', () => {

  test('removes escape char', () => {
    expect(decodeLiteral('foo\\bar')).toBe('foobar');
    expect(decodeLiteral('foo\\\\bar')).toBe('foo\\bar');
    expect(decodeLiteral('foo\\"bar')).toBe('foo"bar');
  });
});
