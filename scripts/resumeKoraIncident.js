#!/usr/bin/env node
/* Retoma apenas a fase segura depois de uma correcao integrada no repositorio. */
const childProcess = require('child_process')
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
function commitIntegrated(root, commit) {
  if (!/^[a-f0-9]{7,64}$/.test(commit ?? '')) return false
  return childProcess.spawnSync('git', ['merge-base', '--is-ancestor', commit, 'HEAD'], { cwd: root }).status === 0
}

const input = args(process.argv.slice(2))
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const round = input.round
const stateFile = round ? path.join(root, '.designops', 'runs', round, 'kora.json') : null
const state = stateFile && fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : null
const failures = []
if (!state) failures.push('estado Kora ausente')
if (state) failures.push(...validateKoraStateData(state, { round, repositoryRoot: root }))
const incident = state?.incidenteOperacao
if (!incident || incident?.id !== input.incident || incident?.status !== 'ABERTO' || state?.status !== 'INTERROMPIDA' || !String(state?.motivoInterrupcao ?? '').endsWith(input.incident ?? '')) failures.push('incidente aberto nao encontrado na rodada interrompida')
if (!commitIntegrated(root, input['correction-commit'])) failures.push('correction-commit precisa estar integrado na worktree atual')
if (failures.length) {
  process.stdout.write(JSON.stringify({ passed: false, failures }, null, 2) + '\n')
  process.exit(1)
}
const resume = incident.pontoRetomada
if (!(TRANSITIONS.INTERROMPIDA ?? []).includes(resume)) failures.push('ponto de retomada nao permitido')
if (resume === 'ANALISANDO') {
  state.checkpoints.analise = { status: 'EM_ANDAMENTO', gatePreProposta: false, reconciliada: false }
  state.checkpoints.contrato.status = 'PENDENTE'
  state.checkpoints.montagem.status = 'PENDENTE'
  state.checkpoints.validacao.status = 'PENDENTE'
  state.checkpoints.promocao.status = 'PENDENTE'
  state.aprovacoes = { contrato: null, promocao: null }
  state.recibos = state.recibos.filter((receipt) => receipt.checkpoint === 'AUDITORIA')
}
if (resume === 'MONTANDO') {
  state.checkpoints.montagem.status = 'EM_ANDAMENTO'
  state.checkpoints.validacao.status = 'PENDENTE'
  state.checkpoints.promocao.status = 'PENDENTE'
  state.aprovacoes.promocao = null
  state.recibos = state.recibos.filter((receipt) => !['MONTAGEM', 'VALIDACAO'].includes(receipt.checkpoint))
}
if (resume === 'VALIDANDO') {
  state.checkpoints.validacao.status = 'EM_ANDAMENTO'
  state.checkpoints.promocao.status = 'PENDENTE'
  state.aprovacoes.promocao = null
  state.recibos = state.recibos.filter((receipt) => receipt.checkpoint !== 'VALIDACAO')
}
state.status = resume
state.motivoInterrupcao = null
state.incidenteOperacao.status = 'RETOMADO'
state.incidenteOperacao.retomadoEm = new Date().toISOString()
state.incidenteOperacao.correcaoCommit = input['correction-commit']
state.historico.push({ de: 'INTERROMPIDA', para: resume, ocorreuEm: new Date().toISOString(), motivo: 'Correcao integrada para incidente: ' + incident.id })
const validation = validateKoraStateData(state, { round, repositoryRoot: root })
if (validation.length) {
  process.stdout.write(JSON.stringify({ passed: false, failures: validation }, null, 2) + '\n')
  process.exit(1)
}
fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n')
process.stdout.write(JSON.stringify({ passed: true, round, incidentId: incident.id, status: resume, mensagemHumana: 'A correcao foi reconhecida. A Kora retomou somente a fase que precisa ser verificada de novo.' }, null, 2) + '\n')
