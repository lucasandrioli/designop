#!/usr/bin/env node
/* Bloqueia delegacao quando o estado verificavel da rodada nao permite a acao. */
const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
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
const input = args(process.argv.slice(2))
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const round = input.round
const role = String(input.role ?? '').trim().toUpperCase()
const action = String(input.action ?? '').trim().toUpperCase()
const file = round ? path.join(root, '.designops', 'runs', round, 'kora.json') : null
const failures = []
if (!round || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(round)) failures.push('round invalida')
if (!file || !fs.existsSync(file)) failures.push('estado Kora ausente')
let state = null
if (!failures.length) {
  try { state = JSON.parse(fs.readFileSync(file, 'utf8')) } catch { failures.push('estado Kora invalido') }
}
if (state) failures.push(...validateKoraStateData(state, { round, repositoryRoot: root }))
const allStates = ['PREPARANDO', 'ANALISANDO', 'AGUARDANDO_APROVACAO_CONTRATO', 'MONTANDO', 'VALIDANDO', 'AGUARDANDO_APROVACAO_PROMOCAO', 'PROMOVENDO', 'AGUARDANDO_DECISAO_DO_DESIGNER', 'BLOQUEADA', 'INTERROMPIDA', 'CONCLUIDA']
const allowed = {
  ANALISTA: { ANALISAR: ['PREPARANDO', 'ANALISANDO'] },
  OPERADOR: { CONSULTAR_BASE: ['ANALISANDO', 'AGUARDANDO_DECISAO_DO_DESIGNER'] },
  MONTADOR: { MONTAR: ['MONTANDO'], PROMOVER: ['PROMOVENDO'] },
  VALIDADOR: { VALIDAR: ['VALIDANDO'] },
  REGISTRADOR: { REGISTRAR: allStates, AUDITAR: allStates },
}
if (!allowed[role]?.[action]) failures.push('papel ou acao nao autorizados')
if (state && allowed[role]?.[action] && !allowed[role][action].includes(state.status)) failures.push(`estado ${state.status} nao permite ${role} / ${action}`)
if (state && role === 'MONTADOR' && (!state.aprovacoes.contrato || state.checkpoints.contrato.status !== 'APROVADO')) failures.push('montagem sem aprovacao explicita de contrato')
if (state && role === 'VALIDADOR' && state.checkpoints.montagem.status !== 'CONCLUIDA') failures.push('validacao sem montagem concluida')
if (state && role === 'MONTADOR' && action === 'PROMOVER' && (!state.aprovacoes.promocao || state.checkpoints.promocao.status !== 'APROVADA')) failures.push('promocao sem aprovacao explicita registrada')
if (state && ['MONTADOR', 'VALIDADOR'].includes(role)) {
  const result = childProcess.spawnSync(process.execPath, [path.join(root, 'scripts', 'validateKoraPackages.js'), '--round', round, '--root', root], { cwd: root, encoding: 'utf8' })
  if (result.status !== 0) failures.push('recibos obrigatorios da fase nao permitem esta delegacao')
}
const passed = failures.length === 0
process.stdout.write(JSON.stringify({ passed, round: round ?? null, role, action, status: state?.status ?? null, failures }, null, 2) + '\n')
process.exit(passed ? 0 : 1)
