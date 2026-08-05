#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { validateAnalystStateData } = require('./validateAnalystStateCore')

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
  return 'analise-' + new Date().toISOString().replace(/[:.]/g, '-').replace('T', '-').replace('Z', '')
}
const input = args(process.argv.slice(2))
const round = input.round || automaticRound()
const repositoryRoot = path.resolve(input.root ?? path.join(__dirname, '..'))
const sections = String(input.sections ?? '').split(',').map((item) => item.trim()).filter(Boolean)
const directory = path.join(repositoryRoot, '.designops', 'runs', round)
const file = path.join(directory, 'estado-analista.json')
const state = {
  schemaVersion: 1,
  rodada: round,
  status: 'PREPARANDO',
  entrada: { figmaUrl: input['figma-url'] ?? '', sections, contextoCurto: input.contexto?.trim() || null },
  progresso: { sections: sections.map((nome) => ({ nome, status: 'PENDENTE', estrutura: null, interacoes: null })) },
  achados: [],
  confrontos: [],
  decisoes: [],
  problemas: [],
  proposta: { status: 'NAO_INICIADA', entregaveis: [], resumo: null },
}
const failures = validateAnalystStateData(state)
if (failures.length) {
  console.error('Nao foi possivel iniciar a rodada:')
  failures.forEach((failure) => console.error('- ' + failure))
  process.exit(1)
}
if (fs.existsSync(file)) {
  console.error('Ja existe uma rodada com este identificador: ' + round)
  process.exit(1)
}
fs.mkdirSync(directory, { recursive: true })
fs.writeFileSync(file, JSON.stringify(state, null, 2) + '\n')
console.log(JSON.stringify({ round, stateFile: path.relative(repositoryRoot, file), message: 'Rodada preparada para leitura das referencias.' }, null, 2))
