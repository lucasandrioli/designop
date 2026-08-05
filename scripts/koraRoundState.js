const fs = require('fs')
const path = require('path')
const { validateKoraStateData } = require('./validateKoraStateCore')

function createInitialState(round, figmaUrl, sections, contextoCurto) {
  return {
    schemaVersion: 1,
    rodada: round,
    status: 'PREPARANDO',
    entrada: { figmaUrl, sections, contextoCurto: contextoCurto || null },
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
    autorizacaoPendente: null,
    decisoes: [],
    bloqueios: [],
    motivoInterrupcao: null,
    historico: [],
  }
}

function createKoraRound({ repositoryRoot, round, figmaUrl, sections, contextoCurto }) {
  const directory = path.join(repositoryRoot, '.designops', 'runs', round)
  const file = path.join(directory, 'kora.json')
  const state = createInitialState(round, figmaUrl, sections, contextoCurto)
  const failures = validateKoraStateData(state, { round })
  if (failures.length) return { passed: false, round, failures }
  if (fs.existsSync(file)) return { passed: false, round, failures: ['ja existe uma rodada Kora com este identificador'] }
  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(file, JSON.stringify(state, null, 2) + '\n')
  return {
    passed: true,
    round,
    status: state.status,
    stateFile: path.relative(repositoryRoot, file),
    nextAction: 'Kora pode iniciar a analise das referencias.',
  }
}

module.exports = { createInitialState, createKoraRound }
