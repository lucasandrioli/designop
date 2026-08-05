#!/usr/bin/env node
/*
 * Valida o recibo de montagem antes de entregar a rodada ao Validador.
 * Uso: node scripts/validateAssemblyPackage.js --round <id> [--root <repositorio>]
 */
const fs = require('fs')
const path = require('path')
const { validateAssemblyPackageData } = require('./validateAssemblyPackageCore')

function args(argv) {
  const input = {}
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) continue
    input[argv[index].slice(2)] = argv[index + 1]
    index += 1
  }
  return input
}

const input = args(process.argv.slice(2))
const repositoryRoot = path.resolve(input.root ?? path.join(__dirname, '..'))
const round = input.round
const file = round ? path.join(repositoryRoot, '.designops', 'runs', round, 'pacote-montagem.json') : null
const failures = []
let data = null
if (!round) failures.push('round obrigatoria')
if (file && !fs.existsSync(file)) failures.push('pacote de montagem ausente: .designops/runs/<rodada>/pacote-montagem.json')
if (file && fs.existsSync(file)) {
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')) }
  catch (error) { failures.push('pacote de montagem invalido: ' + error.message) }
}
if (data) failures.push(...validateAssemblyPackageData(data, { round, repositoryRoot }))
const passed = failures.length === 0
console.log(JSON.stringify({ round: round ?? null, packageFile: file ? path.relative(repositoryRoot, file) : null, passed, failures }, null, 2))
process.exit(passed ? 0 : 1)
