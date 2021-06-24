# route-pattern [![Build Status](https://travis-ci.com/smikhalevski/route-pattern.svg?branch=master)](https://travis-ci.com/smikhalevski/route-pattern)

The path pattern parser, that supports named variables, variable constraints, bash-like alternation, regular
expressions, and wildcards.

This package is
tiny, [just 2.2 kB gzipped including dependencies.](https://bundlephobia.com/package/@smikhalevski/route-pattern)

```sh
npm install --save-prod @smikhalevski/route-pattern
```

# Usage

```ts
import {convertPatternToRegExp} from '@smikhalevski/route-pattern';

const re = convertPatternToRegExp('/(\\d+)/:foo{ bar, qux }');
const match = re.exec('/123/bar');

console.log(match?.groups?.foo); // → 'bar'
```

The support of named capturing groups **is not required** from the environment.

# Features

`/foo/bar` is a literal path that is matched as is.

Spaces, tabs, and newlines are ignored, so `/ foo / bar` is the same as `/foo/bar`, and `/foo  bar` is the same
as `/foobar` (note the absent spaces).

If you want to preserve spaces, use quotes: `/" foo bar"`.

## Regular expression

`(\\d+)` declares a regular expression, spaces have meaning inside a regular expression.

RegExps can contain a named capturing groups which are merged with variables. For example, `/:foo/(?<bar>abc)` would
match `/123/abc` and groups would be `{foo: '123', bar: 'abc'}`.

## Wildcards

`*` declares a wildcard that matches everything except the path separator. For example, `/foo/*/bar` would
match `/foo/okay/bar` and `/foo//bar` but won't match `/foo/no/sir/bar`.

`**` declares a greedy wildcard that matches everything, even path separators. For example, `/foo/**/bar` would
match `/foo/okay/bar`, `/foo//bar` and `/foo/no/sir/bar`.

If you want to match at least one character, use a regular expression instead of a wildcard. For
example, `/foo/([^/]+)/bar` would match `/foo/okay/bar` and won't match `/foo//bar`.

## Alternation

`{ foo, bar }` declares an alternation: `foo` or `bar`.

Alternation supports nesting, for example `/foo{ -bar, /(\\d+)/qux }` would match `/foo-bar` and `/foo/123/qux`.

## Variables

`:foo` declares a variable. Variable name should match `^[A-Za-z0-9$_]+$`.

By default, variables match everything except the path separator.

A single pattern that immediately follows the variable declaration is treated as a variable constraint. For example,`:foo bar` and `:foo"bar"` would both read variable `foo` and treat `bar` as its string literal constraint.

`:foo(\\d+)` declares a variable whose value is constrained by a regular expression.

`:foo{ a, b }` declares a variable whose value is constrained by an alternation.

`:foo{**}` variables can be constrained with wildcards.

Variables can be nested through an alternation: `/aaa/ :foo{ /bbb, /ccc/:bar }`.

Variables are not treated as constraints for other variables. For example, `:foo:bar{abc}` would match `123abc` and
groups would be `{foo: '123', bar: 'abc'}`.
