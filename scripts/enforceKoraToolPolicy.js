#!/usr/bin/env node
/* Hook conservador: restringe ferramentas dos dois papeis que coordenam ou registram. */
const fs = require('fs')

function input() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8') || '{}') } catch { return {} }
}
function value(source, keys) {
  for (const key of keys) if (source?.[key]) return String(source[key]).toLowerCase()
  return ''
}
const event = input()
const agent = value(event, ['agent_name', 'agentName', 'subagent_name', 'subagentName', 'agent'])
const tool = value(event, ['tool_name', 'toolName'])
const payload = JSON.stringify(event.tool_input ?? event.toolInput ?? {})
const isKora = /(^|[-_/])kora($|[-_/])/.test(agent)
const isRegistrar = /registrador-auditoria/.test(agent)
const isFigma = /figma/.test(tool)
const isWrite = /edit|write|create|delete|apply/.test(tool)
let deny = null
if ((isKora || isRegistrar) && isFigma) deny = 'Este papel nao pode acessar Figma.'
if (isKora && isWrite && !/\.designops\/(runs\/[^"\\s]+\/kora\.json|audit\/)/.test(payload)) deny = 'Kora so pode escrever no estado da rodada ou na auditoria.'
if (isRegistrar && isWrite && !/\.designops\/audit\//.test(payload)) deny = 'Registrador so pode escrever na trilha de auditoria.'
if (deny) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: deny } }) + '\n')
  process.exit(2)
}
process.stdout.write(JSON.stringify({ continue: true }) + '\n')
