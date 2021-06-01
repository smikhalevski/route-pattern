/**
 * Takes string `str` and offset in this string `i` and returns the new offset in `str` if taker matched. If taker
 * didn't match then negative number must be returned. -1 means that taker didn't match any chars without an error.
 * Lower returned values denote various errors. Taker may return offsets that exceed string length.
 */
export type Taker = (str: string, i: number) => ReturnCode | number;

export type CharCodeChecker = (c: number) => boolean;

export const enum ReturnCode {

  /**
   * This is an OK return code that means that taker didn't match and chars.
   */
  NO_MATCH = -1,

  /**
   * This is an error return code that means that an runtime error during parsing has occurred. Further parsing should
   * be aborted if this code is returned.
   */
  ERROR = -2,
}

/**
 * Takes a single char with the given code.
 */
export function char(charCode: number): Taker {
  return (str, i) => str.charCodeAt(i) === charCode ? i + 1 : ReturnCode.NO_MATCH;
}

/**
 * Takes a single char if it matches the checker.
 */
export function charBy(charCodeChecker: CharCodeChecker): Taker {
  return (str, i) => charCodeChecker(str.charCodeAt(i)) ? i + 1 : ReturnCode.NO_MATCH;
}

export function substr(s: string, ignoreCase = false): Taker {
  const l = s.length;
  if (ignoreCase) {
    s = s.toLowerCase();
  }

  return (str, i) => {
    str = str.substr(i, l);
    if (ignoreCase) {
      str = str.toLowerCase();
    }
    return str === s ? i + l : ReturnCode.NO_MATCH;
  };
}

export function untilCharBy(charCodeChecker: CharCodeChecker, inclusive: boolean, openEnded: boolean): Taker {
  return (str, i) => {
    for (const l = str.length; i < l; i++) {
      if (charCodeChecker(str.charCodeAt(i))) {
        return inclusive ? i + 1 : i;
      }
    }
    return openEnded ? inclusive ? i + 1 : i : ReturnCode.NO_MATCH;
  };
}

export function untilSubstr(s: string, inclusive: boolean, openEnded: boolean): Taker {
  return (str, i) => {
    let j = str.indexOf(s, i);
    if (j === -1) {
      if (!openEnded) {
        return ReturnCode.NO_MATCH;
      }
      j = str.length;
    }
    return inclusive ? j + s.length : j;
  };
}

export function maybe(taker: Taker): Taker {
  return (str, i) => {
    const j = taker(str, i);
    return j === ReturnCode.NO_MATCH ? i : j;
  };
}

export function all(taker: Taker): Taker {
  return (str, i) => {
    const l = str.length;
    while (i < l) {
      const j = taker(str, i);

      if (j === ReturnCode.NO_MATCH || j === i) {
        break;
      }
      if (j < ReturnCode.NO_MATCH) {
        return j;
      }
      i = j;
    }
    return i;
  };
}

/**
 * Performance optimization for `all(charBy(…))` composition.
 */
export function allCharBy(charCodeChecker: CharCodeChecker): Taker {
  return (str, i) => {
    const l = str.length;
    while (i < l && charCodeChecker(str.charCodeAt(i))) {
      i++;
    }
    return i;
  };
}

export function seq(...takers: Array<Taker>): Taker {
  const n = takers.length;

  return (str, i) => {
    let k = 0;
    while (k < n && i >= 0) {
      i = takers[k++](str, i);
    }
    return i;
  };
}

export function or(...takers: Array<Taker>): Taker {
  const n = takers.length;

  return (str, i) => {
    let k = 0;
    let j = ReturnCode.NO_MATCH;
    while (k < n && j === ReturnCode.NO_MATCH) {
      j = takers[k++](str, i);
    }
    return j;
  };
}
