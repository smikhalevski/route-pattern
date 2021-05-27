json-bigint

1. `:foo` variable;
1. `{ a, b }` alternation: `a` or `b`;
1. `(\\d+)` regular expression, spaces have a meaning inside regular expression;
1. `:foo{ a, b }` variable whose value is restricted to the given alternation;
1. `:foo(\\d+)` variable whose value is restricted to the given regular expression;
1. `{ (a-z), (\\d+) }` alternation supports nesting;
1. `/aaa/ :foo{ /bbb, /ccc/:bar }` variables can be nested too;
1. `/aaa/*/bbb` wildcard matches everything except path separator;
1. `/aaa/**/bbb` greedy wildcard matches everything, even path separators;
1. `:foo{**}` variables can be restricted with wildcards;
1. `:foo_www` would read variable with name `foo_www`. To prevent unexpected parsing surround string
   literals with quotes. `:foo"_www"` would read variable `foo` and treat `_www` as a string literal;
