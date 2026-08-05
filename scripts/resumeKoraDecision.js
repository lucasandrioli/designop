#!/usr/bin/env node
/* Registra a resposta humana e entrega a rodada de volta ao papel responsavel. */
const fs = require('fs')
const path = require('path')
const { TRANSITIONS, STATUSES, validateKoraStateData } = require('./validateKoraStateCore')

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
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const round = input.round
const next = input.resume
const file = round ? path.join(root, '.designops', 'runs', round, 'kora.json') : null
const failures = []
if (!round || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(round)) failures.push('round invalida')
if (!STATUSES.includes(next) || !(TRANSITIONS.AGUARDANDO_DECISAO_DO_DESIGNER ?? []).includes(next)) failures.push('resume precisa ser um proximo estado permitido')
if (!String(input.decision ?? '').trim() || !String(input.answer ?? '').trim()) failures.push('informe decision e answer')
if (!file || !fs.existsSync(file)) failures.push('estado Kora ausente')
let state = null
if (!failures.length) {
  try { state = JSON.parse(fs.readFileSync(file, 'utf8')) } catch { failures.push('estado Kora invalido') }
}
if (state) {
  failures.push(...validateKoraStateData(state, { round, repositoryRoot: root }))
  if (state.status !== 'AGUARDANDO_DECISAO_DO_DESIGNER') failures.push('a rodada nao esta aguardando decisao humana')
  const decision = state.decisoes.find((item) => item.id === input.decision && item.status === 'PENDENTE')
  if (!decision) failures.push('decisao pendente nao encontrada')
  if (!failures.length) {
    decision.status = 'RESPONDIDA'
    decision.resposta = String(input.answer).trim()
    decision.respondidaEm = new Date().toISOString()
    if (state.decisoes.some((item) => item.status === 'PENDENTE')) failures.push('ainda ha outra decisao pendente nesta rodada')
    state.status = next
    state.historico.push({ de: 'AGUARDANDO_DECISAO_DO_DESIGNER', para: next, ocorreuEm: new Date().toISOString(), motivo: 'Decisao humana registrada: ' + input.decision })
    failures.push(...validateKoraStateData(state, { round, repositoryRoot: root }))
  }
}
if (failures.length) {
  process.stderr.write(JSON.stringify({ passed: false, failures }) + '\n')
  process.exit(1)
}
fs.writeFileSync(file, JSON.stringify(state, null, 2) + '\n')
process.stdout.write(JSON.stringify({ passed: true, round, status: state.status, mensagemHumana: 'A decisao foi registrada. A Kora devolveu a rodada ao proximo trabalho interno.' }) + '\n')
