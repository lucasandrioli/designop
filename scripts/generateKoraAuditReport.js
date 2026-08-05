#!/usr/bin/env node
/* Gera o Relato da Kora e o manifesto sanitizado para publicacao futura. */
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const { sanitiseAuditText, validateKoraAuditEventData } = require('./validateKoraAuditEventCore')

function args(argv) {
  const result = {}
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) continue
    result[argv[index].slice(2)] = argv[index + 1]
    index += 1
  }
  return result
}
function safePart(value) {
  const cleaned = String(value ?? '').trim().replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
  return cleaned.slice(0, 96)
}
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
function readEvents(file) {
  const failures = []
  const events = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((line, index) => {
    try {
      const event = JSON.parse(line)
      for (const failure of validateKoraAuditEventData(event)) failures.push('evento ' + (index + 1) + ': ' + failure)
      return event
    } catch (error) {
      failures.push('evento ' + (index + 1) + ': JSON invalido')
      return null
    }
  }).filter(Boolean)
  return { events, failures }
}
function gitHead(root) {
  const result = childProcess.spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' })
  return result.status === 0 ? result.stdout.trim() : null
}
function displayEvent(event) {
  const labels = {
    SESSAO_INICIADA: 'Sessao iniciada',
    FERRAMENTA_INICIADA: 'Ferramenta iniciada',
    FERRAMENTA_CONCLUIDA: 'Ferramenta concluida',
    SUBAGENTE_INICIADO: 'Subagente iniciado',
    SUBAGENTE_CONCLUIDO: 'Subagente concluido',
    SESSAO_ENCERRADA: 'Sessao encerrada',
    RODADA_INICIADA: 'Rodada iniciada',
    PAPEL_ACIONADO: 'Papel acionado',
    PAPEL_CONCLUIDO: 'Papel concluiu',
    ESTADO_ALTERADO: 'Estado da rodada alterado',
    RECUPERACAO_REGISTRADA: 'Tentativa de recuperacao registrada',
    APROVACAO_REGISTRADA: 'Aprovacao registrada',
    BLOQUEIO_REGISTRADO: 'Impedimento registrado',
    RODADA_INTERROMPIDA: 'Rodada interrompida',
    INCIDENTE_OPERACAO_ABERTO: 'Incidente da operacao aberto',
    INCIDENTE_OPERACAO_RETOMADO: 'Incidente da operacao retomado',
    RODADA_ENCERRADA: 'Rodada encerrada',
    OUTRO: 'Evento operacional registrado',
  }
  const complement = event.detalhes.ferramenta ? ': ' + sanitiseAuditText(event.detalhes.ferramenta) : event.detalhes.agente ? ': ' + sanitiseAuditText(event.detalhes.agente) : ''
  return '- ' + event.ocorridoEm + ' | ' + labels[event.tipo] + complement
}
function runArtifacts(root, round) {
  if (!round) return []
  const directory = path.join(root, '.designops', 'runs', round)
  if (!fs.existsSync(directory)) return []
  const allowed = ['kora.json', 'referencias.json', 'analise.json', 'contexto.json', 'componentes-locais.json', 'resolvido.json']
  return allowed.filter((name) => fs.existsSync(path.join(directory, name))).map((name) => ({ caminho: '.designops/runs/<rodada>/' + name, arquivo: path.join(directory, name) }))
}
const input = args(process.argv.slice(2))
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const kind = input.round ? 'rodada' : input.session ? 'sessao' : null
const id = safePart(input.round ?? input.session)
if (!kind || !id) {
  console.error('Informe --round <rodada> ou --session <sessao>.')
  process.exit(1)
}
const directory = path.join(root, '.designops', 'audit', kind + '-' + id)
const eventsFile = path.join(directory, 'eventos.jsonl')
if (!fs.existsSync(eventsFile)) {
  console.error('Trilha local ausente: ' + path.relative(root, eventsFile))
  process.exit(1)
}
const { events, failures } = readEvents(eventsFile)
if (failures.length || !events.length) {
  console.error('Nao foi possivel gerar o Relato da Kora: ' + (failures.length ? failures.join('; ') : 'nenhum evento registrado'))
  process.exit(1)
}
const last = events[events.length - 1]
const currentState = input.round && fs.existsSync(path.join(root, '.designops', 'runs', id, 'kora.json'))
  ? (() => { try { return JSON.parse(fs.readFileSync(path.join(root, '.designops', 'runs', id, 'kora.json'), 'utf8')).status ?? null } catch { return null } })()
  : null
const lines = ['# Relato da Kora', '', '## Resultado', '- Escopo: ' + (kind === 'rodada' ? 'rodada ' : 'sessao ') + id, '- Eventos registrados: ' + events.length, '- Ultimo fato: ' + last.tipo]
if (currentState) lines.push('- Estado atual da rodada: ' + sanitiseAuditText(currentState))
const incidentsDirectory = input.round ? path.join(directory, 'incidentes') : null
const incidents = incidentsDirectory && fs.existsSync(incidentsDirectory) ? fs.readdirSync(incidentsDirectory, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name) : []
if (incidents.length) lines.push('- Incidentes da operacao: ' + incidents.join(', '))
lines.push('', '## Linha do tempo', ...events.map(displayEvent), '', '## Integridade', '- Este relato foi gerado a partir de eventos locais sanitizados.', '- URLs Figma, node IDs e conteudo bruto de ferramentas nao sao incluidos.', '')
fs.mkdirSync(directory, { recursive: true })
const reportFile = path.join(directory, 'relato-kora.md')
fs.writeFileSync(reportFile, lines.join('\n'))
const incidentArtifacts = incidents.flatMap((incidentId) => fs.readdirSync(path.join(incidentsDirectory, incidentId))
  .filter((name) => name === 'incidente.json' || name === 'pedido-codex.md' || name === 'manifesto-incidente.json' || /^retomada-[A-Za-z0-9.-]+\.json$/.test(name))
  .map((name) => ({ caminho: 'incidentes/' + incidentId + '/' + name, arquivo: path.join(incidentsDirectory, incidentId, name) }))
  .filter((item) => fs.existsSync(item.arquivo)))
const artifacts = [{ caminho: 'eventos.jsonl', arquivo: eventsFile }, { caminho: 'relato-kora.md', arquivo: reportFile }, ...incidentArtifacts, ...runArtifacts(root, input.round ? id : null)]
const manifest = {
  schemaVersion: 1,
  geradoEm: new Date().toISOString(),
  escopo: { tipo: kind === 'rodada' ? 'RODADA' : 'SESSAO', id },
  versaoBase: gitHead(root),
  eventos: { quantidade: events.length, sha256: sha256(eventsFile) },
  artefatos: artifacts.map((item) => ({ caminho: item.caminho, sha256: sha256(item.arquivo), bytes: fs.statSync(item.arquivo).size })),
  publicacao: { permitida: false, destino: 'audit/kora', motivo: 'O Registrador de Auditoria deve revisar e publicar este resumo sanitizado posteriormente.' },
}
fs.writeFileSync(path.join(directory, 'manifesto-auditoria.json'), JSON.stringify(manifest, null, 2) + '\n')
process.stdout.write(JSON.stringify({ passed: true, directory: path.relative(root, directory), events: events.length, report: path.relative(root, reportFile) }, null, 2) + '\n')
