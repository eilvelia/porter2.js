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

On my machine, the 29.4k test suite executes in ~10 ms (~3M/s throughput) in a
hot loop (~70ms for the first run).

The benchmark code is in `bench/index.js`.

Here is a comparison with some other libraries (you probably should take it with
a little grain of salt):

| library                              | throughput    |
| ------------------------------------ | ------------- |
| porter2.js                           | 3120 kops/s   |
| [stemr][]                            | 354 kops/s    |
| [wink-porter2-stemmer][] [^1]        | 168 kops/s    |

[stemr]: https://github.com/localvoid/stemr
[wink-porter2-stemmer]: https://github.com/winkjs/wink-porter2-stemmer

Here are libraries that implement older porter 1 (note the behavior is not
identical):

| library                              | throughput    |
| ------------------------------------ | ------------- |
| [porter-stemmer-js][] [^2]           | 1430 kops/s   |
| [stemmer][] [^3]                     | 1121 kops/s   |
| [@stdlib/nlp-porter-stemmer][]       | 839 kops/s    |
| [porter-stemmer][]                   | 514 kops/s    |

[porter-stemmer-js]: https://github.com/evi1Husky/PorterStemmer
[stemmer]: https://github.com/words/stemmer
[@stdlib/nlp-porter-stemmer]: https://github.com/stdlib-js/nlp-porter-stemmer
[porter-stemmer]: https://github.com/jedp/porter-stemmer

This is tested with Node.js v20.12.2. bun v1.1.4 shows a little bit different
but comparable results.

[^1]: 99.97% porter2 compliant (fails on `'` cases only)

[^2]: That one has similar goals and, surprisingly, was published just 3 days
before this package was released! (And after I started working on it.)

[^3]: ESM only
