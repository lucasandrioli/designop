#!/usr/bin/env node
/* Gera um incidente e um pedido sanitizado para manutencao, sem editar a rodada. */
const childProcess = require('child_process')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { sanitiseAuditText } = require('./validateKoraAuditEventCore')
const { classifyFailure } = require('./diagnoseKoraFailure')

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
function gitHead(root) {
  const result = childProcess.spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' })
  return result.status === 0 ? result.stdout.trim() : null
}
function readJson(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null } }
function safeEvidence(root, round) {
  const directory = path.join(root, '.designops', 'runs', round)
  const names = ['kora.json', 'referencias.json', 'analise.json', 'contexto.json', 'componentes-locais.json', 'resolvido.json']
  return names.filter((name) => fs.existsSync(path.join(directory, name))).map((name) => ({ caminho: '.designops/runs/<rodada>/' + name, sha256: sha256(path.join(directory, name)) }))
}
function safeResume(phase) {
  return { ANALISE: 'ANALISANDO', MONTAGEM: 'MONTANDO', VALIDACAO: 'VALIDANDO', PROMOCAO: 'AGUARDANDO_APROVACAO_PROMOCAO', ORQUESTRACAO: 'ANALISANDO' }[phase]
}
function validateIncident(incident) {
  const failures = []
  if (!/^inc-[A-Za-z0-9._-]+$/.test(incident.id)) failures.push('id de incidente invalido')
  if (incident.classificacao !== 'INCIDENTE_DA_OPERACAO' || incident.impacto !== 'BLOQUEIA_RODADA') failures.push('classificacao de incidente invalida')
  if (!['ANALISE', 'MONTAGEM', 'VALIDACAO', 'PROMOCAO', 'ORQUESTRACAO'].includes(incident.fase) || !['ANALISANDO', 'MONTANDO', 'VALIDANDO', 'AGUARDANDO_APROVACAO_PROMOCAO'].includes(incident.pontoRetomada)) failures.push('fase ou ponto de retomada invalido')
  if ([incident.objetivo, incident.esperado, incident.observado].some((value) => !String(value ?? '').trim() || sanitiseAuditText(value) !== value)) failures.push('texto do incidente precisa estar sanitizado')
  if (!Array.isArray(incident.evidencias) || !incident.evidencias.length || incident.evidencias.some((item) => !/^\.designops\/runs\/<rodada>\//.test(item.caminho) || !/^[a-f0-9]{64}$/.test(item.sha256))) failures.push('evidencias do incidente invalidas')
  return failures
}

const input = args(process.argv.slice(2))
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const round = input.round
const role = String(input.role ?? '').trim().toUpperCase()
const phase = String(input.phase ?? '').trim().toUpperCase()
const stateFile = round ? path.join(root, '.designops', 'runs', round, 'kora.json') : null
const state = stateFile && fs.existsSync(stateFile) ? readJson(stateFile) : null
const failures = []
if (!round || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(round)) failures.push('round invalida')
if (!state) failures.push('estado da rodada indisponivel')
if (!['KORA', 'ANALISTA', 'MONTADOR', 'VALIDADOR', 'OPERADOR', 'REGISTRADOR'].includes(role)) failures.push('role invalido')
if (!['ANALISE', 'MONTAGEM', 'VALIDACAO', 'PROMOCAO', 'ORQUESTRACAO'].includes(phase)) failures.push('phase invalida')
if (!String(input.observed ?? '').trim()) failures.push('observed obrigatorio')
const diagnosis = state ? classifyFailure({ observed: input.observed, role, state }) : null
if (diagnosis && diagnosis.classificacao !== 'INCIDENTE_DA_OPERACAO') failures.push('esta falha nao e um incidente da operacao: ' + diagnosis.classificacao)
if (failures.length) {
  process.stdout.write(JSON.stringify({ passed: false, classification: diagnosis?.classificacao ?? null, failures }, null, 2) + '\n')
  process.exit(1)
}
const version = gitHead(root)
const sanitizedObserved = sanitiseAuditText(input.observed)
const incidentId = 'inc-' + crypto.createHash('sha256').update([round, phase, role, sanitizedObserved, version ?? 'sem-versao'].join('|')).digest('hex').slice(0, 16)
const incident = {
  schemaVersion: 1,
  id: incidentId,
  rodada: round,
  classificacao: 'INCIDENTE_DA_OPERACAO',
  status: 'ABERTO',
  fase: phase,
  papel: role,
  impacto: 'BLOQUEIA_RODADA',
  versaoBase: version,
  pontoRetomada: safeResume(phase),
  criadoEm: new Date().toISOString(),
  objetivo: sanitiseAuditText(input.objective ?? 'Restabelecer a operacao governada da Kora sem enfraquecer os controles.'),
  esperado: sanitiseAuditText(input.expected ?? 'A rodada deveria concluir a verificacao interna sem interromper a operacao.'),
  observado: sanitizedObserved,
  tentativas: (state.tentativas ?? []).filter((attempt) => attempt?.resultado === 'FALHOU').length,
  sinais: diagnosis.sinais,
  evidencias: safeEvidence(root, round),
}
const validation = validateIncident(incident)
if (validation.length) {
  process.stdout.write(JSON.stringify({ passed: false, failures: validation }, null, 2) + '\n')
  process.exit(1)
}
const directory = path.join(root, '.designops', 'audit', 'rodada-' + round, 'incidentes', incidentId)
if (fs.existsSync(directory)) {
  process.stdout.write(JSON.stringify({ passed: true, incidentId, reused: true, incidentPath: path.relative(root, path.join(directory, 'incidente.json')), promptPath: path.relative(root, path.join(directory, 'pedido-codex.md')), mensagemHumana: 'O pedido para manutencao ja esta pronto.' }, null, 2) + '\n')
  process.exit(0)
}
fs.mkdirSync(directory, { recursive: true })
const prompt = [
  '# Encaminhar ao Codex',
  '',
  'Investigue e corrija este incidente da operacao Kora. Nao altere Figma, manuais de negocio, contratos aprovados ou a promocao da rodada.',
  '',
  '## Objetivo', incident.objetivo,
  '',
  '## Comportamento esperado', incident.esperado,
  '',
  '## Comportamento observado', incident.observado,
  '',
  '## Contexto de reproducao seguro',
  '- Incidente: ' + incident.id,
  '- Rodada: ' + incident.rodada,
  '- Fase afetada: ' + incident.fase,
  '- Papel afetado: ' + incident.papel,
  '- Versao da operacao: ' + (incident.versaoBase ?? 'nao registrada'),
  '- Tentativas ja registradas: ' + incident.tentativas,
  '- Ponto seguro para retomada: ' + incident.pontoRetomada,
  '',
  '## Evidencias sanitizadas',
  ...incident.evidencias.map((item) => '- ' + item.caminho + ' | sha256 ' + item.sha256),
  '',
  '## Verificacao esperada apos a correcao',
  '- Reproduzir o caminho afetado em uma fixture sem dados reais.',
  '- Rodar os guardrails, a validacao da rodada e a validacao da trilha de auditoria.',
  '- Preservar o bloqueio de proposta, montagem e promocao sem suas aprovacoes humanas.',
  '',
  'Este pedido foi sanitizado: nao contem URL Figma, node ID, conteudo de tela, dado pessoal ou transcricao.',
  '',
].join('\n')
const incidentFile = path.join(directory, 'incidente.json')
const promptFile = path.join(directory, 'pedido-codex.md')
fs.writeFileSync(incidentFile, JSON.stringify(incident, null, 2) + '\n')
fs.writeFileSync(promptFile, prompt)
const manifest = { schemaVersion: 1, incidente: incident.id, geradoEm: new Date().toISOString(), artefatos: [
  { caminho: 'incidente.json', sha256: sha256(incidentFile) },
  { caminho: 'pedido-codex.md', sha256: sha256(promptFile) },
] }
fs.writeFileSync(path.join(directory, 'manifesto-incidente.json'), JSON.stringify(manifest, null, 2) + '\n')
process.stdout.write(JSON.stringify({ passed: true, incidentId, reused: false, incidentPath: path.relative(root, incidentFile), promptPath: path.relative(root, promptFile), mensagemHumana: 'Parei esta rodada para preservar o que ja foi comprovado. Encontrei um problema da operacao, nao uma decisao de produto. O pedido para o Codex responsavel pela manutencao esta pronto.' }, null, 2) + '\n')
