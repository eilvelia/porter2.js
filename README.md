# porter2 &nbsp; [![npm](https://img.shields.io/npm/v/porter2.svg)](https://www.npmjs.com/package/porter2) [![CI](https://github.com/eilvelia/porter2.js/actions/workflows/ci.yml/badge.svg)](https://github.com/eilvelia/porter2.js/actions/workflows/ci.yml)

Very fast JavaScript implementation of the [porter2] English [stemming] algorithm.

```console
$ npm install porter2
```

[porter2]: https://snowballstem.org/algorithms/english/stemmer.html
[stemming]: https://en.wikipedia.org/wiki/Stemming

## Usage

The package is simple: it has no dependencies and exports a single function
named `stem`.

Import using CommonJS:

```javascript
const { stem } = require('porter2')
```

Or, import using EcmaScript Modules (through interoperability with CommonJS):

```javascript
import { stem } from 'porter2'
```

Use the stemmer:

```javascript
const word = stem('animadversion')
console.log(word) //=> animadvers
```

This stemmer expects a lowercase English word.

TypeScript type declarations are included.

## Benchmarks

Here is a comparison with some other libraries benchmarked over the 29.4k test suite in a
hot loop (you probably should take it with a little grain of salt):

| library                              | throughput (node) | throughput (bun) | slower  |
| ------------------------------------ | ----------------- | ---------------- | ------- |
| porter2 2.0.0                        | 11157 kops/s      | 11092 kops/s     | 1.000×  |
| [stemr][] 1.0.0                      | 958 kops/s        | 1194 kops/s      | 11.641× |
| [wink-porter2-stemmer][] [^1] 2.0.1  | 325 kops/s        | 407 kops/s       | 34.319× |

[stemr]: https://github.com/localvoid/stemr
[wink-porter2-stemmer]: https://github.com/winkjs/wink-porter2-stemmer

Here are libraries that implement the older porter version 1 (note the behavior is
not identical):

| library                              | throughput (node) | throughput (bun) | slower  |
| ------------------------------------ | ----------------- | ---------------- | ------- |
| [porter-stemmer-js][] [^2] 1.1.2     | 3081 kops/s       | 3583 kops/s      | 3.621×  |
| [stemmer][] [^3] 2.0.1               | 2030 kops/s       | 1789 kops/s      | 5.496×  |
| [@stdlib/nlp-porter-stemmer][] 0.2.3 | 1588 kops/s       | 1523 kops/s      | 7.024×  |
| [porter-stemmer][] 0.9.1             | 902 kops/s        | 1245 kops/s      | 12.373× |

[porter-stemmer-js]: https://github.com/evi1Husky/PorterStemmer
[stemmer]: https://github.com/words/stemmer
[@stdlib/nlp-porter-stemmer]: https://github.com/stdlib-js/nlp-porter-stemmer
[porter-stemmer]: https://github.com/jedp/porter-stemmer

The benchmark code is in [bench/run.mjs](bench/run.mjs) ([bench/all.mjs](bench/all.mjs)
for all libraries). This was tested with Node.js v24.15.0 and bun v1.3.13 on Zen 3 (4.5
GHz boosted).

[^1]: `wink-porter2-stemmer` is 99.97% porter2 compliant (fails on `'` cases only)

[^2]: That one has similar goals and, surprisingly, was published just 3 days
before this package! (And after the author started working on porter2.js.)

[^3]: ESM only
