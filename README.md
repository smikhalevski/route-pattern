# route-pattern [![Build Status](https://travis-ci.com/smikhalevski/route-pattern.svg?branch=master)](https://travis-ci.com/smikhalevski/route-pattern)

The path pattern parser, that supports named variables, variable constraints, bash-like alternation, regular expressions, and wildcards.

```js
import {convertPatternToRegExp} from 'route-pattern';

const result = convertPatternToRegExp('/(\\d+)/:foo{ bar, qux }');
  // → { re: /…/, vars: {foo: 2} };

const match = result.re.exec('/123/bar'); // → ['/123/bar', 'bar']

console.log(match[result.varMap.foo]); // → 'bar'
```

# Features

1. `/foo/bar` is a literal path that is matched as is.

1. Spaces, tabs and newlines are ignored, so `/ foo / bar` is the same as `/foo/bar`, and `/foo  bar` is the same
   as `/foobar` (note the absent spaces);

1. If you want to preserve spaces, use quotes: `/" foo bar"`

1. `(\\d+)` declares a regular expression, spaces have a meaning inside regular expression;

1. `*` declares a wildcard that matches everything except path separator. For example, `/foo/*/bar` would
   match `/foo/okay/bar` but won't match `/foo/no/sir/bar`;

1. `**` declares a greedy wildcard that matches everything, even path separators. For example, `/foo/**/bar` would match
   both `/foo/okay/bar` and `/foo/no/sir/bar`;

1. `{ foo, bar }` declares an alternation: `foo` or `bar`.

1. Alternation supports nesting, for example `/foo{ -bar, /(\\d+)/qux }` would match `/foo-bar` and `/foo/123/qux`;

1. `:foo` declares a variable;

1. `:foo_www` would read variable with name `foo_www`. To prevent unexpected parsing surround string literals with
   quotes. For example, `:foo _www` and `:foo"_www"` would both read variable `foo` and treat `_www` as a string
   literal;

1. `:foo(\\d+)` declares a variable whose value is restricted to a regular expression;

1. `:foo{ a, b }` declares a variable whose value is restricted to an alternation;

1. `:foo{**}` variables can be restricted with wildcards;

1. Variables can be nested: `/aaa/ :foo{ /bbb, /ccc/:bar }`;
