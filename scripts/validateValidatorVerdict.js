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
console.log(JSON.stringify({ passed: failures.length === 0, round: round ?? null, file: path.relative(root, file), resultado: data?.resultado ?? null, failures }, null, 2))
process.exit(failures.length ? 1 : 0)
