#!/usr/bin/env node
/*
 * Adaptador dos hooks do VS Code para a trilha local da Kora.
 * Recebe um objeto JSON no stdin e sempre devolve JSON valido no stdout.
 */
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { sanitiseAuditText, validateKoraAuditEventData } = require('./validateKoraAuditEventCore')

function readStdin() {
  try {
    const value = fs.readFileSync(0, 'utf8').trim()
    return value ? JSON.parse(value) : {}
  } catch (error) {
    return { hook_event_name: 'Unknown', hook_parse_error: error.message }
  }
}

function safePart(value, fallback) {
  const cleaned = String(value ?? '').trim().replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
  return cleaned.slice(0, 96) || fallback
}

function normaliseEvent(value) {
  const raw = String(value ?? 'Unknown').trim()
  const compact = raw.toLowerCase().replace(/[^a-z]/g, '')
  if (compact === 'sessionstart' || compact === 'session') return 'SESSAO_INICIADA'
  if (compact === 'pretooluse' || compact === 'pretool') return 'FERRAMENTA_INICIADA'
  if (compact === 'posttooluse' || compact === 'posttool') return 'FERRAMENTA_CONCLUIDA'
  if (compact === 'subagentstart' || compact === 'subagent') return 'SUBAGENTE_INICIADO'
  if (compact === 'subagentstop') return 'SUBAGENTE_CONCLUIDO'
  if (compact === 'stop' || compact === 'sessionstop') return 'SESSAO_ENCERRADA'
  return 'OUTRO'
}

function eventResult(type) {
  if (type === 'FERRAMENTA_INICIADA' || type === 'SUBAGENTE_INICIADO' || type === 'SESSAO_INICIADA') return 'INICIADO'
  if (type === 'SESSAO_ENCERRADA') return 'ENCERRADO'
  if (type === 'OUTRO') return 'NAO_INFORMADO'
  return 'CONCLUIDO'
}

function activeRound(root) {
  const runs = path.join(root, '.designops', 'runs')
  if (!fs.existsSync(runs)) return null
  const found = fs.readdirSync(runs, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(runs, entry.name, 'kora.json'))
    .filter((file) => fs.existsSync(file))
    .map((file) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null } })
    .filter((state) => state?.rodada && state.status !== 'CONCLUIDA')
  return found.length === 1 ? found[0].rodada : null
}

function maybeRound(input, root) {
  const metadata = input.metadata && typeof input.metadata === 'object' ? input.metadata : {}
  return input.kora_round ?? input.koraRound ?? input.round ?? input.rodada ?? metadata.kora_round ?? metadata.koraRound ?? metadata.round ?? metadata.rodada ?? process.env.KORA_ROUND ?? activeRound(root)
}

function keyList(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? Object.keys(value).slice(0, 30).map((key) => sanitiseAuditText(key))
    : []
}

function eventFromHook(input, root) {
  const eventName = input.hook_event_name ?? input.hookEventName ?? input.event ?? 'Unknown'
  const type = normaliseEvent(eventName)
  const round = maybeRound(input, root)
  const session = input.session_id ?? input.sessionId ?? input.session ?? process.env.KORA_SESSION
  const scope = round
    ? { tipo: 'RODADA', id: safePart(round, 'rodada-desconhecida') }
    : { tipo: 'SESSAO', id: safePart(session, 'sessao-desconhecida') }
  const toolInput = input.tool_input ?? input.toolInput
  const toolResult = input.tool_response ?? input.toolResponse ?? input.tool_output ?? input.toolOutput
  const agent = input.agent_name ?? input.agentName ?? input.subagent_name ?? input.subagentName ?? input.subagent_type ?? input.subagentType
  const details = { resultado: eventResult(type) }
  if (input.tool_name ?? input.toolName) details.ferramenta = sanitiseAuditText(input.tool_name ?? input.toolName)
  if (toolInput !== undefined) details.chavesEntrada = keyList(toolInput)
  if (toolResult !== undefined) details.chavesSaida = keyList(toolResult)
  if (agent) details.agente = sanitiseAuditText(agent)
  if (input.hook_parse_error) details.mensagem = 'A entrada do hook nao estava em JSON valido.'
  const origin = { eventoHook: sanitiseAuditText(eventName), escopo: scope }
  if (session) origin.sessao = safePart(session, 'sessao-desconhecida')
  if (round) origin.rodada = safePart(round, 'rodada-desconhecida')
  const requestedTime = new Date(input.timestamp ?? Date.now())
  const occurredAt = Number.isNaN(requestedTime.getTime()) ? new Date().toISOString() : requestedTime.toISOString()
  return {
    schemaVersion: 1,
    eventoId: crypto.randomUUID(),
    ocorridoEm: occurredAt,
    tipo: type,
    origem: origin,
    detalhes: details,
  }
}

function main() {
  const input = readStdin()
  const root = path.resolve(process.env.KORA_AUDIT_ROOT ?? path.join(__dirname, '..'))
  const event = eventFromHook(input, root)
  const folder = path.join(root, '.designops', 'audit', (event.origem.escopo.tipo === 'RODADA' ? 'rodada-' : 'sessao-') + event.origem.escopo.id)
  const failures = validateKoraAuditEventData(event)
  if (failures.length) throw new Error('evento de auditoria invalido: ' + failures.join('; '))
  fs.mkdirSync(folder, { recursive: true })
  fs.appendFileSync(path.join(folder, 'eventos.jsonl'), JSON.stringify(event) + '\n')
  process.stdout.write(JSON.stringify({ continue: true }))
}

try {
  main()
} catch (error) {
  process.stderr.write('Kora audit hook: ' + error.message + '\n')
  process.stdout.write(JSON.stringify({ continue: true, systemMessage: 'A trilha local da Kora ficou limitada nesta execucao.' }))
}
