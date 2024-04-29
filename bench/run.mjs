const name = process.env.LIBRARY ?? '../dist/index.js'
console.error(`Importing ${name}`)
let stem = await import(name)
if (name === 'wink-porter2-stemmer' || name === '@stdlib/nlp-porter-stemmer')
  stem = stem.default
else if (name === 'porter-stemmer-js') stem = stem.PorterStemmer
else if (name === 'porter-stemmer') stem = stem.stemmer
else if (name === 'stemmer') stem = stem.stemmer
else stem = stem.stem

import { words } from './bench-set.js'

console.error('Warming up')
for (let i = 0; i < words.length; ++i) stem(words[i])
for (let i = 0; i < words.length; ++i) stem(words[i])
console.error('Benchmarking')
// console.profile('porter') // Can be called to use the chrome profiler
// let out = ''
const startTime = performance.now()
let i = 0
for (; i < words.length; ++i) {
  const result = stem(words[i])
  // out += result
}
const endTime = performance.now()
// console.log(out)
const elapsed = endTime - startTime
console.error(`${elapsed.toFixed(5)}ms for a set of ${words.length} words`)
console.error(`${(words.length / elapsed).toFixed(2)}k ops/s`)
// console.profileEnd('porter')
