#!/usr/bin/env node
/*
 * Confere o pacote final temporario do Analista.
 * Uso: node scripts/validateAnalystPackage.js --round <rodada> [--root <repositorio>]
 */
const childProcess = require('child_process')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { validateAnalystPackageData } = require('./validateAnalystPackageCore')
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
function readJson(file, failures, label) {
  if (!fs.existsSync(file)) { failures.push(label + ' ausente'); return null }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) }
  catch (error) { failures.push(label + ' invalido: ' + error.message); return null }
}
function hash(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
function isInside(directory, file) {
  const relative = path.relative(directory, file)
  return relative && !relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative)
}
function operatorResult(passed) {
  return {
    mensagemHumana: passed
      ? 'A proposta foi conferida e está pronta para sua revisão.'
      : 'A proposta ainda não está pronta para revisão. A Kora vai devolver somente a pendência ao Analista.',
  }
}

const input = args(process.argv.slice(2))
const failures = []
const round = input.round
const repositoryRoot = path.resolve(input.root ?? path.join(__dirname, '..'))
const scriptRoot = path.resolve(__dirname, '..')
if (!round || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(round)) failures.push('round invalida')
const directory = round ? path.join(repositoryRoot, '.designops', 'runs', round) : null
const packageFile = directory ? path.join(directory, 'pacote-analista.json') : null
const analystPackage = packageFile ? readJson(packageFile, failures, 'pacote do Analista') : null
const manifestFile = directory ? path.join(directory, 'analise.json') : null
const manifest = manifestFile ? readJson(manifestFile, failures, 'manifesto de analise') : null
if (analystPackage) failures.push(...validateAnalystPackageData(analystPackage, { round, requiresResolution: manifest?.requerResolucaoIds === true }))

for (const artifact of analystPackage?.artefatos ?? []) {
  const file = path.resolve(directory, artifact.caminho)
  if (!isInside(directory, file)) { failures.push('artefato fora da pasta da rodada: ' + artifact.tipo); continue }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { failures.push('artefato ausente: ' + artifact.tipo); continue }
  if (hash(file) !== artifact.sha256) failures.push('hash divergente: ' + artifact.tipo)
  if (['REFERENCIAS', 'MANIFESTO_ANALISE', 'CONTEXTO', 'ESTADO_ANALISTA', 'PLANO_VARIAVEIS', 'PLANO_COMPONENTES_LOCAIS', 'RESOLUCAO_IDS'].includes(artifact.tipo)) {
    const data = readJson(file, failures, 'artefato ' + artifact.tipo)
    if (data && data.rodada !== round) failures.push('artefato pertence a outra rodada: ' + artifact.tipo)
  }
  if (artifact.tipo === 'MAPA_JORNADA') {
    const content = fs.readFileSync(file, 'utf8')
    if (!content.includes('rodada: ' + round)) failures.push('mapa de jornada pertence a outra rodada')
  }
}

const analystStateArtifact = (analystPackage?.artefatos ?? []).find((artifact) => artifact.tipo === 'ESTADO_ANALISTA')
const state = analystStateArtifact ? readJson(path.resolve(directory, analystStateArtifact.caminho), failures, 'estado do Analista') : null
if (state) {
  failures.push(...validateAnalystStateData(state))
  if (state.rodada !== round || state.status !== 'PRONTO_PARA_REVISAO' || state?.proposta?.status !== 'PRONTA') failures.push('estado do Analista nao confirma proposta pronta')
  const humanProposal = analystPackage?.resumoHumano?.proposta
  if (humanProposal && (humanProposal.resumo !== state?.proposta?.resumo || JSON.stringify(humanProposal.entregaveis) !== JSON.stringify(state?.proposta?.entregaveis))) {
    failures.push('resumo humano nao corresponde a proposta do Analista')
  }
}
const variablePlanArtifact = (analystPackage?.artefatos ?? []).find((artifact) => artifact.tipo === 'PLANO_VARIAVEIS')
const variablePlan = variablePlanArtifact ? readJson(path.resolve(directory, variablePlanArtifact.caminho), failures, 'plano de variaveis') : null
if (variablePlan && (variablePlan.schemaVersion !== 1 || variablePlan.rodada !== round || variablePlan.status !== 'PROPOSTO' || !variablePlan.id || !variablePlan.modalidade || !variablePlan.etapa || !Array.isArray(variablePlan.collections) || !Array.isArray(variablePlan.variaveis))) {
  failures.push('plano de variaveis invalido para esta rodada')
}

if (directory && analystPackage) {
  const gate = childProcess.spawnSync(process.execPath, [path.join(scriptRoot, 'scripts', 'validateAnalysisRound.js'), '--round', round, '--stage', 'pre-proposta', '--root', repositoryRoot], { cwd: repositoryRoot, encoding: 'utf8' })
  let result = null
  try { result = JSON.parse(gate.stdout) } catch { failures.push('gate de analise nao retornou resultado valido') }
  if (gate.status !== 0 || result?.passed !== true) failures.push('gate pre-proposta reprovado para o pacote')
}

const passed = failures.length === 0
console.log(JSON.stringify({ round: round ?? null, passed, failures, operator: operatorResult(passed) }, null, 2))
process.exit(passed ? 0 : 1)
