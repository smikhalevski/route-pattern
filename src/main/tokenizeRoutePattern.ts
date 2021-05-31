import {allCharBy, char, CharCodeChecker, ReturnCode, seq, substr, Taker} from './parser-dsl';
import {decodeLiteral} from './decodeLiteral';
import {CharCode} from './CharCode';

const isSpaceChar: CharCodeChecker = (c) => c === 0x20 || c === 0x09 || c === 0xD || c === 0xA;

const isVariableNameChar: CharCodeChecker = (c) => (
    c >= CharCode['a'] && c <= CharCode['z']
    || c >= CharCode['A'] && c <= CharCode['Z']
    || c === CharCode['$']
    || c === CharCode['_']
);

const takeSpace = allCharBy(isSpaceChar);

const takeVariable = seq(char(CharCode[':']), allCharBy(isVariableNameChar));

const takeAltStart = char(CharCode['{']);

const takeAltEnd = char(CharCode['}']);

const takeAltSeparator = char(CharCode[',']);

const takeGreedyWildcard = substr('**');

const takeWildcard = char(CharCode['*']);

const takePathSeparator = char(CharCode['/']);

const takeLiteral: Taker = (str, i) => {
  if (str.charCodeAt(i) !== CharCode['"']) {
    return ReturnCode.NO_MATCH;
  }
  i++;

  const charCount = str.length;

  while (i < charCount) {
    switch (str.charCodeAt(i)) {

      case CharCode['"']:
        return i + 1;

      case CharCode['\\']:
        i++;
        break;
    }
    i++;
  }
  return ReturnCode.ERROR;
};

/**
 * The number of groups in the regexp that was read during the last invocation of {@link takeRegExp}.
 */
let groupCount = 0;

const takeRegExp: Taker = (str, i) => {
  groupCount = 0;

  if (str.charCodeAt(i) !== CharCode['(']) {
    return ReturnCode.NO_MATCH;
  }
  i++;

  const charCount = str.length;

  let groupDepth = 0;

  while (i < charCount) {
    switch (str.charCodeAt(i)) {

      case CharCode['(']:
        groupCount++;
        groupDepth++;
        break;

      case CharCode[')']:
        if (groupDepth === 0) {
          return i + 1;
        }
        groupDepth--;
        break;

      case CharCode['\\']:
        i++;
        break;
    }
    i++;
  }

  groupCount = 0;
  return ReturnCode.ERROR;
};

export type DataCallback = (data: string, start: number, end: number) => void;

export type OffsetCallback = (start: number, end: number) => void;

export interface RoutePatternTokenizerOptions {
  onVariable?: DataCallback;
  onAltStart?: OffsetCallback;
  onAltEnd?: OffsetCallback;
  onAltSeparator?: OffsetCallback;
  onWildcard?: (greedy: boolean, start: number, end: number) => void;
  onRegExp?: (pattern: string, groupCount: number, start: number, end: number) => void;
  onLiteral?: DataCallback;
  onPathSeparator?: OffsetCallback;
}

export function tokenizeRoutePattern(str: string, options: RoutePatternTokenizerOptions): number {
  const {
    onVariable,
    onAltStart,
    onAltEnd,
    onAltSeparator,
    onWildcard,
    onRegExp,
    onLiteral,
    onPathSeparator,
  } = options;

  const charCount = str.length;

  let textStart = -1;
  let textEnd = -1;

  const emitText = () => {
    if (textStart !== -1) {
      onLiteral?.(str.substring(textStart, textEnd), textStart, textEnd);
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
    if (j >= 0) {
      emitText();
      onVariable?.(str.substring(i + 1, j), i, j);
      i = j;
      continue;
    }

    j = takeAltStart(str, i);
    if (j >= 0) {
      emitText();
      onAltStart?.(i, j);
      i = j;
      continue;
    }

    j = takeAltEnd(str, i);
    if (j >= 0) {
      emitText();
      onAltEnd?.(i, j);
      i = j;
      continue;
    }

    j = takeAltSeparator(str, i);
    if (j >= 0) {
      emitText();
      onAltSeparator?.(i, j);
      i = j;
      continue;
    }

    j = takeGreedyWildcard(str, i);
    if (j >= 0) {
      emitText();
      onWildcard?.(true, i, j);
      i = j;
      continue;
    }

    j = takeWildcard(str, i);
    if (j >= 0) {
      emitText();
      onWildcard?.(false, i, j);
      i = j;
      continue;
    }

    j = takePathSeparator(str, i);
    if (j >= 0) {
      emitText();
      onPathSeparator?.(i, j);
      i = j;
      continue;
    }

    j = takeLiteral(str, i);
    if (j >= 0) {
      emitText();
      onLiteral?.(decodeLiteral(str.substring(i + 1, j - 1)), i, j);
      i = j;
      continue;
    } else if (j === ReturnCode.ERROR) {
      return i;
    }

    j = takeRegExp(str, i);
    if (j >= 0) {
      emitText();
      onRegExp?.(str.substring(i + 1, j - 1), groupCount, i, j);
      i = j;
      continue;
    } else if (j === ReturnCode.ERROR) {
      return i;
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
