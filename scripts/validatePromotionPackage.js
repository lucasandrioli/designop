#!/usr/bin/env node
/* Uso: node scripts/validatePromotionPackage.js --round <rodada> [--file <arquivo>] [--root <repositorio>] */
const fs = require('fs')
const path = require('path')
const { validatePromotionPackageData } = require('./validatePromotionPackageCore')

function args(argv) {
  const input = {}
  for (let index = 0; index < argv.length; index += 1) if (argv[index].startsWith('--')) { input[argv[index].slice(2)] = argv[index + 1]; index += 1 }
  return input
}
const input = args(process.argv.slice(2))
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const round = input.round
const file = path.resolve(root, input.file ?? `.designops/runs/${round}/pacote-promocao.json`)
const failures = []
if (!round) failures.push('round e obrigatoria')
let data = null
try { data = JSON.parse(fs.readFileSync(file, 'utf8')) } catch (error) { failures.push('pacote de promocao invalido ou ausente: ' + error.message) }
if (data) failures.push(...validatePromotionPackageData(data, { round, repositoryRoot: root }))
if (data?.schemaVersion === 2) {
  try {
    const verdict = JSON.parse(fs.readFileSync(path.join(root, '.designops/runs', round, 'veredito-validador.json'), 'utf8'))
    const expected = new Set((verdict.resultados ?? []).map((item) => `${item.modalidade}::${item.tela}`))
    const actual = new Set((data.ativosPublicados ?? []).map((item) => `${item.modalidade}::${item.tela}`))
    for (const key of expected) if (!actual.has(key)) failures.push('promocao sem alvo validado: ' + key)
    for (const key of actual) if (!expected.has(key)) failures.push('promocao com alvo fora do veredito: ' + key)
  } catch { failures.push('promocao por momento sem veredito legivel') }
}
console.log(JSON.stringify({ passed: failures.length === 0, round: round ?? null, file: path.relative(root, file), failures }, null, 2))
process.exit(failures.length ? 1 : 0)
