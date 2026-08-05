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
function parseEntry(prompt) {
  const figmaBlock = field(prompt, 'Figma', ['Sections', 'Contexto curto'])
  const figmaUrl = (figmaBlock.match(/https:\/\/www\.figma\.com\/design\/[^\s)]+/i) ?? [])[0] ?? ''
  const sectionBlock = field(prompt, 'Sections', ['Contexto curto'])
  const sections = [...sectionBlock.matchAll(/\bref-[a-z0-9][a-z0-9-]*\b/gi)].map((match) => match[0])
  const contextoCurto = field(prompt, 'Contexto curto', [])
  return { figmaUrl, sections: [...new Set(sections)], contextoCurto: contextoCurto || null }
}
function main() {
  const input = readInput()
  const prompt = String(input.prompt ?? '')
  const session = safe(input.session_id ?? input.sessionId)
  const repositoryRoot = path.resolve(input.cwd ?? path.join(__dirname, '..'))
  if (!session || !prompt) return { continue: true }
  const entry = parseEntry(prompt)
  if (!entry.figmaUrl || !entry.sections.length) return { continue: true }
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
