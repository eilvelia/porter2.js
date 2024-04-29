# porter2 &nbsp; [![npm](https://img.shields.io/npm/v/porter2.svg)](https://www.npmjs.com/package/porter2) [![CI](https://github.com/Bannerets/porter2.js/actions/workflows/ci.yml/badge.svg)](https://github.com/Bannerets/porter2.js/actions/workflows/ci.yml)

Fast JavaScript implementation of the [porter2] English [stemming] algorithm.

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

Or, import using EcmaScript Modules (through interopability with CommonJS):

```javascript
import { stem } from 'porter2'
```

Use the stemmer:

```javascript
const word = stem('animadversion')
console.log(word) //=> animadvers
```

This stemmer expects lowercase text.

The code is compatible with ES5. TypeScript type declarations are included.

## Benchmarks

On my machine, the 29.4k test suite executes in ~9.5ms (~3M/s throughput) in a
hot loop (~70ms for the first run).

Here is a comparison with some other libraries (you probably should take it with
a little grain of salt):

| library                              | throughput (node) | throughput (bun) |
| ------------------------------------ | ----------------- | ---------------- |
| porter2.js                           | 3118 kops/s       | 3283 kops/s      |
| [stemr][]                            | 342 kops/s        | 367 kops/s       |
| [wink-porter2-stemmer][] [^1]        | 162 kops/s        | 174 kops/s       |

[stemr]: https://github.com/localvoid/stemr
[wink-porter2-stemmer]: https://github.com/winkjs/wink-porter2-stemmer

Here are libraries that implement older porter 1 (note the behavior is not
identical):

| library                              | throughput (node) | throughput (bun) |
| ------------------------------------ | ----------------- | ---------------- |
| [porter-stemmer-js][] [^2]           | 1422 kops/s       | 1484 kops/s      |
| [stemmer][] [^3]                     | 1064 kops/s       | 623 kops/s       |
| [@stdlib/nlp-porter-stemmer][]       | 842 kops/s        | 685 kops/s       |
| [porter-stemmer][]                   | 497 kops/s        | 520 kops/s       |

[porter-stemmer-js]: https://github.com/evi1Husky/PorterStemmer
[stemmer]: https://github.com/words/stemmer
[@stdlib/nlp-porter-stemmer]: https://github.com/stdlib-js/nlp-porter-stemmer
[porter-stemmer]: https://github.com/jedp/porter-stemmer

The benchmark code is in `bench/run.mjs`.

This is tested with Node.js v20.12.2 and bun v1.1.4. The library versions are
latest as of 2024-04-29.

[^1]: 99.97% porter2 compliant (fails on `'` cases only)

[^2]: That one has similar goals and, surprisingly, was published just 3 days
before this package was released! (And after I started working on porter2.js.)

[^3]: ESM only
