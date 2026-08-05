#!/usr/bin/env node
/*
 * Gate operacional da rodada de analise.
 *
 * Uso:
 *   node scripts/validateAnalysisRound.js --round <id> --stage pre-coleta|pre-proposta [--root <repositorio>]
 *
 * O script valida somente artefatos locais. A ordem entre o carregamento da
 * skill oficial e cada chamada MCP continua sendo conferida no historico do
 * turno; ela nao pode ser provada por um script no repositorio.
 */
const fs = require('fs')
const path = require('path')
const { validateReferenceScopeData } = require('./validateReferenceScopeCore')
const { validateAnalysisManifestData } = require('./validateAnalysisManifestCore')
const { validateContextDraftData } = require('./validateContextDraftCore')

function args(argv) {
  const result = {}
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index]
    if (!key.startsWith('--')) continue
    result[key.slice(2)] = argv[index + 1]
    index += 1
  }
  return result
}

function readJson(file, failures, label) {
  if (!fs.existsSync(file)) {
    failures.push(`${label} ausente: ${file}`)
    return null
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    failures.push(`${label} invalido: ${error.message}`)
    return null
  }
}

function validateComponentPlan(plan, round, failures) {
  if (!plan || plan.schemaVersion !== 1 || !plan.id || plan.rodada !== round) {
    failures.push('plano de componentes locais invalido ou pertence a outra rodada')
    return
  }
  if (!Array.isArray(plan.contextosConhecidos) || !Array.isArray(plan.componentes)) {
    failures.push('plano de componentes locais sem contextosConhecidos ou componentes')
    return
  }
  for (const component of plan.componentes) {
    const uses = (component?.reutilizacoes ?? []).map((use) => [use?.modalidade, use?.etapa, use?.tela, use?.casoUso].join('::'))
    if (!component?.id || component.aprovado !== true || uses.length < 2 || new Set(uses).size !== uses.length || uses.some((use) => use.includes('undefined'))) {
      failures.push(`componente local invalido no plano: ${component?.id ?? '?'}`)
    }
  }
}

function validateResolution(resolved, round, failures) {
  if (!resolved || resolved.schemaVersion !== 1 || resolved.rodada !== round) {
    failures.push('resolucao temporaria invalida ou pertence a outra rodada')
    return
  }
  if (!Array.isArray(resolved.telas) || !Array.isArray(resolved.jornadas)) failures.push('resolucao temporaria sem telas ou jornadas')
}

function rootArtifacts(runsDirectory) {
  if (!fs.existsSync(runsDirectory)) return []
  return fs.readdirSync(runsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== '.gitkeep')
    .map((entry) => entry.name)
}

function invalidDrafts(repositoryRoot, round) {
  const candidates = [
    { directory: path.join(repositoryRoot, 'docs', 'mapas'), relative: path.join('docs', 'mapas'), suffix: '-rascunho.md' },
    { directory: path.join(repositoryRoot, 'docs', 'contratos'), relative: path.join('docs', 'contratos'), suffix: '-rascunho.json' },
  ]
  return candidates.flatMap(({ directory, relative, suffix }) => {
    if (!fs.existsSync(directory)) return []
    return fs.readdirSync(directory)
      .filter((name) => name.endsWith(suffix))
      .filter((name) => {
        const content = fs.readFileSync(path.join(directory, name), 'utf8')
        return name.includes(round) || content.includes('rodada: ' + round) || content.includes('"rodada": "' + round + '"')
      })
      .map((name) => path.join(relative, name))
  })
}

function operatorProblem(failure) {
  if (failure.includes('fora de .designops/runs')) return { codigo: 'WORKTREE_COM_TENTATIVA_ANTERIOR', mensagemHumana: 'Há material de uma tentativa anterior fora da pasta da rodada atual.', responsavel: 'ANALISTA', proximaAcao: 'Preparar uma worktree limpa antes de continuar.' }
  if (failure.includes('diretorio da rodada ausente') || failure.includes('recorte de referencias ausente')) return { codigo: 'RODADA_NAO_PREPARADA', mensagemHumana: 'A rodada ainda não foi preparada para localizar as referências.', responsavel: 'ANALISTA', proximaAcao: 'Preparar a rodada e localizar as Sections informadas.' }
  if (failure.includes('recorte') || failure.includes('Section')) return { codigo: 'REFERENCIA_NAO_CONFIRMADA', mensagemHumana: 'Não consegui confirmar uma ou mais referências informadas no Figma.', responsavel: 'ANALISTA', proximaAcao: 'Conferir os nomes das Sections encontradas e pedir esclarecimento somente se necessário.' }
  if (failure.includes('reconciliacao') || failure.includes('coleta') || failure.includes('cobertura')) return { codigo: 'LEITURA_AINDA_NAO_COMPROVADA', mensagemHumana: 'A leitura técnica ainda não está completa o bastante para sustentar a proposta.', responsavel: 'ANALISTA', proximaAcao: 'Concluir ou recuperar apenas a leitura que falhou.' }
  if (failure.includes('contexto')) return { codigo: 'DECISAO_DE_CONTEXTO_PENDENTE', mensagemHumana: 'A proposta depende de uma decisão de contexto que a referência sozinha não revela.', responsavel: 'DESIGNER', proximaAcao: 'Apresentar uma pergunta curta com impacto e recomendação.' }
  return { codigo: 'EVIDENCIA_INCOMPLETA', mensagemHumana: 'Ainda falta uma evidência interna para concluir esta etapa.', responsavel: 'ANALISTA', proximaAcao: 'Corrigir a evidência e validar novamente.' }
}

function operatorResult(stage, passed, failures) {
  const problems = failures.map(operatorProblem)
  const unique = problems.filter((item, index) => problems.findIndex((other) => other.codigo === item.codigo) === index)
  return {
    status: passed ? (stage === 'pre-coleta' ? 'PRONTO_PARA_LEITURA' : 'PRONTO_PARA_REVISAO') : 'PRECISA_DE_ACAO_INTERNA',
    mensagemHumana: passed
      ? (stage === 'pre-coleta' ? 'As referências foram conferidas. A leitura pode começar.' : 'As evidências foram conferidas. O pacote está pronto para sua revisão.')
      : 'O Analista ainda precisa concluir uma etapa interna antes de apresentar o pacote para revisão.',
    problemas: unique,
  }
}

function main() {
  const input = args(process.argv.slice(2))
  const failures = []
  const round = input.round
  const stage = input.stage
  const repositoryRoot = path.resolve(input.root ?? path.join(__dirname, '..'))

  if (!round || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(round)) failures.push('round invalida; use somente letras, numeros, ponto, hifen ou sublinhado')
  if (!['pre-coleta', 'pre-proposta'].includes(stage)) failures.push('stage invalido; use pre-coleta ou pre-proposta')

  const runsDirectory = path.join(repositoryRoot, '.designops', 'runs')
  const roundDirectory = round ? path.join(runsDirectory, round) : null
  const rootFiles = rootArtifacts(runsDirectory)
  if (rootFiles.length) failures.push('artefatos de rodada fora de .designops/runs/<rodada>/: ' + rootFiles.join(', '))
  if (!roundDirectory || !fs.existsSync(roundDirectory) || !fs.statSync(roundDirectory).isDirectory()) failures.push('diretorio da rodada ausente: .designops/runs/<rodada>')

  const references = roundDirectory ? readJson(path.join(roundDirectory, 'referencias.json'), failures, 'recorte de referencias') : null
  if (references) {
    failures.push(...validateReferenceScopeData(references))
    if (references.rodada !== round) failures.push('recorte de referencias pertence a outra rodada')
  }

  if (stage === 'pre-proposta') {
    const drafts = invalidDrafts(repositoryRoot, round)
    if (drafts.length) failures.push('mapa ou contrato rascunho criado antes do gate: ' + drafts.join(', '))

    const manifest = roundDirectory ? readJson(path.join(roundDirectory, 'analise.json'), failures, 'manifesto de analise') : null
    if (manifest) {
      failures.push(...validateAnalysisManifestData(manifest, references))
      if (manifest.rodada !== round) failures.push('manifesto de analise pertence a outra rodada')
      if (manifest.status !== 'PROPOSTA_PARA_APROVACAO') failures.push('pre-proposta exige manifesto em PROPOSTA_PARA_APROVACAO')
    }

    const context = roundDirectory ? readJson(path.join(roundDirectory, 'contexto.json'), failures, 'rascunho de contexto') : null
    if (context) {
      failures.push(...validateContextDraftData(context))
      if (context.rodada !== round) failures.push('rascunho de contexto pertence a outra rodada')
    }

    const components = roundDirectory ? readJson(path.join(roundDirectory, 'componentes-locais.json'), failures, 'plano de componentes locais') : null
    validateComponentPlan(components, round, failures)

    if (manifest?.requerResolucaoIds === true) {
      const resolved = roundDirectory ? readJson(path.join(roundDirectory, 'resolvido.json'), failures, 'resolucao temporaria') : null
      validateResolution(resolved, round, failures)
    }
  }

  const passed = failures.length === 0
  const nextState = passed
    ? (stage === 'pre-coleta' ? 'COLETA_PENDENTE' : 'PRONTA_PARA_APROVACAO_HUMANA')
    : (stage === 'pre-coleta' ? 'CORRIGIR_RECORTE' : 'NAO_AUTORIZAR_PROPOSTA')
  console.log(JSON.stringify({ round, stage, passed, nextState, failures, operator: operatorResult(stage, passed, failures) }, null, 2))
  process.exit(passed ? 0 : 1)
}

main()
