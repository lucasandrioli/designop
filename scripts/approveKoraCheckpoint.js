#!/usr/bin/env node
/* Registra uma aprovacao humana e libera apenas o proximo papel permitido. */
const fs = require('fs')
const path = require('path')
const { TRANSITIONS, validateKoraStateData } = require('./validateKoraStateCore')

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
const checkpoint = String(input.checkpoint ?? '').toLowerCase()
const file = round ? path.join(root, '.designops', 'runs', round, 'kora.json') : null
const state = file && fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null
const failures = []
if (!state) failures.push('estado Kora ausente')
if (state) failures.push(...validateKoraStateData(state, { round, repositoryRoot: root }))
const expected = checkpoint === 'contrato'
  ? { status: 'AGUARDANDO_APROVACAO_CONTRATO', next: 'MONTANDO', type: 'CONTRATO' }
  : checkpoint === 'promocao'
    ? { status: 'AGUARDANDO_APROVACAO_PROMOCAO', next: 'PROMOVENDO', type: 'PROMOCAO' }
    : null
if (!expected) failures.push('checkpoint precisa ser contrato ou promocao')
if (state && expected && state.status !== expected.status) failures.push('a rodada nao esta aguardando esta aprovacao')
if (state && expected && !(TRANSITIONS[state.status] ?? []).includes(expected.next)) failures.push('transicao de aprovacao nao permitida')
if (failures.length) {
  process.stdout.write(JSON.stringify({ passed: false, failures }, null, 2) + '\n')
  process.exit(1)
}
const occurredEm = new Date().toISOString()
state.aprovacoes[checkpoint] = { tipo: expected.type, decisao: 'APROVADA', confirmadoPor: 'DESIGNER', ocorreuEm }
if (checkpoint === 'contrato') {
  state.checkpoints.contrato.status = 'APROVADO'
  state.checkpoints.montagem.status = 'EM_ANDAMENTO'
} else {
  state.checkpoints.promocao.status = 'APROVADA'
}
state.status = expected.next
state.historico.push({ de: expected.status, para: expected.next, ocorreuEm, motivo: 'Aprovacao humana registrada: ' + expected.type })
const validation = validateKoraStateData(state, { round, repositoryRoot: root })
if (validation.length) {
  process.stdout.write(JSON.stringify({ passed: false, failures: validation }, null, 2) + '\n')
  process.exit(1)
}
fs.writeFileSync(file, JSON.stringify(state, null, 2) + '\n')
if (checkpoint === 'promocao') {
  fs.writeFileSync(path.join(path.dirname(file), 'aprovacao-promocao.json'), JSON.stringify(state, null, 2) + '\n')
}
process.stdout.write(JSON.stringify({ passed: true, round, status: state.status, mensagemHumana: checkpoint === 'contrato' ? 'A aprovacao foi registrada. A montagem pode comecar.' : 'A aprovacao foi registrada. A promocao pode comecar.' }, null, 2) + '\n')
