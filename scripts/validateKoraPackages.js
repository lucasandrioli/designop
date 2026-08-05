#!/usr/bin/env node
/* Confere apenas os recibos que Kora precisa para cada passagem de estado. */
const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

function args(argv) {
  const input = {}
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) continue
    input[argv[index].slice(2)] = argv[index + 1]
    index += 1
  }
  return input
}
function readState(root, round) {
  try { return JSON.parse(fs.readFileSync(path.join(root, '.designops', 'runs', round, 'kora.json'), 'utf8')) } catch { return null }
}
function run(root, script, round) {
  const result = childProcess.spawnSync(process.execPath, [path.join(root, 'scripts', script), '--round', round, '--root', root], { cwd: root, encoding: 'utf8' })
  let report = null
  try { report = JSON.parse(result.stdout) } catch {}
  return { passed: result.status === 0 && report?.passed === true, failures: report?.failures ?? ['recibo nao retornou resultado valido'] }
}

const input = args(process.argv.slice(2))
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const round = input.round
const state = round ? readState(root, round) : null
const failures = []
if (!round || !state) failures.push('estado da rodada indisponivel')
const requirements = state?.pacotes ? (state?.tipoRodada === 'COMPOSICAO_ETAPA' ? ({
  AGUARDANDO_APROVACAO_CONTRATO: ['analista'],
  MONTANDO: ['analista'],
  VALIDANDO: ['analista', 'montagem'],
  CONCLUIDA: ['analista', 'montagem', 'veredito'],
}[state?.status] ?? []) : ({
  AGUARDANDO_APROVACAO_CONTRATO: ['analista'],
  MONTANDO: ['analista'],
  VALIDANDO: ['analista', 'montagem'],
  AGUARDANDO_APROVACAO_PROMOCAO: ['analista', 'montagem', 'veredito'],
  PROMOVENDO: ['analista', 'montagem', 'veredito'],
  CONCLUIDA: ['analista', 'montagem', 'veredito', 'promocao'],
}[state?.status] ?? [])) : []
const scripts = state?.tipoRodada === 'COMPOSICAO_ETAPA'
  ? { analista: 'validateStageCompositionProposal.js', montagem: 'validateStageCompositionAssembly.js', veredito: 'validateStageCompositionPackage.js' }
  : { analista: 'validateAnalystPackage.js', montagem: 'validateAssemblyPackage.js', veredito: 'validateValidatorVerdict.js', promocao: 'validatePromotionPackage.js' }
const reports = {}
for (const name of requirements) {
  const receipt = state?.pacotes?.[name]
  if (!receipt) { failures.push('recibo ausente: ' + name); continue }
  const result = run(root, scripts[name], round)
  reports[name] = { passed: result.passed }
  if (!result.passed) failures.push('recibo reprovado: ' + name + ' (' + result.failures.join('; ') + ')')
}
const passed = failures.length === 0
process.stdout.write(JSON.stringify({ passed, round: round ?? null, status: state?.status ?? null, receipts: reports, failures }, null, 2) + '\n')
process.exit(passed ? 0 : 1)
