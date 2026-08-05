#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { validateKoraStateData } = require('./validateKoraStateCore')

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
const directory = path.join(repositoryRoot, '.designops', 'runs', round)
const file = path.join(directory, 'kora.json')
const state = {
  schemaVersion: 1,
  rodada: round,
  status: 'PREPARANDO',
  entrada: { figmaUrl: input['figma-url'] ?? '', sections, contextoCurto: input.contexto?.trim() || null },
  checkpoints: {
    analise: { status: 'PENDENTE', gatePreProposta: false, reconciliada: false },
    contrato: { status: 'PENDENTE' },
    montagem: { status: 'PENDENTE' },
    validacao: { status: 'PENDENTE' },
    promocao: { status: 'PENDENTE' },
  },
  aprovacoes: { contrato: null, promocao: null },
  tentativas: [],
  recibos: [],
  artefatos: [],
  pacotes: { analista: null, montagem: null, veredito: null, promocao: null },
  decisoes: [],
  bloqueios: [],
  motivoInterrupcao: null,
  historico: [],
}

const failures = validateKoraStateData(state, { round })
if (failures.length) {
  console.error(JSON.stringify({ passed: false, round, failures }, null, 2))
  process.exit(1)
}
if (fs.existsSync(file)) {
  console.error(JSON.stringify({ passed: false, round, failures: ['ja existe uma rodada Kora com este identificador'] }, null, 2))
  process.exit(1)
}
fs.mkdirSync(directory, { recursive: true })
fs.writeFileSync(file, JSON.stringify(state, null, 2) + '\n')
console.log(JSON.stringify({
  passed: true,
  round,
  status: state.status,
  stateFile: path.relative(repositoryRoot, file),
  nextAction: 'Kora pode iniciar a analise das referencias.',
}, null, 2))
