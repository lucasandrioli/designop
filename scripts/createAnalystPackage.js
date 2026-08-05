#!/usr/bin/env node
/* Cria o recibo final do Analista a partir dos artefatos ja comprovados. */
const childProcess = require('child_process')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

function args(argv) {
  const input = {}
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) continue
    input[argv[index].slice(2)] = argv[index + 1]
    index += 1
  }
  return input
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')) }
function hash(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
function artifact(directory, tipo, caminho) {
  const file = path.join(directory, caminho)
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error('artefato obrigatorio ausente: ' + tipo)
  return { tipo, caminho, sha256: hash(file) }
}
function summaryFrom(state) {
  const decisions = (state.decisoes ?? []).filter((item) => item.status === 'PENDENTE').map((item) => ({ pergunta: item.pergunta, impacto: item.impacto, recomendacao: item.recomendacao }))
  const conclusions = (state.confrontos ?? []).filter((item) => item.situacaoBase === 'DOCUMENTADO').map((item) => item.conclusao)
  return {
    concluido: conclusions.length ? conclusions : ['As referências informadas foram analisadas e confrontadas com a base disponível.'],
    encontrado: (state.achados ?? []).map((item) => item.descricao).filter(Boolean).slice(0, 8),
    proposta: { resumo: state.proposta.resumo, entregaveis: state.proposta.entregaveis },
    decisoes: decisions,
    proximoPasso: decisions.length ? 'Preciso da sua decisão nos pontos indicados para liberar a próxima etapa.' : 'Você pode revisar a proposta. A montagem só começa depois da sua aprovação explícita.',
  }
}

const input = args(process.argv.slice(2))
const round = input.round
const repositoryRoot = path.resolve(input.root ?? path.join(__dirname, '..'))
const scriptRoot = path.resolve(__dirname, '..')
if (!round || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(round)) throw new Error('Informe --round com identificador valido')
const directory = path.join(repositoryRoot, '.designops', 'runs', round)
const gate = childProcess.spawnSync(process.execPath, [path.join(scriptRoot, 'scripts', 'validateAnalysisRound.js'), '--round', round, '--stage', 'pre-proposta', '--root', repositoryRoot], { encoding: 'utf8' })
if (gate.status !== 0) throw new Error('A analise ainda nao esta comprovada para criar o pacote final')
const manifest = readJson(path.join(directory, 'analise.json'))
const state = readJson(path.join(directory, 'estado-analista.json'))
if (state.rodada !== round || state.status !== 'PRONTO_PARA_REVISAO' || state?.proposta?.status !== 'PRONTA') throw new Error('O estado do Analista ainda nao declara proposta pronta')
const artifacts = [
  artifact(directory, 'REFERENCIAS', 'referencias.json'),
  artifact(directory, 'MANIFESTO_ANALISE', 'analise.json'),
  artifact(directory, 'CONTEXTO', 'contexto.json'),
  artifact(directory, 'ESTADO_ANALISTA', 'estado-analista.json'),
  artifact(directory, 'PLANO_VARIAVEIS', 'plano-variaveis.json'),
  artifact(directory, 'PLANO_COMPONENTES_LOCAIS', 'componentes-locais.json'),
  artifact(directory, 'MAPA_JORNADA', 'proposta/mapa-jornada.md'),
  artifact(directory, 'CONTRATO_TELA', 'proposta/contrato-tela.json'),
  artifact(directory, 'CONTRATO_JORNADA', 'proposta/contrato-jornada.json'),
  artifact(directory, 'MAPA_IDS', 'proposta/mapa-ids.json'),
]
if (manifest.requerResolucaoIds === true) artifacts.push(artifact(directory, 'RESOLUCAO_IDS', 'resolvido.json'))
const analystPackage = {
  schemaVersion: 1,
  id: 'pacote-' + round,
  rodada: round,
  status: 'PRONTO_PARA_REVISAO',
  artefatos: artifacts,
  resumoHumano: summaryFrom(state),
}
fs.writeFileSync(path.join(directory, 'pacote-analista.json'), JSON.stringify(analystPackage, null, 2) + '\n')
console.log(JSON.stringify({ round, packageFile: '.designops/runs/' + round + '/pacote-analista.json', message: 'Pacote final do Analista preparado para validacao.' }, null, 2))
