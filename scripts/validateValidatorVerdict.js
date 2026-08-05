#!/usr/bin/env node
/* Uso: node scripts/validateValidatorVerdict.js --round <rodada> [--file <arquivo>] [--root <repositorio>] */
const fs = require('fs')
const path = require('path')
const { validateValidatorVerdictData } = require('./validateValidatorVerdictCore')

function args(argv) {
  const input = {}
  for (let index = 0; index < argv.length; index += 1) if (argv[index].startsWith('--')) { input[argv[index].slice(2)] = argv[index + 1]; index += 1 }
  return input
}
const input = args(process.argv.slice(2))
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const round = input.round
const file = path.resolve(root, input.file ?? `.designops/runs/${round}/veredito-validador.json`)
const failures = []
if (!round) failures.push('round e obrigatoria')
let data = null
try { data = JSON.parse(fs.readFileSync(file, 'utf8')) } catch (error) { failures.push('veredito invalido ou ausente: ' + error.message) }
if (data) failures.push(...validateValidatorVerdictData(data, { round, repositoryRoot: root }))
if (data?.schemaVersion === 2) {
  try {
    const assembly = JSON.parse(fs.readFileSync(path.join(root, '.designops/runs', round, 'pacote-montagem.json'), 'utf8'))
    const expected = new Set((assembly.alvos ?? []).map((item) => `${item.modalidade}::${item.tela}`))
    const actual = new Set((data.resultados ?? []).map((item) => `${item.modalidade}::${item.tela}`))
    for (const key of expected) if (!actual.has(key)) failures.push('veredito sem alvo montado: ' + key)
    for (const key of actual) if (!expected.has(key)) failures.push('veredito com alvo fora da montagem: ' + key)
  } catch { failures.push('veredito por momento sem pacote de montagem legivel') }
}
console.log(JSON.stringify({ passed: failures.length === 0, round: round ?? null, file: path.relative(root, file), resultado: data?.resultado ?? null, failures }, null, 2))
process.exit(failures.length ? 1 : 0)
