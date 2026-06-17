import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { stem } from '../dist/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const expectedWords = (await fsp.readFile(path.join(__dirname, 'english.exp.txt')))
  .toString().split(/\r?\n/)
const testFile = await fsp.open(path.join(__dirname, 'english.txt'))
let total = 0
let failed = 0
for await (const line of testFile.readLines()) {
  const stemmed = stem(line)
  const expected = expectedWords[total]
  total++
  if (stemmed !== expected) {
    console.error(`${total} |${line}| -> |${stemmed}| exp:|${expected}|`)
    failed++
  }
}
console.log(`[Test suite] Failed: ${failed} | Total: ${total}`)

const edgeCaseTests = [
  // y
  ['happy', 'happi'],
  ['enjoy', 'enjoy'],
  ['yearly', 'year'],
  // uppercase Y
  ['happY', 'happi'],
  ['Y', 'Y'],
  // non-ASCII letters
  ['привет', 'привет'],
  ['словарь', 'словарь'],
  ['😀😀😀', '😀😀😀'],
  ['running😀ing', 'running😀'],
  // very long words
  ['ab'.repeat(159) + 'ation', 'ab'.repeat(159)],
  ['n'.repeat(127), 'n'.repeat(127)],
  ['n'.repeat(128), 'n'.repeat(128)],
  ['n'.repeat(200), 'n'.repeat(200)],
  // untested by the test suite
  ['skis', 'ski'],         // exception1
  ['arsenal', 'arsenal'],  // R1 special prefix
  ["dog's", 'dog'],        // trailing 's
  ['inning', 'inning'],    // exception2 (len 6)
  ['outing', 'outing'],    // exception2 (len 6)
  ['herring', 'herring'],  // exception2 (len 7)
]
let edgeTotal = 0
let edgeFailed = 0
for (const [input, expected] of edgeCaseTests) {
  const stemmed = stem(input)
  edgeTotal++
  if (stemmed !== expected) {
    console.error(`${edgeTotal} |${input}| -> |${stemmed}| exp:|${expected}|`)
    edgeFailed++
  }
}
console.log(`[Edge cases] Failed: ${edgeFailed} | Total: ${edgeTotal}`)

if (failed > 0 || edgeFailed > 0) {
  process.exitCode = 1
}
