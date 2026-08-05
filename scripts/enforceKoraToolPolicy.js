#!/usr/bin/env node
/*
 * Hook exclusivo da Kora. Nao depende do nome do agente, que o VS Code nao
 * fornece em todos os PreToolUse. A propria ativacao do hook e a fronteira.
 */
const fs = require('fs')
const path = require('path')

function input() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8') || '{}') } catch { return {} }
}
function safe(value) {
  return String(value ?? '').trim().replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96)
}
function toolCalls(event) {
  if (Array.isArray(event.toolCalls)) return event.toolCalls.map((call) => ({ name: String(call.name ?? ''), input: parse(call.args) }))
  return [{ name: String(event.tool_name ?? event.toolName ?? ''), input: event.tool_input ?? event.toolInput ?? {} }]
}
function parse(value) {
  if (value && typeof value === 'object') return value
  try { return JSON.parse(value || '{}') } catch { return {} }
}
function roleFromCall(call) {
  const source = String(call.input?.name ?? call.input?.agent_type ?? '').toUpperCase()
  for (const role of ['ANALISTA', 'MONTADOR', 'VALIDADOR', 'OPERADOR', 'REGISTRADOR']) if (source.includes(role)) return role
  return ''
}
function deny(reason) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: {
    hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason,
  } }) + '\n')
}

const event = input()
const root = path.resolve(event.cwd ?? path.join(__dirname, '..'))
const session = safe(event.session_id ?? event.sessionId)
const binding = session ? path.join(root, '.designops', 'audit', 'sessao-' + session, 'kora.json') : null
let round = null
if (binding && fs.existsSync(binding)) {
  try { round = JSON.parse(fs.readFileSync(binding, 'utf8')).rodada } catch { round = null }
}
const calls = toolCalls(event)
const names = calls.map((call) => call.name.toLowerCase())
const isAgent = names.some((name) => name === 'agent' || name === 'runsubagent')
const isFigma = names.some((name) => name.includes('figma'))
const isDirectWrite = names.some((name) => /^(write|edit|create|delete|apply)/.test(name))
const isTerminal = names.some((name) => /^(bash|terminal|runterminalcommand|execute)$/.test(name))
const commands = calls.filter((call) => /^(bash|terminal|runterminalcommand|execute)$/i.test(call.name)).map((call) => String(call.input?.command ?? ''))
const allowedScripts = new Set([
  'findKoraRound.js', 'startKoraRound.js', 'authorizeKoraAction.js', 'validateKoraRound.js', 'validateAnalysisRound.js',
  'validateAnalystPackage.js', 'validateKoraPackages.js', 'approveKoraCheckpoint.js', 'registerKoraPackage.js',
  'diagnoseKoraFailure.js', 'openKoraOperationIncident.js', 'interruptKoraForIncident.js', 'resumeKoraDecision.js',
  'resumeKoraIncident.js', 'recordKoraAuditEvent.js', 'generateKoraAuditReport.js', 'validateKoraAuditTrail.js', 'auditKoraRounds.js',
])
function terminalIsAllowed(command) {
  const match = command.trim().match(/^node\s+scripts\/([A-Za-z0-9]+\.js)(?:\s+[^;&|`$]*)?$/)
  return Boolean(match && allowedScripts.has(match[1]))
}
if (!round) {
  if (isAgent || isFigma || isDirectWrite || (isTerminal && !commands.every(terminalIsAllowed))) {
    deny('A Kora ainda nao tem uma rodada preparada. Ela nao pode delegar, ler Figma ou escrever antes de registrar a rodada.')
    process.exit(0)
  }
  process.stdout.write(JSON.stringify({ continue: true }) + '\n')
  process.exit(0)
}
const stateFile = path.join(root, '.designops', 'runs', round, 'kora.json')
let state = null
try { state = JSON.parse(fs.readFileSync(stateFile, 'utf8')) } catch {}
if (!state) {
  deny('O estado da rodada da Kora nao esta disponivel. A rodada deve ser interrompida para preservar a operacao.')
  process.exit(0)
}
if (isFigma) {
  deny('Kora coordena a rodada e nao le Figma diretamente. A leitura deve ser delegada ao papel autorizado.')
  process.exit(0)
}
if (isDirectWrite) {
  deny('Kora nao escreve arquivos diretamente. O estado e os recibos devem ser registrados pelos comandos controlados da operacao.')
  process.exit(0)
}
if (isTerminal && !commands.every(terminalIsAllowed)) {
  deny('Kora executa somente os comandos controlados da operacao.')
  process.exit(0)
}
if (isAgent) {
  const role = roleFromCall(calls.find((call) => call.name.toLowerCase() === 'agent' || call.name.toLowerCase() === 'runsubagent') ?? {})
  const pending = state.autorizacaoPendente
  if (!role || !pending || pending.papel !== role) {
    deny('A delegacao nao foi autorizada pela rodada atual. Kora deve autorizar o papel antes de aciona-lo.')
    process.exit(0)
  }
  state.autorizacaoPendente = null
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n')
}
process.stdout.write(JSON.stringify({ continue: true }) + '\n')
