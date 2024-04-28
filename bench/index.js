const fs = require('node:fs')
const path = require('node:path')

const toRequire = process.env.LIBRARY ?? '../dist'
console.log(`Requiring ${toRequire}`)
let stem = require(toRequire)
if (toRequire === 'wink-porter2-stemmer' || toRequire === 'porter-stemmer-js')
  ;
else if (toRequire === 'porter-stemmer')
  stem = stem.stemmer
else
  stem = stem.stem

let words = fs.readFileSync(path.join(__dirname, '..', 'test', 'english.txt'))
  .toString()
  .trim()
  .split(/\r?\n/)

let average = null
// gc()
console.profile('aa')
for (let run = 1; run <= 30; run++) {
  // words = words.map(x => x)
  const startTime = performance.now()
  // let out = ''
  let i = 0
  for (; i < words.length; i++) {
    const result = stem(words[i])
    // out += result
  }
  const endTime = performance.now()
  // console.log(out)
  const elapsed = endTime - startTime
  console.log(elapsed)
  if (run >= 5)
    average = average == null
      ? elapsed
      : ((run - 5) * average + elapsed) / (run - 4)
}
console.profileEnd('aa')

const ops = (words.length / average).toFixed(2)
console.log(`Average: ${average.toFixed(6)}ms (warmup: 4), ${ops}k ops/s`)
