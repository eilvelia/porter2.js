const fs = require('node:fs')
const path = require('node:path')

const words = fs.readFileSync(path.join(__dirname, '..', 'test', 'english.txt'))
  .toString()
  .trim()
  .split(/\r?\n/)

let string = '// AUTOGENERATED\nexports.words = [\n'

for (let i = 0; i < 2_000_000; i++)
  string += `"${words[Math.floor(Math.random() * words.length)]}",\n`

string += ']\n'

fs.writeFileSync(path.join(__dirname, 'bench-set.js'), string)
