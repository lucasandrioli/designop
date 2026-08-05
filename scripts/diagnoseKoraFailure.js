#!/usr/bin/env node
/* Classifica uma falha sem transformar diagnostico interno em decisao humana. */
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
function readState(root, round) {
  try { return JSON.parse(fs.readFileSync(path.join(root, '.designops', 'runs', round, 'kora.json'), 'utf8')) } catch { return null }
}
function classifyFailure({ observed, role, state }) {
  const text = String(observed ?? '').toLowerCase()
  const signals = []
  const operation = /cannot find module|syntaxerror|typeerror|referenceerror|unexpected token|hook|permissiondecision|enforcekoratoolpolicy|estado kora|transicao nao permitida|schema.*invalido|inconsisten|guardrail|validat.*conflit|eacces/.test(text)
  const business = /\[confirmar\]|regra.*(ausente|divergente|nao.*document)|decisao.*(negocio|produto)|escolha.*(jornada|estrutura)|contexto.*nao.*document/.test(text)
  const temporary = /timeout|temporar|rate limit|tente novamente|indisponivel/.test(text)
  const evidence = /figma|section|referenc|mcp|cobertura|reconciliacao|node/.test(text)
  const internalRetries = (state?.tentativas ?? []).filter((attempt) => attempt?.resultado === 'FALHOU' && /script|hook|validad|kora/i.test(String(attempt?.causa ?? '')) && String(attempt?.agente ?? '').toUpperCase() === String(role ?? '').toUpperCase()).length
  if (operation || internalRetries >= 2) {
    signals.push(operation ? 'falha deterministica da operacao' : 'repeticao de falha interna')
    return { classificacao: 'INCIDENTE_DA_OPERACAO', rota: 'INTERROMPER_E_ENCAMINHAR', sinais: signals }
  }
  if (business) return { classificacao: 'DECISAO_DE_NEGOCIO', rota: 'PERGUNTAR_AO_DESIGNER', sinais: ['decisao altera regra ou jornada'] }
  if (temporary) return { classificacao: 'RECUPERAVEL', rota: 'DEVOLVER_AO_MESMO_PAPEL', sinais: ['falha tecnica transitória'] }
  if (evidence) return { classificacao: 'EVIDENCIA_INSUFICIENTE', rota: 'DEVOLVER_AO_PAPEL_RESPONSAVEL', sinais: ['prova da referencia ainda insuficiente'] }
  return { classificacao: 'EVIDENCIA_INSUFICIENTE', rota: 'PAUSAR_SEM_SUPOR', sinais: ['causa ainda nao comprovada'] }
}
function humanMessage(diagnosis) {
  if (diagnosis.classificacao === 'INCIDENTE_DA_OPERACAO') return 'Parei esta rodada para preservar o que ja foi comprovado. Encontrei um problema da operacao, nao uma decisao de produto.'
  if (diagnosis.classificacao === 'DECISAO_DE_NEGOCIO') return 'Esta situacao muda a proposta e precisa de uma decisao de negocio.'
  if (diagnosis.classificacao === 'RECUPERAVEL') return 'A Kora pode tentar uma recuperacao tecnica segura antes de interromper a rodada.'
  return 'A referencia ainda nao esta comprovada o bastante para seguir como proposta.'
}

function main() {
  const input = args(process.argv.slice(2))
  const root = path.resolve(input.root ?? path.join(__dirname, '..'))
  const round = input.round
  const role = String(input.role ?? '').trim().toUpperCase()
  const phase = String(input.phase ?? '').trim().toUpperCase()
  const failures = []
  if (!round || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(round)) failures.push('round invalida')
  if (!['KORA', 'ANALISTA', 'MONTADOR', 'VALIDADOR', 'OPERADOR', 'REGISTRADOR'].includes(role)) failures.push('role invalido')
  if (!['ANALISE', 'MONTAGEM', 'VALIDACAO', 'ORQUESTRACAO'].includes(phase)) failures.push('phase invalida')
  if (!String(input.observed ?? '').trim()) failures.push('observed obrigatorio')
  const state = round ? readState(root, round) : null
  if (!state) failures.push('estado da rodada indisponivel para diagnostico')
  if (failures.length) {
    process.stdout.write(JSON.stringify({ passed: false, failures }, null, 2) + '\n')
    process.exit(1)
  }
  const diagnosis = classifyFailure({ observed: input.observed, role, state })
  process.stdout.write(JSON.stringify({
    passed: true,
    round,
    role,
    phase,
    expected: sanitiseAuditText(input.expected ?? 'A etapa deveria concluir com evidencia verificavel.'),
    observed: sanitiseAuditText(input.observed),
    ...diagnosis,
    mensagemHumana: humanMessage(diagnosis),
  }, null, 2) + '\n')
}

if (require.main === module) main()
module.exports = { classifyFailure, humanMessage }
