import {allCharBy, char, CharCodeChecker, ResultCode, seq, Taker, text} from 'tokenizer-dsl';
import {CharCode} from './CharCode';

const isSpaceChar: CharCodeChecker = (c) =>
    c === CharCode[' ']
    || c === CharCode['\t']
    || c === CharCode['\r']
    || c === CharCode['\n'];

const isVariableNameChar: CharCodeChecker = (c) =>
    c >= CharCode['a'] && c <= CharCode['z']
    || c >= CharCode['A'] && c <= CharCode['Z']
    || c >= CharCode['0'] && c <= CharCode['9']
    || c === CharCode['$']
    || c === CharCode['_'];

const takeSpace = allCharBy(isSpaceChar);

const takeVariable = seq(char(CharCode[':']), allCharBy(isVariableNameChar, 1));

const takeAltStart = char(CharCode['{']);

const takeAltEnd = char(CharCode['}']);

const takeAltSeparator = char(CharCode[',']);

const takeGreedyWildcard = text('**');

const takeWildcard = char(CharCode['*']);

const takePathSeparator = char(CharCode['/']);

let lastText = '';

const takeQuotedText: Taker = (str, i) => {
  const quoteCode = str.charCodeAt(i);
  if (quoteCode !== CharCode['"'] && quoteCode !== CharCode['\'']) {
    return ResultCode.NO_MATCH;
  }
  i++;

  const charCount = str.length;
  let j = i;

  lastText = '';

  while (i < charCount) {
    switch (str.charCodeAt(i)) {

      case quoteCode:
        lastText += str.substring(j, i);
        return i + 1;

      case CharCode['\\']:
        lastText += str.substring(j, i);
        j = ++i;
        break;
    }
    i++;
  }

  lastText = '';

  return ResultCode.ERROR;
};

let lastGroupCount = 0;

const takeRegExp: Taker = (str, i) => {
  if (str.charCodeAt(i) !== CharCode['(']) {
    return ResultCode.NO_MATCH;
  }
  i++;

  const charCount = str.length;

  let groupDepth = 0;

  lastGroupCount = 0;
  while (i < charCount) {
    switch (str.charCodeAt(i)) {

      case CharCode['(']:
        lastGroupCount++;
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

  lastGroupCount = 0;
  return ResultCode.ERROR;
};

export type DataCallback = (data: string, start: number, end: number) => void;

export type OffsetCallback = (start: number, end: number) => void;

export interface IPatternTokenizerOptions {
  onVariable?: DataCallback;
  onAltStart?: OffsetCallback;
  onAltEnd?: OffsetCallback;
  onAltSeparator?: OffsetCallback;
  onWildcard?: (greedy: boolean, start: number, end: number) => void;
  onRegExp?: (pattern: string, groupCount: number, start: number, end: number) => void;
  onText?: DataCallback;
  onPathSeparator?: OffsetCallback;
}

/**
 * Traverses pattern and invokes callbacks when particular token in met.
 *
 * @param str The pattern to tokenize.
 * @param options Callbacks to invoke during tokenization.
 * @returns The number of chars that were successfully parsed in `str`.
 */
export function tokenizePattern(str: string, options: IPatternTokenizerOptions): number {
  const {
    onVariable,
    onAltStart,
    onAltEnd,
    onAltSeparator,
    onWildcard,
    onRegExp,
    onText,
    onPathSeparator,
  } = options;

  const charCount = str.length;

  let textStart = -1;
  let textEnd = -1;

  const emitText = () => {
    if (textStart !== -1) {
      onText?.(str.substring(textStart, textEnd), textStart, textEnd);
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

    j = takeQuotedText(str, i);
    if (j >= 0) {
      emitText();
      onText?.(lastText, i, j);
      i = j;
      continue;
    } else if (j === ResultCode.ERROR) {
      return i;
    }

    j = takeRegExp(str, i);
    if (j >= 0) {
      emitText();
      onRegExp?.(str.substring(i + 1, j - 1), lastGroupCount, i, j);
      i = j;
      continue;
    } else if (j === ResultCode.ERROR) {
      return i;
    }

    // The start of the unquoted text.
    if (textStart === -1) {
      textStart = i;
    }
    i++;
    textEnd = i;
  }

  emitText();
  return i;
}
