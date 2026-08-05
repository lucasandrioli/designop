#!/usr/bin/env node
/* Valida eventos e hashes locais antes de o Registrador publicar um resumo. */
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { validateKoraAuditEventData } = require('./validateKoraAuditEventCore')
function args(argv) { const result = {}; for (let i = 0; i < argv.length; i += 1) { if (argv[i].startsWith('--')) { result[argv[i].slice(2)] = argv[i + 1]; i += 1 } } return result }
function safePart(value) { return String(value ?? '').trim().replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96) }
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
const input = args(process.argv.slice(2))
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const kind = input.round ? 'rodada' : input.session ? 'sessao' : null
const id = safePart(input.round ?? input.session)
const failures = []
if (!kind || !id) failures.push('informe --round <rodada> ou --session <sessao>')
const directory = kind && id ? path.join(root, '.designops', 'audit', kind + '-' + id) : null
const eventFile = directory ? path.join(directory, 'eventos.jsonl') : null
if (!eventFile || !fs.existsSync(eventFile)) failures.push('eventos.jsonl ausente')
let eventCount = 0
if (eventFile && fs.existsSync(eventFile)) {
  const lines = fs.readFileSync(eventFile, 'utf8').split('\n').filter(Boolean)
  eventCount = lines.length
  if (!lines.length) failures.push('eventos.jsonl vazio')
  lines.forEach((line, index) => { try { validateKoraAuditEventData(JSON.parse(line)).forEach((failure) => failures.push('evento ' + (index + 1) + ': ' + failure)) } catch { failures.push('evento ' + (index + 1) + ': JSON invalido') } })
}
const manifestFile = directory ? path.join(directory, 'manifesto-auditoria.json') : null
if (manifestFile && fs.existsSync(manifestFile)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
    if (manifest?.schemaVersion !== 1 || manifest?.escopo?.id !== id || manifest?.escopo?.tipo !== kind?.toUpperCase() || !Array.isArray(manifest?.artefatos)) failures.push('manifesto de auditoria invalido')
    for (const item of manifest?.artefatos ?? []) {
      const filename = path.basename(item.caminho ?? '')
      const inRound = kind === 'rodada' && String(item.caminho ?? '').startsWith('.designops/runs/<rodada>/')
      const incidentArtifact = String(item.caminho ?? '').startsWith('incidentes/')
      const artifact = inRound ? path.join(root, '.designops', 'runs', id, filename) : incidentArtifact ? path.join(directory, item.caminho) : path.join(directory, filename)
      if (!fs.existsSync(artifact)) failures.push('artefato do manifesto ausente: ' + item.caminho)
      else if (sha256(artifact) !== item.sha256) failures.push('hash divergente: ' + item.caminho)
    }
  } catch { failures.push('manifesto de auditoria invalido') }
}
const incidentsDirectory = directory ? path.join(directory, 'incidentes') : null
if (incidentsDirectory && fs.existsSync(incidentsDirectory)) {
  for (const entry of fs.readdirSync(incidentsDirectory, { withFileTypes: true }).filter((item) => item.isDirectory())) {
    const incidentDirectory = path.join(incidentsDirectory, entry.name)
    const incidentFile = path.join(incidentDirectory, 'incidente.json')
    const promptFile = path.join(incidentDirectory, 'pedido-codex.md')
    const incidentManifest = path.join(incidentDirectory, 'manifesto-incidente.json')
    if (![incidentFile, promptFile, incidentManifest].every(fs.existsSync)) { failures.push('pacote de incidente incompleto: ' + entry.name); continue }
    const prompt = fs.readFileSync(promptFile, 'utf8')
    if (/figma\.com|node-id|(?<![T:\d])\b\d{1,8}:\d{1,8}\b(?!:\d)/i.test(prompt)) failures.push('pedido de incidente contem dado Figma restrito: ' + entry.name)
    try {
      const incident = JSON.parse(fs.readFileSync(incidentFile, 'utf8'))
      if (incident?.id !== entry.name || incident?.classificacao !== 'INCIDENTE_DA_OPERACAO' || incident?.status !== 'ABERTO' || /figma\.com|node-id|(?<![T:\d])\b\d{1,8}:\d{1,8}\b(?!:\d)/i.test(JSON.stringify(incident))) failures.push('incidente invalido ou nao sanitizado: ' + entry.name)
      const manifest = JSON.parse(fs.readFileSync(incidentManifest, 'utf8'))
      for (const item of manifest?.artefatos ?? []) {
        const file = path.join(incidentDirectory, path.basename(item.caminho ?? ''))
        if (!fs.existsSync(file) || sha256(file) !== item.sha256) failures.push('hash de incidente divergente: ' + entry.name + '/' + item.caminho)
      }
    } catch { failures.push('manifesto de incidente invalido: ' + entry.name) }
    for (const resolutionName of fs.readdirSync(incidentDirectory).filter((name) => /^retomada-[A-Za-z0-9.-]+\.json$/.test(name))) {
      try {
        const resolution = JSON.parse(fs.readFileSync(path.join(incidentDirectory, resolutionName), 'utf8'))
        if (resolution?.incidente !== entry.name || resolution?.status !== 'RETOMADO' || !/^[a-f0-9]{7,64}$/.test(resolution?.correcaoCommit ?? '') || !['ANALISANDO', 'MONTANDO', 'VALIDANDO'].includes(resolution?.faseRetomada) || /figma\.com|node-id|(?<![T:\d])\b\d{1,8}:\d{1,8}\b(?!:\d)/i.test(JSON.stringify(resolution))) failures.push('retomada de incidente invalida: ' + entry.name + '/' + resolutionName)
      } catch { failures.push('retomada de incidente invalida: ' + entry.name + '/' + resolutionName) }
    }
  }
}
const passed = failures.length === 0
process.stdout.write(JSON.stringify({ passed, escopo: kind && id ? { tipo: kind.toUpperCase(), id } : null, eventos: eventCount, failures }, null, 2) + '\n')
process.exit(passed ? 0 : 1)
