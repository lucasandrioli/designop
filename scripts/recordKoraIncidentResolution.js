#!/usr/bin/env node
/* Registra de forma append-only que uma correcao integrada liberou a retomada. */
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { sanitiseAuditText } = require('./validateKoraAuditEventCore')

function args(argv) {
  const input = {}
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) continue
    input[argv[index].slice(2)] = argv[index + 1]
    index += 1
  }
  return input
}
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
function validCommit(value) { return /^[a-f0-9]{7,64}$/.test(String(value ?? '')) }

const input = args(process.argv.slice(2))
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const round = input.round
const stateFile = round ? path.join(root, '.designops', 'runs', round, 'kora.json') : null
const state = stateFile && fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : null
const incident = state?.incidenteOperacao
const directory = round && input.incident ? path.join(root, '.designops', 'audit', 'rodada-' + round, 'incidentes', input.incident) : null
const incidentFile = directory ? path.join(directory, 'incidente.json') : null
const failures = []
if (!state || !incident || incident.id !== input.incident || incident.status !== 'RETOMADO') failures.push('a rodada nao registra este incidente como retomado')
if (!validCommit(input['correction-commit']) || incident?.correcaoCommit !== input['correction-commit']) failures.push('correction-commit nao corresponde a retomada registrada')
if (!incidentFile || !fs.existsSync(incidentFile)) failures.push('pacote original do incidente ausente')
if (failures.length) {
  process.stdout.write(JSON.stringify({ passed: false, failures }, null, 2) + '\n')
  process.exit(1)
}
const occurredAt = new Date().toISOString()
const file = path.join(directory, 'retomada-' + occurredAt.replace(/[:.]/g, '-') + '.json')
const resolution = {
  schemaVersion: 1,
  incidente: input.incident,
  status: 'RETOMADO',
  correcaoCommit: input['correction-commit'],
  faseRetomada: state.status,
  ocorridoEm: occurredAt,
  evidencia: {
    incidenteSha256: sha256(incidentFile),
    estadoRodadaSha256: sha256(stateFile),
  },
  nota: sanitiseAuditText('A correcao foi integrada e a rodada retornou apenas ao ponto seguro de verificacao.'),
}
fs.writeFileSync(file, JSON.stringify(resolution, null, 2) + '\n')
process.stdout.write(JSON.stringify({ passed: true, incidentId: input.incident, resolutionPath: path.relative(root, file) }, null, 2) + '\n')
