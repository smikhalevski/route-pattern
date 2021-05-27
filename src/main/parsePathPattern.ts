import {allCharBy, char, CharCodeChecker, seq, substr, Taker} from './parser-dsl';

const isSpaceChar: CharCodeChecker = (c) => c === 0x20 || c === 0x09 || c === 0xD || c === 0xA;

const isVariableNameChar: CharCodeChecker = (c) => (
    c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0) // a-z
    || c >= 'A'.charCodeAt(0) && c <= 'Z'.charCodeAt(0) // A-Z
    || c === '$'.charCodeAt(0)
    || c === '_'.charCodeAt(0)
);

const takeSpace = allCharBy(isSpaceChar);

const takeVariable = seq(char(':'.charCodeAt(0)), allCharBy(isVariableNameChar));

const takeAltStart = char('{'.charCodeAt(0));

const takeAltEnd = char('}'.charCodeAt(0));

const takeAltSeparator = char(','.charCodeAt(0));

const takeGreedyWildcard = substr('**');

const takeWildcard = char('*'.charCodeAt(0));

const takePathSeparator = char('/'.charCodeAt(0));

const takeLiteral: Taker = (str, i) => {
  if (str.charCodeAt(i) !== '"'.charCodeAt(0)) {
    return -1;
  }
  i++;

  const charCount = str.length;

  while (i < charCount) {
    switch (str.charCodeAt(i)) {
      case '"'.charCodeAt(0):
        return i + 1;
      case '\\'.charCodeAt(0):
        i++;
        break;
    }
    i++;
  }
  return -1;
};

const takeRegExp: Taker = (str, i) => {
  if (str.charCodeAt(i) !== '('.charCodeAt(0)) {
    return -1;
  }
  i++;

  const charCount = str.length;

  let groupCount = 0;

  while (i < charCount) {
    switch (str.charCodeAt(i)) {
      case '('.charCodeAt(0):
        groupCount++;
        break;
      case ')'.charCodeAt(0):
        if (groupCount === 0) {
          return i + 1;
        }
        groupCount--;
        break;
      case '\\'.charCodeAt(0):
        i++;
        break;
    }
    i++;
  }
  return -1;
};

export type DataCallback = (data: string, start: number, end: number) => void;

export type OffsetCallback = (start: number, end: number) => void;

export interface PathPatternParserOptions {
  variable?: DataCallback;
  altStart?: OffsetCallback;
  altEnd?: OffsetCallback;
  altSeparator?: OffsetCallback;
  greedyWildcard?: OffsetCallback;
  wildcard?: OffsetCallback;
  regExp?: DataCallback;
  literal?: DataCallback;
  pathSeparator?: OffsetCallback;
}

export function parsePathPattern(str: string, options: PathPatternParserOptions): number {
  const {
    variable,
    altStart,
    altEnd,
    altSeparator,
    greedyWildcard,
    wildcard,
    regExp,
    literal,
    pathSeparator,
  } = options;

  const charCount = str.length;

  let textStart = -1;
  let textEnd = -1;

  const emitText = () => {
    if (textStart !== -1) {
      literal?.(str.substring(textStart, textEnd), textStart, textEnd);
      textStart = -1;
    }
  };

  let i = 0;
  let j;

  while (i < charCount) {
    textEnd = i;

    j = takeSpace(str, i);
    if (j !== i) {
      emitText();
      i = j;
    }

    // No more tokens available.
    if (i === charCount) {
      break;
    }

    j = takeVariable(str, i);
    if (j !== -1) {
      emitText();
      variable?.(str.substring(i + 1, j), i, j);
      i = j;
      continue;
    }

    j = takeAltStart(str, i);
    if (j !== -1) {
      emitText();
      altStart?.(i, j);
      i = j;
      continue;
    }

    j = takeAltEnd(str, i);
    if (j !== -1) {
      emitText();
      altEnd?.(i, j);
      i = j;
      continue;
    }

    j = takeAltSeparator(str, i);
    if (j !== -1) {
      emitText();
      altSeparator?.(i, j);
      i = j;
      continue;
    }

    j = takeGreedyWildcard(str, i);
    if (j !== -1) {
      emitText();
      greedyWildcard?.(i, j);
      i = j;
      continue;
    }

    j = takeWildcard(str, i);
    if (j !== -1) {
      emitText();
      wildcard?.(i, j);
      i = j;
      continue;
    }

    j = takePathSeparator(str, i);
    if (j !== -1) {
      emitText();
      pathSeparator?.(i, j);
      i = j;
      continue;
    }

    j = takeLiteral(str, i);
    if (j !== -1) {
      emitText();
      literal?.(str.substring(i + 1, j - 1), i, j);
      i = j;
      continue;
    }

    j = takeRegExp(str, i);
    if (j !== -1) {
      emitText();
      regExp?.(str.substring(i + 1, j - 1), i, j);
      i = j;
      continue;
    }

    // The start of the unquoted literal.
    if (textStart === -1) {
      textStart = i;
    }
    i++;
    textEnd = i;
  }

  emitText();
  return i;
}
