#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { validateAnalystStateData } = require('./validateAnalystStateCore')

const file = process.argv[2]
if (!file) {
  console.error('Uso: node scripts/validateAnalystOperation.js <estado-analista.json>')
  process.exit(1)
}
let state
try { state = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')) } catch (error) {
  console.error('Estado do Analista invalido: ' + error.message)
  process.exit(1)
}
const failures = validateAnalystStateData(state)
if (failures.length) {
  console.error('Estado do Analista reprovado:')
  failures.forEach((failure) => console.error('- ' + failure))
  process.exit(1)
}
console.log('Estado do Analista aprovado: ' + state.status)
