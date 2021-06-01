const reRegExpChar = /[\\^$.*+?()[\]{}|]/g
const reHasRegExpChar = RegExp(reRegExpChar.source)

export function escapeRegExp(str: string): string {
  return reHasRegExpChar.test(str) ? str.replace(reRegExpChar, '\\$&') : str;
}
