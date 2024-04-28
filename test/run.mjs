import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { stem } from '../dist/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exp = (await fsp.readFile(path.join(__dirname, 'english.exp.txt')))
  .toString().split(/\r?\n/)
const testFile = await fsp.open(path.join(__dirname, 'english.txt'))
let total = 0
let failed = 0
for await (const line of testFile.readLines()) {
  const stemmed = stem(line)
  const expected = exp[total]
  total++
  if (stemmed !== expected) {
    console.error(`${total} |${line}| -> |${stemmed}| exp:|${expected}|`)
    failed++
  }
}
console.log(`Failed: ${failed} | Total: ${total}`)
if (failed > 0) {
  process.exitCode = 1
}
