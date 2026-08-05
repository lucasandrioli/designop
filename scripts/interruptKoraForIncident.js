#!/usr/bin/env node
/* Interrompe uma rodada para manutencao sem permitir que Kora edite codigo. */
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
function readJson(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null } }

const input = args(process.argv.slice(2))
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const round = input.round
const stateFile = round ? path.join(root, '.designops', 'runs', round, 'kora.json') : null
const incidentFile = round && input.incident ? path.join(root, '.designops', 'audit', 'rodada-' + round, 'incidentes', input.incident, 'incidente.json') : null
const state = stateFile && fs.existsSync(stateFile) ? readJson(stateFile) : null
const incident = incidentFile && fs.existsSync(incidentFile) ? readJson(incidentFile) : null
const failures = []
if (!state) failures.push('estado Kora ausente ou invalido')
if (!incident || incident?.id !== input.incident || incident?.rodada !== round || incident?.status !== 'ABERTO' || incident?.classificacao !== 'INCIDENTE_DA_OPERACAO') failures.push('incidente operacional ausente ou invalido')
if (state) failures.push(...validateKoraStateData(state, { round, repositoryRoot: root }))
if (state && !(TRANSITIONS[state.status] ?? []).includes('INTERROMPIDA')) failures.push('estado atual nao pode ser interrompido com seguranca')
if (failures.length) {
  process.stdout.write(JSON.stringify({ passed: false, failures }, null, 2) + '\n')
  process.exit(1)
}
state.status = 'INTERROMPIDA'
state.motivoInterrupcao = 'INCIDENTE_DA_OPERACAO:' + incident.id
state.incidenteOperacao = {
  id: incident.id,
  classificacao: incident.classificacao,
  fase: incident.fase,
  papel: incident.papel,
  impacto: incident.impacto,
  versaoBase: incident.versaoBase,
  pontoRetomada: incident.pontoRetomada,
  status: 'ABERTO',
  criadoEm: incident.criadoEm,
  retomadoEm: null,
  correcaoCommit: null,
}
state.historico.push({ de: state.historico.length ? state.historico.at(-1).para : 'PREPARANDO', para: 'INTERROMPIDA', ocorreuEm: new Date().toISOString(), motivo: 'Incidente da operacao: ' + incident.id })
const validation = validateKoraStateData(state, { round, repositoryRoot: root })
if (validation.length) {
  process.stdout.write(JSON.stringify({ passed: false, failures: validation }, null, 2) + '\n')
  process.exit(1)
}
fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n')
process.stdout.write(JSON.stringify({ passed: true, round, incidentId: incident.id, status: state.status, promptPath: '.designops/audit/rodada-' + round + '/incidentes/' + incident.id + '/pedido-codex.md', mensagemHumana: 'Parei esta rodada para preservar o que ja foi comprovado. Encontrei um problema da operacao, nao uma decisao de produto. Preparei o pedido abaixo para o Codex responsavel pela manutencao.' }, null, 2) + '\n')
