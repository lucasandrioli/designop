#!/usr/bin/env node
/* Registra fatos de rodada que os hooks de sessao nao conseguem correlacionar. */
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { EVENT_TYPES, sanitiseAuditText, validateKoraAuditEventData } = require('./validateKoraAuditEventCore')

function args(argv) {
  const input = {}
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) continue
    input[argv[index].slice(2)] = argv[index + 1]
    index += 1
  }
  return input
}
function safePart(value) {
  return String(value ?? '').trim().replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96)
}

const input = args(process.argv.slice(2))
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const round = safePart(input.round)
const type = String(input.type ?? '').trim().toUpperCase()
const failures = []
if (!round) failures.push('informe --round <rodada>')
if (!EVENT_TYPES.has(type) || type.startsWith('SESSAO_') || type.startsWith('FERRAMENTA_') || type.startsWith('SUBAGENTE_') || type === 'OUTRO') failures.push('type precisa ser um fato de rodada da Kora')
if (!String(input.result ?? '').trim()) failures.push('informe --result <resultado>')
if (failures.length) {
  process.stderr.write(JSON.stringify({ passed: false, failures }) + '\n')
  process.exit(1)
}
const event = {
  schemaVersion: 1,
  eventoId: crypto.randomUUID(),
  ocorridoEm: new Date().toISOString(),
  tipo: type,
  origem: { eventoHook: 'kora-interno', escopo: { tipo: 'RODADA', id: round }, rodada: round },
  detalhes: {
    resultado: sanitiseAuditText(input.result),
    ...(input.role ? { agente: sanitiseAuditText(input.role) } : {}),
    ...(input.message ? { mensagem: sanitiseAuditText(input.message) } : {}),
  },
}
const validation = validateKoraAuditEventData(event)
if (validation.length) {
  process.stderr.write(JSON.stringify({ passed: false, failures: validation }) + '\n')
  process.exit(1)
}
const folder = path.join(root, '.designops', 'audit', 'rodada-' + round)
fs.mkdirSync(folder, { recursive: true })
fs.appendFileSync(path.join(folder, 'eventos.jsonl'), JSON.stringify(event) + '\n')
process.stdout.write(JSON.stringify({ passed: true, round, type }) + '\n')
