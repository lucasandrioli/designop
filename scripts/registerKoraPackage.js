#!/usr/bin/env node
/* Aceita um recibo já validado e move a rodada somente para a próxima fase. */
const childProcess = require('child_process')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { TRANSITIONS, validateKoraStateData } = require('./validateKoraStateCore')

function args(argv) {
  const input = {}
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) continue
    input[argv[index].slice(2)] = argv[index + 1]
    index += 1
  }
  return input
}
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
function validate(root, script, round) {
  const result = childProcess.spawnSync(process.execPath, [path.join(root, 'scripts', script), '--round', round, '--root', root], { cwd: root, encoding: 'utf8' })
  let output = null
  try { output = JSON.parse(result.stdout) } catch {}
  return { passed: result.status === 0 && output?.passed === true, failures: output?.failures ?? ['validador nao retornou JSON favoravel'] }
}

const input = args(process.argv.slice(2))
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const round = input.round
const name = String(input.package ?? '').toLowerCase()
const file = round ? path.join(root, '.designops', 'runs', round, 'kora.json') : null
const state = file && fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null
const definitions = {
  analista: { state: 'ANALISANDO', next: 'AGUARDANDO_APROVACAO_CONTRATO', packageFile: 'pacote-analista.json', script: 'validateAnalystPackage.js', receipt: ['ANALISTA', 'ANALISE'], packageState: 'PRONTO_PARA_REVISAO' },
  montagem: { state: 'MONTANDO', next: 'VALIDANDO', packageFile: 'pacote-montagem.json', script: 'validateAssemblyPackage.js', receipt: ['MONTADOR', 'MONTAGEM'], packageState: 'CONCLUIDA_PARA_VALIDACAO' },
  veredito: { state: 'VALIDANDO', next: 'AGUARDANDO_APROVACAO_PROMOCAO', packageFile: 'veredito-validador.json', script: 'validateValidatorVerdict.js', receipt: ['VALIDADOR', 'VALIDACAO'], packageState: 'APTO_PARA_PROMOCAO' },
  promocao: { state: 'PROMOVENDO', next: 'CONCLUIDA', packageFile: 'pacote-promocao.json', script: 'validatePromotionPackage.js', receipt: ['MONTADOR', 'PROMOCAO'], packageState: 'CONCLUIDA' },
}[name]
const failures = []
if (!state || !definitions) failures.push('rodada ou pacote invalido')
if (state) failures.push(...validateKoraStateData(state, { round, repositoryRoot: root }))
if (state && definitions && state.status !== definitions.state) failures.push('a rodada nao esta na fase que pode receber este pacote')
if (state && definitions && !(TRANSITIONS[state.status] ?? []).includes(definitions.next)) failures.push('transicao do pacote nao permitida')
const receipt = definitions ? validate(root, definitions.script, round) : null
if (receipt && !receipt.passed) failures.push(...receipt.failures)
const packagePath = definitions && round ? path.join(root, '.designops', 'runs', round, definitions.packageFile) : null
if (packagePath && !fs.existsSync(packagePath)) failures.push('pacote ausente na rodada')
if (failures.length) {
  process.stdout.write(JSON.stringify({ passed: false, failures }, null, 2) + '\n')
  process.exit(1)
}
const occurredEm = new Date().toISOString()
state.pacotes[name] = { arquivo: `.designops/runs/${round}/${definitions.packageFile}`, sha256: sha256(packagePath), estado: definitions.packageState }
if (name === 'analista') {
  state.checkpoints.analise = { status: 'APROVADA', gatePreProposta: true, reconciliada: true }
  state.checkpoints.contrato.status = 'AGUARDANDO_APROVACAO'
}
if (name === 'montagem') {
  state.checkpoints.montagem.status = 'CONCLUIDA'
  state.checkpoints.validacao.status = 'EM_ANDAMENTO'
}
if (name === 'veredito') {
  state.checkpoints.validacao.status = 'FAVORAVEL'
  state.checkpoints.promocao.status = 'AGUARDANDO_APROVACAO'
}
if (name === 'promocao') state.checkpoints.promocao.status = 'CONCLUIDA'
state.recibos.push({ papel: definitions.receipt[0], checkpoint: definitions.receipt[1], resultado: 'FAVORAVEL', evidencia: 'Pacote verificavel da rodada: ' + name, ocorreuEm })
state.status = definitions.next
state.historico.push({ de: definitions.state, para: definitions.next, ocorreuEm, motivo: 'Pacote verificavel aceito: ' + name })
const finalValidation = validateKoraStateData(state, { round, repositoryRoot: root })
if (finalValidation.length) {
  process.stdout.write(JSON.stringify({ passed: false, failures: finalValidation }, null, 2) + '\n')
  process.exit(1)
}
fs.writeFileSync(file, JSON.stringify(state, null, 2) + '\n')
process.stdout.write(JSON.stringify({ passed: true, round, status: state.status, package: name, mensagemHumana: 'A entrega foi comprovada. A Kora encaminhou a rodada para a proxima fase permitida.' }, null, 2) + '\n')
