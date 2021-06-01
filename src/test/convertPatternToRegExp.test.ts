import {convertPatternToRegExp} from '../main';

describe('docs', () => {

  test('readme example', () => {
    const result = convertPatternToRegExp('/(\\d+)/:foo{ bar, qux }');
    const match = result.re.exec('/123/bar');

    expect(match?.[result.varMap.foo]).toBe('bar');
  });
});
