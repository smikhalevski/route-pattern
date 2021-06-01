import {convertNodeToRegExp, IPatternRegExp} from './convertNodeToRegExp';
import {parsePattern} from './parsePattern';

/**
 * Converts pattern to `RegExp`.
 */
export function convertPatternToRegExp(str: string): IPatternRegExp {
  return convertNodeToRegExp(parsePattern(str));
}
