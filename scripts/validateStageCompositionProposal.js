#!/usr/bin/env node
const childProcess = require('child_process')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
function args(argv) { const input = {}; for (let i = 0; i < argv.length; i += 1) if (argv[i].startsWith('--')) { input[argv[i].slice(2)] = argv[i + 1]; i += 1 } return input }
function hash(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
function sameReferences(actual, expected) { return JSON.stringify(actual ?? []) === JSON.stringify(expected ?? []) }
const input = args(process.argv.slice(2)); const root = path.resolve(input.root ?? path.join(__dirname, '..')); const round = input.round; const failures = []
let data = null; const file = round ? path.join(root, '.designops/runs', round, 'proposta-composicao-etapa.json') : null
try { data = JSON.parse(fs.readFileSync(file, 'utf8')) } catch { failures.push('proposta de composicao ausente ou invalida') }
if (data) {
  if (data.schemaVersion !== 1 || data.rodada !== round || !data.etapa || !data.modalidade || data.estado !== 'PRONTO_PARA_REVISAO' || data.semPromocao !== true) failures.push('proposta de composicao fora do contrato')
  let scope = null
  try { scope = JSON.parse(fs.readFileSync(path.join(root, '.designops/runs', round, 'escopo-composicao-etapa.json'), 'utf8')) } catch { failures.push('escopo de composicao ausente ou invalido') }
  if (!scope || scope?.tipoRodada !== 'COMPOSICAO_ETAPA' || scope?.rodada !== round || scope?.etapa !== data.etapa || scope?.modalidade !== data.modalidade) failures.push('proposta diverge do escopo imutavel de composicao')
  if (!Array.isArray(data.momentosPromovidos) || !data.momentosPromovidos.length || !sameReferences(data.momentosPromovidos, scope?.momentos)) failures.push('proposta nao usa exatamente os momentos promovidos selecionados')
  for (const [index, item] of (scope?.momentos ?? []).entries()) {
    const sourceRound = item?.rodada
    const promotion = path.join(root, item?.promocao?.caminho ?? '')
    if (!sourceRound || !fs.existsSync(promotion) || item?.promocao?.sha256 !== hash(promotion)) { failures.push(`momento promovido[${index}] sem recibo local integro`); continue }
    const result = childProcess.spawnSync(process.execPath, [path.join(root, 'scripts', 'validatePromotionPackage.js'), '--round', sourceRound, '--root', root], { encoding: 'utf8' })
    if (result.status !== 0) failures.push(`momento promovido[${index}] nao possui promocao comprovada`)
  }
  const contract = data.contratoComposicao
  if (!contract?.caminho || !/^[a-f0-9]{64}$/.test(contract?.sha256 ?? '') || !contract.caminho.startsWith(`.designops/runs/${round}/`)) failures.push('contrato de composicao invalido')
  else { const target = path.resolve(root, contract.caminho); if (!fs.existsSync(target) || hash(target) !== contract.sha256) failures.push('contrato de composicao ausente ou alterado') }
}
const passed = failures.length === 0; process.stdout.write(JSON.stringify({ passed, round: round ?? null, failures }, null, 2) + '\n'); process.exit(passed ? 0 : 1)
