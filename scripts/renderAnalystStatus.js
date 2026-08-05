#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const { validateAnalystStateData } = require('./validateAnalystStateCore')

function args(argv) {
  const input = {}
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) continue
    if (argv[index] === '--write') {
      input.write = true
      continue
    }
    input[argv[index].slice(2)] = argv[index + 1]
    index += 1
  }
  return input
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')) }
function statusTitle(status) {
  return ({ PREPARANDO: 'Recebi o material', LENDO_REFERENCIAS: 'Estou analisando', ORGANIZANDO_ACHADOS: 'Estou organizando o que encontrei', AGUARDANDO_DECISAO_DO_DESIGNER: 'Só preciso da sua decisão nestes pontos', PRONTO_PARA_REVISAO: 'Proposta pronta para sua revisão', BLOQUEADO_TECNICAMENTE: 'Não consegui concluir uma parte da leitura' })[status] ?? 'Status da análise'
}
function sectionLine(item, manifest) {
  const structure = manifest?.coberturaEstrutura?.find((coverage) => coverage.nodeId === item.nodeId || coverage.secao === item.nome)
  const reactions = manifest?.coberturaReacoes?.find((coverage) => coverage.nodeId === item.nodeId || coverage.secao === item.nome)
  if (item.status === 'CONCLUIDA' || (structure?.status === 'COBERTA' && reactions?.status === 'COBERTA')) return `- ${item.nome}: leitura concluída`
  if (item.status === 'LENDO') return `- ${item.nome}: em leitura`
  if (item.status === 'NAO_ENCONTRADA') return `- ${item.nome}: não encontrada no arquivo`
  if (item.status === 'FALHOU') return `- ${item.nome}: leitura não concluída`
  return `- ${item.nome}: aguardando leitura`
}
function readReadyPackage(repositoryRoot, round) {
  const validation = childProcess.spawnSync(process.execPath, [path.join(__dirname, 'validateAnalystPackage.js'), '--round', round, '--root', repositoryRoot], { encoding: 'utf8' })
  if (validation.status !== 0) return null
  const file = path.join(repositoryRoot, '.designops', 'runs', round, 'pacote-analista.json')
  try { return readJson(file) } catch { return null }
}
function readyPackageLines(analystPackage) {
  const human = analystPackage.resumoHumano
  const lines = ['# Proposta pronta para sua revisão', '', '## O que foi concluído']
  for (const item of human.concluido) lines.push('- ' + item)
  lines.push('', '## O que encontrei')
  for (const item of human.encontrado) lines.push('- ' + item)
  lines.push('', '## Proposta', human.proposta.resumo)
  for (const item of human.proposta.entregaveis) lines.push('- ' + item)
  if (human.decisoes.length) {
    lines.push('', '## Só preciso da sua decisão nestes pontos')
    for (const item of human.decisoes) lines.push(`- ${item.pergunta}\n  Impacto: ${item.impacto}\n  Recomendação: ${item.recomendacao}`)
  }
  lines.push('', '## Próximo passo', human.proximoPasso)
  return lines
}
const input = args(process.argv.slice(2))
const repositoryRoot = path.resolve(input.root ?? path.join(__dirname, '..'))
const directory = input.round ? path.join(repositoryRoot, '.designops', 'runs', input.round) : null
const stateFile = input.file ? path.resolve(input.file) : directory ? path.join(directory, 'estado-analista.json') : null
if (!stateFile || !fs.existsSync(stateFile)) {
  console.error('Informe --round <rodada> ou --file <estado-analista.json>.')
  process.exit(1)
}
const state = readJson(stateFile)
const failures = validateAnalystStateData(state)
if (failures.length) {
  console.error('Não foi possível gerar o resumo porque o estado está inconsistente.')
  process.exit(1)
}
const manifestFile = path.join(path.dirname(stateFile), 'analise.json')
const manifest = fs.existsSync(manifestFile) ? readJson(manifestFile) : null
const readyPackage = state.status === 'PRONTO_PARA_REVISAO' ? readReadyPackage(repositoryRoot, state.rodada) : null
if (state.status === 'PRONTO_PARA_REVISAO' && !readyPackage) {
  console.error('Não foi possível apresentar a proposta porque o pacote final ainda não está consistente.')
  process.exit(1)
}
const lines = readyPackage
  ? readyPackageLines(readyPackage)
  : [`# ${statusTitle(state.status)}`, '', '## Referências', ...state.progresso.sections.map((item) => sectionLine(item, manifest))]
if (!readyPackage && state.entrada.contextoCurto) lines.push('', '## Objetivo informado', state.entrada.contextoCurto)
if (!readyPackage && state.achados.length) {
  lines.push('', '## O que encontrei')
  for (const item of state.achados) lines.push(`- ${item.titulo}: ${item.descricao}`)
}
const documented = state.confrontos.filter((item) => item.situacaoBase === 'DOCUMENTADO')
const pendingComparison = state.confrontos.filter((item) => item.situacaoBase !== 'DOCUMENTADO')
if (!readyPackage && documented.length) {
  lines.push('', '## O que a base já estabelece')
  for (const item of documented) lines.push(`- ${item.topico}: ${item.conclusao}`)
}
if (!readyPackage && pendingComparison.length) {
  lines.push('', '## O que a referência traz para decidir')
  for (const item of pendingComparison) lines.push(`- ${item.topico}: ${item.conclusao}`)
}
if (!readyPackage && state.proposta.status !== 'NAO_INICIADA') {
  lines.push('', '## Proposta', state.proposta.resumo || 'A proposta está sendo preparada.')
  for (const item of state.proposta.entregaveis) lines.push(`- ${item}`)
}
const pending = state.decisoes.filter((item) => item.status === 'PENDENTE')
if (!readyPackage && pending.length) {
  lines.push('', '## Só preciso da sua decisão nestes pontos')
  for (const item of pending) lines.push(`- ${item.pergunta}\n  Impacto: ${item.impacto}\n  Recomendação: ${item.recomendacao}`)
}
const activeProblems = state.problemas.filter((item) => item.bloqueia)
if (!readyPackage && activeProblems.length) {
  lines.push('', '## O que impede a próxima etapa')
  for (const item of activeProblems) lines.push(`- ${item.mensagemHumana}\n  Próximo passo: ${item.proximaAcao}`)
}
if (!readyPackage && !pending.length && !activeProblems.length) {
  const next = state.status === 'PREPARANDO' ? 'Vou localizar as referências informadas e iniciar a leitura.' : state.status === 'LENDO_REFERENCIAS' ? 'Vou concluir as referências restantes antes de preparar a proposta.' : state.status === 'PRONTO_PARA_REVISAO' ? 'Você pode revisar a proposta. A montagem só começa depois da sua aprovação explícita.' : 'Vou concluir a organização dos achados e preparar a proposta.'
  lines.push('', '## Próximo passo', next)
}
const output = lines.join('\n') + '\n'
if (input.write) {
  const runDirectory = path.dirname(stateFile)
  const evidence = ['referencias.json', 'analise.json', 'contexto.json', 'plano-variaveis.json', 'componentes-locais.json', 'resolvido.json', 'pacote-analista.json']
    .filter((name) => fs.existsSync(path.join(runDirectory, name)))
    .map((name) => `- ${name}`)
  fs.writeFileSync(path.join(runDirectory, 'resumo-operador.md'), output)
  fs.writeFileSync(path.join(runDirectory, 'pacote-analista.md'), output + '\n## Evidência interna\n' + (evidence.length ? evidence.join('\n') : '- A leitura ainda está em preparação.') + '\n')
}
process.stdout.write(output)
