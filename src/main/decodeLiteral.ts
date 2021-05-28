import {CharCode} from './CharCode';

/**
 * Removes excessive escape chars from string.
 */
export function decodeLiteral(str: string): string {
  let result = '';
  let j = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) === CharCode['\\']) {
      result += str.substring(j, i);
      j = i + 1;
      i++;
    }
  }
  return result + str.substring(j);
}
