#!/usr/bin/env node
/* Confere uma composicao de etapa sem permitir que ela se passe por promocao. */
const crypto = require('crypto')
const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

function args(argv) { const input = {}; for (let i = 0; i < argv.length; i += 1) if (argv[i].startsWith('--')) { input[argv[i].slice(2)] = argv[i + 1]; i += 1 } return input }
function hash(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
function sameReferences(actual, expected) { return JSON.stringify(actual ?? []) === JSON.stringify(expected ?? []) }
function validateArtifact(artifact, root, round, label, failures, allowPromotedMoment = false) {
  if (!artifact?.caminho || !/^[a-f0-9]{64}$/.test(artifact?.sha256 ?? '')) { failures.push(label + ' invalido'); return }
  const expected = `.designops/runs/${round}/`
  const promoted = /^\.designops\/runs\/[A-Za-z0-9._-]+\/pacote-promocao\.json$/.test(artifact.caminho)
  if ((!artifact.caminho.startsWith(expected) && !(allowPromotedMoment && promoted)) || path.isAbsolute(artifact.caminho)) { failures.push(label + ' fora da rodada permitida'); return }
  const file = path.resolve(root, artifact.caminho)
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { failures.push(label + ' ausente'); return }
  if (hash(file) !== artifact.sha256) failures.push(label + ' com hash divergente')
}
const input = args(process.argv.slice(2)); const root = path.resolve(input.root ?? path.join(__dirname, '..')); const round = input.round
const failures = []; const file = round ? path.join(root, '.designops', 'runs', round, 'pacote-composicao-etapa.json') : null
let data = null
if (!round) failures.push('round obrigatoria')
else if (!fs.existsSync(file)) failures.push('pacote de composicao ausente')
else try { data = JSON.parse(fs.readFileSync(file, 'utf8')) } catch { failures.push('pacote de composicao invalido') }
if (data) {
  if (data.schemaVersion !== 1 || data.rodada !== round || !data.modalidade || !data.etapa || data.estado !== 'PRONTA_PARA_VERIFICACAO' || data.semPromocao !== true) failures.push('pacote de composicao fora do contrato')
  let scope = null
  try { scope = JSON.parse(fs.readFileSync(path.join(root, '.designops/runs', round, 'escopo-composicao-etapa.json'), 'utf8')) } catch { failures.push('escopo de composicao ausente ou invalido') }
  if (!scope || scope?.tipoRodada !== 'COMPOSICAO_ETAPA' || scope?.rodada !== round || scope?.etapa !== data.etapa || scope?.modalidade !== data.modalidade) failures.push('pacote diverge do escopo imutavel de composicao')
  if (!Array.isArray(data.momentosPromovidos) || !data.momentosPromovidos.length || !sameReferences(data.momentosPromovidos, scope?.momentos)) failures.push('pacote nao usa exatamente os momentos promovidos selecionados')
  for (const [index, artifact] of (scope?.momentos ?? []).entries()) {
    validateArtifact(artifact?.promocao, root, round, `momento promovido[${index}]`, failures, true)
    const sourceRound = artifact?.rodada
    if (sourceRound && sourceRound !== round) {
      const result = childProcess.spawnSync(process.execPath, [path.join(root, 'scripts', 'validatePromotionPackage.js'), '--round', sourceRound, '--root', root], { encoding: 'utf8' })
      if (result.status !== 0) failures.push(`momento promovido[${index}] nao possui promocao comprovada`)
    }
  }
  for (const [label, artifact] of Object.entries({ contratoComposicao: data.contratoComposicao, prototipo: data.prototipo, evidenciaMontagem: data.evidenciaMontagem, veredito: data.veredito })) validateArtifact(artifact, root, round, label, failures)
}
const passed = failures.length === 0
process.stdout.write(JSON.stringify({ round: round ?? null, passed, failures, operator: { mensagemHumana: passed ? 'A etapa foi conectada em uma area de verificacao e esta pronta para revisao.' : 'A composicao da etapa ainda nao esta comprovada.' } }, null, 2) + '\n')
process.exit(passed ? 0 : 1)
