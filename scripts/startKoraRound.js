#!/usr/bin/env node
const path = require('path')
const { createKoraRound } = require('./koraRoundState')

function args(argv) {
  const input = {}
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) continue
    input[argv[index].slice(2)] = argv[index + 1]
    index += 1
  }
  return input
}

function automaticRound() {
  return 'kora-' + new Date().toISOString().replace(/[:.]/g, '-').replace('T', '-').replace('Z', '')
}

const input = args(process.argv.slice(2))
const round = input.round || automaticRound()
const repositoryRoot = path.resolve(input.root ?? path.join(__dirname, '..'))
const sections = String(input.sections ?? '').split(',').map((item) => item.trim()).filter(Boolean)
const result = createKoraRound({
  repositoryRoot,
  round,
  figmaUrl: input['figma-url'] ?? '',
  sections,
  contextoCurto: input.contexto?.trim() || null,
})
process.stdout.write(JSON.stringify(result, null, 2) + '\n')
process.exit(result.passed ? 0 : 1)
