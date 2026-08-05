#!/usr/bin/env node
/*
 * Valida a fonte de verdade da rodada Kora.
 * Uso: node scripts/validateKoraRound.js --round <id> [--root <repositorio>] [--expect-status <status>]
 */
const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const { STATUSES, validateKoraStateData } = require('./validateKoraStateCore')

function args(argv) {
  const input = {}
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) continue
    input[argv[index].slice(2)] = argv[index + 1]
    index += 1
  }
  return input
}

function operatorMessage(status, passed) {
  if (!passed) return 'A Kora encontrou uma inconsistência interna e não vai avançar esta rodada.'
  if (status === 'AGUARDANDO_APROVACAO_CONTRATO') return 'A proposta está pronta. A Kora aguarda sua aprovação para iniciar a montagem.'
  if (status === 'AGUARDANDO_APROVACAO_PROMOCAO') return 'A validação foi favorável. A Kora aguarda sua aprovação para promover a rodada.'
  if (status === 'AGUARDANDO_DECISAO_DO_DESIGNER') return 'A Kora precisa de uma decisão de produto antes de seguir.'
  if (status === 'BLOQUEADA') return 'A Kora registrou um impedimento e não seguirá sem removê-lo.'
  if (status === 'INTERROMPIDA') return 'A rodada foi interrompida e pode ser retomada com o motivo registrado.'
  if (status === 'CONCLUIDA') return 'A rodada está concluída.'
  return 'A rodada está consistente e pode continuar na próxima etapa interna.'
}

const input = args(process.argv.slice(2))
const round = input.round
const repositoryRoot = path.resolve(input.root ?? path.join(__dirname, '..'))
const failures = []
if (!round || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(round)) failures.push('round invalida; use somente letras, numeros, ponto, hifen ou sublinhado')
if (input['expect-status'] && !STATUSES.includes(input['expect-status'])) failures.push('expect-status invalido')
const file = round ? path.join(repositoryRoot, '.designops', 'runs', round, 'kora.json') : null
let state = null
if (file && !fs.existsSync(file)) failures.push('estado Kora ausente: .designops/runs/<rodada>/kora.json')
if (file && fs.existsSync(file)) {
  try { state = JSON.parse(fs.readFileSync(file, 'utf8')) } catch (error) { failures.push('estado Kora invalido: ' + error.message) }
}
if (state) failures.push(...validateKoraStateData(state, { round, repositoryRoot }))
if (state && input['expect-status'] && state.status !== input['expect-status']) failures.push(`status esperado ${input['expect-status']}, encontrado ${state.status}`)
const statusesThatRequireAnalysisGate = new Set([
  'AGUARDANDO_APROVACAO_CONTRATO',
  'MONTANDO',
  'VALIDANDO',
  'AGUARDANDO_APROVACAO_PROMOCAO',
  'CONCLUIDA',
])
let analysisGate = null
if (state && statusesThatRequireAnalysisGate.has(state.status)) {
  const result = childProcess.spawnSync(process.execPath, [path.join(repositoryRoot, 'scripts', 'validateAnalysisRound.js'), '--round', round, '--stage', 'pre-proposta'], { cwd: repositoryRoot, encoding: 'utf8' })
  try { analysisGate = JSON.parse(result.stdout) } catch { analysisGate = { passed: false, failures: ['resultado do gate de analise nao estava em JSON valido'] } }
  if (result.status !== 0 || analysisGate.passed !== true) failures.push('gate de analise pre-proposta reprovado para esta rodada')
}
let packagesGate = null
if (state) {
  const result = childProcess.spawnSync(process.execPath, [path.join(repositoryRoot, 'scripts', 'validateKoraPackages.js'), '--round', round, '--root', repositoryRoot], { cwd: repositoryRoot, encoding: 'utf8' })
  try { packagesGate = JSON.parse(result.stdout) } catch { packagesGate = { passed: false, failures: ['resultado dos recibos nao estava em JSON valido'] } }
  if (result.status !== 0 || packagesGate.passed !== true) failures.push('recibos obrigatorios da fase reprovados para esta rodada')
}
const passed = failures.length === 0
console.log(JSON.stringify({
  round: round ?? null,
  stateFile: file ? path.relative(repositoryRoot, file) : null,
  passed,
  status: state?.status ?? null,
  failures,
  analysisGate: analysisGate ? { passed: analysisGate.passed === true } : null,
  packagesGate: packagesGate ? { passed: packagesGate.passed === true } : null,
  operator: { mensagemHumana: operatorMessage(state?.status, passed) },
}, null, 2))
process.exit(passed ? 0 : 1)
