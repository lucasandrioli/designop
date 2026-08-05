#!/usr/bin/env node
/* Prepara uma rodada somente quando a conversa ativa da Kora receber a entrada humana completa. */
const fs = require('fs')
const path = require('path')
const { createKoraRound } = require('./koraRoundState')

function readInput() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8') || '{}') } catch { return {} }
}
function safe(value) {
  return String(value ?? '').trim().replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96)
}
function field(prompt, label, nextLabels) {
  const start = prompt.search(new RegExp('^\\s*' + label + '\\s*:', 'im'))
  if (start < 0) return ''
  const from = prompt.slice(start).replace(new RegExp('^\\s*' + label + '\\s*:\\s*', 'i'), '')
  const next = nextLabels.map((item) => from.search(new RegExp('^\\s*' + item + '\\s*:', 'im'))).filter((index) => index >= 0)
  return from.slice(0, next.length ? Math.min(...next) : undefined).trim()
}
function parseSurfaces(block) {
  return block.split('\n').map((line) => line.trim()).filter((line) => line.startsWith('-')).map((line) => {
    const match = line.replace(/^-\s*/, '').match(/^(.+?)\s*:\s*(principal|detalhe|auxiliar)(?:\s+abert[oa]\s+pel[oa]\s+(.+))?$/i)
    if (!match) return null
    const id = safe(match[1]).toLowerCase()
    const papel = match[2].toUpperCase()
    const abertaPor = match[3] ? safe(match[3]).toLowerCase() : null
    return id ? { id, nome: match[1].trim(), papel, abertaPor } : null
  }).filter(Boolean)
}
function parseEntry(prompt) {
  const labels = ['Etapa', 'Momento', 'Telas e anexos', 'Modalidades', 'Sections', 'Contexto curto']
  const figmaBlock = field(prompt, 'Figma', labels)
  const figmaUrl = (figmaBlock.match(/https:\/\/www\.figma\.com\/design\/[^\s)]+/i) ?? [])[0] ?? ''
  const sectionBlock = field(prompt, 'Sections', ['Contexto curto'])
  const sections = [...sectionBlock.matchAll(/\bref-[a-z0-9][a-z0-9-]*\b/gi)].map((match) => match[0])
  const contextoCurto = field(prompt, 'Contexto curto', [])
  const modalidades = field(prompt, 'Modalidades', ['Sections', 'Contexto curto']).split(',').map((item) => safe(item).toLowerCase()).filter(Boolean)
  const telas = parseSurfaces(field(prompt, 'Telas e anexos', ['Modalidades', 'Sections', 'Contexto curto']))
  return { figmaUrl, sections: [...new Set(sections)], contextoCurto: contextoCurto || null, etapa: field(prompt, 'Etapa', labels.filter((label) => label !== 'Etapa')), momento: field(prompt, 'Momento', ['Telas e anexos', 'Modalidades', 'Sections', 'Contexto curto']), modalidades: [...new Set(modalidades)], telas }
}
function main() {
  const input = readInput()
  const prompt = String(input.prompt ?? '')
  const session = safe(input.session_id ?? input.sessionId)
  const repositoryRoot = path.resolve(input.cwd ?? path.join(__dirname, '..'))
  if (!session || !prompt) return { continue: true }
  const entry = parseEntry(prompt)
  if (!entry.figmaUrl || !entry.sections.length || !entry.etapa || !entry.momento || !entry.modalidades.length || !entry.telas.length) return { continue: true }
  const bindingFile = path.join(repositoryRoot, '.designops', 'audit', 'sessao-' + session, 'kora.json')
  if (fs.existsSync(bindingFile)) return { continue: true }
  const round = 'kora-' + session
  const created = createKoraRound({ repositoryRoot, round, ...entry })
  if (!created.passed) return { continue: false, stopReason: 'A Kora nao conseguiu preparar esta rodada com seguranca.' }
  fs.mkdirSync(path.dirname(bindingFile), { recursive: true })
  fs.writeFileSync(bindingFile, JSON.stringify({ schemaVersion: 1, sessao: session, rodada: round, criadoEm: new Date().toISOString() }, null, 2) + '\n')
  return { continue: true }
}
process.stdout.write(JSON.stringify(main()) + '\n')
