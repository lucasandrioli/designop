#!/usr/bin/env node
const path = require('path')
const { createKoraRound, createStageCompositionRound } = require('./koraRoundState')

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
const modalidades = String(input.modalidades ?? '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)
let telas = []
try { telas = JSON.parse(input.telas ?? '[]') } catch { telas = [] }
const result = String(input.tipo ?? '').toUpperCase() === 'COMPOSICAO_ETAPA'
  ? createStageCompositionRound({ repositoryRoot, round, figmaUrl: input['figma-url'] ?? '', etapa: input.etapa, modalidade: input.modalidade, momentos: String(input.momentos ?? '').split(',').map((item) => item.trim()).filter(Boolean) })
  : createKoraRound({
  repositoryRoot,
  round,
  figmaUrl: input['figma-url'] ?? '',
  sections,
  contextoCurto: input.contexto?.trim() || null,
  etapa: input.etapa,
  momento: input.momento,
  modalidades,
  telas,
  })
process.stdout.write(JSON.stringify(result, null, 2) + '\n')
process.exit(result.passed ? 0 : 1)
