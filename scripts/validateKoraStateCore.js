const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const STATUSES = [
  'PREPARANDO',
  'ANALISANDO',
  'AGUARDANDO_APROVACAO_CONTRATO',
  'MONTANDO',
  'VALIDANDO',
  'AGUARDANDO_APROVACAO_PROMOCAO',
  'PROMOVENDO',
  'CONCLUIDA',
  'AGUARDANDO_DECISAO_DO_DESIGNER',
  'BLOQUEADA',
  'INTERROMPIDA',
]

const TRANSITIONS = {
  PREPARANDO: ['ANALISANDO', 'AGUARDANDO_DECISAO_DO_DESIGNER', 'BLOQUEADA', 'INTERROMPIDA'],
  ANALISANDO: ['ANALISANDO', 'AGUARDANDO_APROVACAO_CONTRATO', 'AGUARDANDO_DECISAO_DO_DESIGNER', 'BLOQUEADA', 'INTERROMPIDA'],
  AGUARDANDO_APROVACAO_CONTRATO: ['MONTANDO', 'AGUARDANDO_DECISAO_DO_DESIGNER', 'BLOQUEADA', 'INTERROMPIDA'],
  MONTANDO: ['MONTANDO', 'VALIDANDO', 'AGUARDANDO_DECISAO_DO_DESIGNER', 'BLOQUEADA', 'INTERROMPIDA'],
  VALIDANDO: ['MONTANDO', 'VALIDANDO', 'AGUARDANDO_APROVACAO_PROMOCAO', 'AGUARDANDO_DECISAO_DO_DESIGNER', 'BLOQUEADA', 'INTERROMPIDA'],
  AGUARDANDO_APROVACAO_PROMOCAO: ['PROMOVENDO', 'AGUARDANDO_DECISAO_DO_DESIGNER', 'BLOQUEADA', 'INTERROMPIDA'],
  PROMOVENDO: ['CONCLUIDA', 'AGUARDANDO_DECISAO_DO_DESIGNER', 'BLOQUEADA', 'INTERROMPIDA'],
  AGUARDANDO_DECISAO_DO_DESIGNER: ['PREPARANDO', 'ANALISANDO', 'AGUARDANDO_APROVACAO_CONTRATO', 'MONTANDO', 'VALIDANDO', 'AGUARDANDO_APROVACAO_PROMOCAO', 'PROMOVENDO', 'BLOQUEADA', 'INTERROMPIDA'],
  BLOQUEADA: ['PREPARANDO', 'ANALISANDO', 'AGUARDANDO_APROVACAO_CONTRATO', 'MONTANDO', 'VALIDANDO', 'AGUARDANDO_APROVACAO_PROMOCAO', 'PROMOVENDO', 'AGUARDANDO_DECISAO_DO_DESIGNER', 'INTERROMPIDA'],
  INTERROMPIDA: ['PREPARANDO', 'ANALISANDO', 'AGUARDANDO_APROVACAO_CONTRATO', 'MONTANDO', 'VALIDANDO', 'AGUARDANDO_APROVACAO_PROMOCAO', 'PROMOVENDO', 'AGUARDANDO_DECISAO_DO_DESIGNER', 'BLOQUEADA'],
  CONCLUIDA: [],
}

function validDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function validateApproval(approval, type, failures) {
  if (approval === null) return false
  if (!approval || approval.tipo !== type || approval.decisao !== 'APROVADA' || approval.confirmadoPor !== 'DESIGNER' || !validDate(approval.ocorreuEm)) {
    failures.push(`aprovacao explicita de ${type.toLowerCase()} invalida`)
    return false
  }
  return true
}

function validateArtifact(artifact, index, repositoryRoot, failures) {
  if (!artifact?.id || !artifact?.caminho || !/^[a-f0-9]{64}$/.test(artifact?.sha256 ?? '')) {
    failures.push(`artefatos[${index}] precisa ter id, caminho e sha256 valido`)
    return
  }
  if (!repositoryRoot) return
  const relative = artifact.caminho
  const absolute = path.resolve(repositoryRoot, relative)
  const relativeToRoot = path.relative(repositoryRoot, absolute)
  if (path.isAbsolute(relative) || relativeToRoot === '..' || relativeToRoot.startsWith('..' + path.sep)) {
    failures.push(`artefatos[${index}] aponta para fora da worktree`)
    return
  }
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    failures.push(`artefatos[${index}] nao encontrado: ${relative}`)
    return
  }
  const actualHash = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')
  if (actualHash !== artifact.sha256) failures.push(`artefatos[${index}] diverge do sha256 registrado: ${relative}`)
}

function validatePackage(entry, name, expectedState, state, repositoryRoot, failures) {
  if (entry == null) return false
  if (!entry?.arquivo || !/^[a-f0-9]{64}$/.test(entry?.sha256 ?? '') || entry?.estado !== expectedState) {
    failures.push(`pacotes.${name} invalido`)
    return false
  }
  const expectedPath = `.designops/runs/${state.rodada}/${name === 'analista' ? 'pacote-analista.json' : name === 'montagem' ? 'pacote-montagem.json' : name === 'veredito' ? 'veredito-validador.json' : 'pacote-promocao.json'}`
  if (entry.arquivo !== expectedPath) {
    failures.push(`pacotes.${name} precisa apontar para o recibo da rodada atual`)
    return false
  }
  if (!repositoryRoot) return true
  const file = path.resolve(repositoryRoot, entry.arquivo)
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    failures.push(`pacotes.${name} ausente`)
    return false
  }
  const actual = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
  if (actual !== entry.sha256) {
    failures.push(`pacotes.${name} diverge do sha256 registrado`)
    return false
  }
  return true
}

function validateKoraStateData(state, options = {}) {
  const failures = []
  const required = ['schemaVersion', 'rodada', 'status', 'entrada', 'checkpoints', 'aprovacoes', 'tentativas', 'recibos', 'artefatos', 'decisoes', 'bloqueios', 'historico']
  for (const field of required) if (!(field in (state ?? {}))) failures.push('campo ausente: ' + field)
  if (state?.schemaVersion !== 1) failures.push('schemaVersion precisa ser 1')
  if (!state?.rodada || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(state.rodada)) failures.push('rodada invalida')
  if (options.round && state?.rodada !== options.round) failures.push('estado pertence a outra rodada')
  if (!STATUSES.includes(state?.status)) failures.push('status invalido')

  const sections = state?.entrada?.sections
  if (typeof state?.entrada?.figmaUrl !== 'string' || !state.entrada.figmaUrl.trim() || !Array.isArray(sections) || sections.length === 0) failures.push('entrada sem Figma ou Sections')
  if (state?.entrada && state.entrada.contextoCurto !== null && typeof state.entrada.contextoCurto !== 'string') failures.push('contexto curto invalido')
  const uniqueSections = new Set()
  for (const [index, section] of (sections ?? []).entries()) {
    const name = String(section ?? '').trim()
    if (!name) failures.push(`entrada.sections[${index}] vazia`)
    if (uniqueSections.has(name)) failures.push('entrada possui Section duplicada: ' + name)
    uniqueSections.add(name)
  }

  const checkpoints = state?.checkpoints ?? {}
  const allowedCheckpoints = {
    analise: ['PENDENTE', 'EM_ANDAMENTO', 'APROVADA'],
    contrato: ['PENDENTE', 'AGUARDANDO_APROVACAO', 'APROVADO'],
    montagem: ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'],
    validacao: ['PENDENTE', 'EM_ANDAMENTO', 'FAVORAVEL', 'DESFAVORAVEL'],
    promocao: ['PENDENTE', 'AGUARDANDO_APROVACAO', 'APROVADA', 'CONCLUIDA'],
  }
  for (const [name, allowed] of Object.entries(allowedCheckpoints)) {
    if (!allowed.includes(checkpoints?.[name]?.status)) failures.push(`checkpoints.${name}.status invalido`)
  }
  if (typeof checkpoints?.analise?.gatePreProposta !== 'boolean' || typeof checkpoints?.analise?.reconciliada !== 'boolean') failures.push('checkpoints.analise sem comprovacoes obrigatorias')

  const approvals = state?.aprovacoes ?? {}
  const contractApproved = validateApproval(approvals.contrato, 'CONTRATO', failures)
  const promotionApproved = validateApproval(approvals.promocao, 'PROMOCAO', failures)
  if (checkpoints?.contrato?.status === 'APROVADO' && !contractApproved) failures.push('contrato aprovado sem aprovacao explicita do designer')
  if (contractApproved && checkpoints?.contrato?.status !== 'APROVADO') failures.push('aprovacao de contrato registrada fora do checkpoint de contrato aprovado')
  if (checkpoints?.promocao?.status === 'APROVADA' || checkpoints?.promocao?.status === 'CONCLUIDA') {
    if (!promotionApproved) failures.push('promocao aprovada sem aprovacao explicita do designer')
  }
  if (promotionApproved && !['APROVADA', 'CONCLUIDA'].includes(checkpoints?.promocao?.status)) failures.push('aprovacao de promocao registrada fora do checkpoint de promocao aprovado')

  if (!Array.isArray(state?.tentativas)) failures.push('tentativas precisa ser lista')
  const failedAttempts = new Map()
  const recoveryBreaches = []
  for (const [index, attempt] of (state?.tentativas ?? []).entries()) {
    if (!attempt?.agente || !attempt?.causa || !attempt?.acao || !attempt?.evidencia || !['FALHOU', 'SUCESSO'].includes(attempt?.resultado) || !validDate(attempt?.ocorreuEm)) {
      failures.push(`tentativas[${index}] invalida`)
      continue
    }
    if (attempt.resultado === 'FALHOU') {
      const key = [attempt.causa, attempt.agente, attempt.acao, attempt.evidencia].join('::')
      const count = (failedAttempts.get(key) ?? 0) + 1
      failedAttempts.set(key, count)
      if (count > 2) recoveryBreaches.push(attempt)
    }
  }

  if (!Array.isArray(state?.recibos)) failures.push('recibos precisa ser lista')
  const receiptTypes = new Set()
  for (const [index, receipt] of (state?.recibos ?? []).entries()) {
    if (!['ANALISTA', 'MONTADOR', 'VALIDADOR', 'OPERADOR', 'REGISTRADOR'].includes(receipt?.papel) || !['ANALISE', 'MONTAGEM', 'VALIDACAO', 'PROMOCAO', 'AUDITORIA'].includes(receipt?.checkpoint) || !['FAVORAVEL', 'DESFAVORAVEL', 'LIMITADA'].includes(receipt?.resultado) || !receipt?.evidencia || !validDate(receipt?.ocorreuEm)) {
      failures.push(`recibos[${index}] invalido`)
      continue
    }
    receiptTypes.add([receipt.papel, receipt.checkpoint, receipt.resultado].join('::'))
  }

  if (!Array.isArray(state?.artefatos)) failures.push('artefatos precisa ser lista')
  const artifactIds = new Set()
  const artifactPaths = new Set()
  for (const [index, artifact] of (state?.artefatos ?? []).entries()) {
    validateArtifact(artifact, index, options.repositoryRoot, failures)
    if (artifactIds.has(artifact?.id)) failures.push('artefato com id duplicado: ' + artifact?.id)
    if (artifactPaths.has(artifact?.caminho)) failures.push('artefato com caminho duplicado: ' + artifact?.caminho)
    artifactIds.add(artifact?.id)
    artifactPaths.add(artifact?.caminho)
    if (artifact?.caminho && !artifact.caminho.startsWith(`.designops/runs/${state?.rodada}/`)) failures.push(`artefatos[${index}] precisa permanecer isolado na rodada atual`)
  }

  const packages = state?.pacotes
  if (packages !== undefined && (typeof packages !== 'object' || Array.isArray(packages))) failures.push('pacotes precisa ser objeto')
  const legacyPackages = packages === undefined
  const analystPackage = legacyPackages || validatePackage(packages?.analista, 'analista', 'PRONTO_PARA_REVISAO', state, options.repositoryRoot, failures)
  const assemblyPackage = legacyPackages || validatePackage(packages?.montagem, 'montagem', 'CONCLUIDA_PARA_VALIDACAO', state, options.repositoryRoot, failures)
  const verdictPackage = legacyPackages || validatePackage(packages?.veredito, 'veredito', 'APTO_PARA_PROMOCAO', state, options.repositoryRoot, failures)
  const promotionPackage = legacyPackages || validatePackage(packages?.promocao, 'promocao', 'CONCLUIDA', state, options.repositoryRoot, failures)

  const pendingAuthorization = state?.autorizacaoPendente
  if (pendingAuthorization !== undefined && pendingAuthorization !== null) {
    if (!['ANALISTA', 'MONTADOR', 'VALIDADOR', 'OPERADOR', 'REGISTRADOR'].includes(pendingAuthorization?.papel) ||
      !pendingAuthorization?.acao || !validDate(pendingAuthorization?.autorizadaEm)) {
      failures.push('autorizacao pendente invalida')
    }
  }

  if (!Array.isArray(state?.decisoes)) failures.push('decisoes precisa ser lista')
  for (const [index, decision] of (state?.decisoes ?? []).entries()) {
    if (!decision?.id || !decision?.pergunta || !['PENDENTE', 'RESPONDIDA'].includes(decision?.status)) failures.push(`decisoes[${index}] invalida`)
    if (decision?.status === 'RESPONDIDA' && (!String(decision?.resposta ?? '').trim() || !validDate(decision?.respondidaEm))) failures.push(`decisoes[${index}] respondida sem resposta datada`)
    if (decision?.status === 'PENDENTE' && (decision?.resposta != null || decision?.respondidaEm != null)) failures.push(`decisoes[${index}] pendente nao pode carregar resposta`)
  }
  if (!Array.isArray(state?.bloqueios)) failures.push('bloqueios precisa ser lista')
  for (const [index, block] of (state?.bloqueios ?? []).entries()) {
    if (!block?.codigo || !block?.mensagem || !block?.proximaAcao) failures.push(`bloqueios[${index}] invalido`)
  }
  for (const breach of recoveryBreaches) {
    const consolidatedAsBlock = state?.status === 'BLOQUEADA' && (state?.bloqueios ?? []).some((block) => String(block?.mensagem ?? '').includes(breach.causa))
    const consolidatedAsDecision = state?.status === 'AGUARDANDO_DECISAO_DO_DESIGNER' && (state?.decisoes ?? []).some((decision) => decision?.status === 'PENDENTE' && String(decision?.pergunta ?? '').includes(breach.causa))
    if (!consolidatedAsBlock && !consolidatedAsDecision) failures.push(`terceira repeticao sem consolidacao humana para ${breach.causa} / ${breach.agente} / ${breach.acao}`)
  }

  const incident = state?.incidenteOperacao
  if (incident !== undefined && incident !== null) {
    if (!/^inc-[A-Za-z0-9._-]+$/.test(incident?.id ?? '') || incident?.classificacao !== 'INCIDENTE_DA_OPERACAO' || !['ANALISE', 'MONTAGEM', 'VALIDACAO', 'PROMOCAO', 'ORQUESTRACAO'].includes(incident?.fase) || !['KORA', 'ANALISTA', 'MONTADOR', 'VALIDADOR', 'OPERADOR', 'REGISTRADOR'].includes(incident?.papel) || incident?.impacto !== 'BLOQUEIA_RODADA' || !['ANALISANDO', 'MONTANDO', 'VALIDANDO', 'AGUARDANDO_APROVACAO_PROMOCAO'].includes(incident?.pontoRetomada) || !['ABERTO', 'RETOMADO'].includes(incident?.status) || !validDate(incident?.criadoEm)) {
      failures.push('incidente da operacao invalido')
    }
    if (incident?.status === 'RETOMADO' && (!validDate(incident?.retomadoEm) || !/^[a-f0-9]{7,64}$/.test(incident?.correcaoCommit ?? ''))) failures.push('incidente retomado sem commit de correcao verificavel')
    if (incident?.status === 'ABERTO' && (incident?.retomadoEm != null || incident?.correcaoCommit != null)) failures.push('incidente aberto nao pode carregar correcao')
  }

  if (!Array.isArray(state?.historico)) failures.push('historico precisa ser lista')
  let current = 'PREPARANDO'
  for (const [index, transition] of (state?.historico ?? []).entries()) {
    if (!transition?.de || !transition?.para || !validDate(transition?.ocorreuEm)) {
      failures.push(`historico[${index}] invalido`)
      continue
    }
    if (transition.de !== current) failures.push(`historico[${index}] nao parte do estado anterior`)
    if (!(TRANSITIONS[transition.de] ?? []).includes(transition.para)) failures.push(`transicao nao permitida: ${transition.de} -> ${transition.para}`)
    current = transition.para
  }
  if (state?.status !== 'PREPARANDO' && state?.historico?.length === 0) failures.push('status fora de PREPARANDO sem historico de transicao')
  if (state?.historico?.length && current !== state.status) failures.push('ultimo historico nao corresponde ao status atual')

  const analysisReady = checkpoints?.analise?.status === 'APROVADA' && checkpoints.analise.gatePreProposta === true && checkpoints.analise.reconciliada === true && analystPackage
  const contractReady = checkpoints?.contrato?.status === 'APROVADO' && contractApproved
  const assemblyReady = analysisReady && contractReady && checkpoints?.montagem?.status === 'CONCLUIDA' && receiptTypes.has('MONTADOR::MONTAGEM::FAVORAVEL') && assemblyPackage
  const validationReady = assemblyReady && checkpoints?.validacao?.status === 'FAVORAVEL' && receiptTypes.has('VALIDADOR::VALIDACAO::FAVORAVEL') && verdictPackage
  const pendingDecision = (state?.decisoes ?? []).some((item) => item?.status === 'PENDENTE')
  if (state?.status === 'PREPARANDO' && checkpoints?.analise?.status !== 'PENDENTE') failures.push('PREPARANDO exige analise pendente')
  if (state?.status === 'ANALISANDO' && checkpoints?.analise?.status !== 'EM_ANDAMENTO') failures.push('ANALISANDO exige analise em andamento')
  if (state?.status === 'AGUARDANDO_APROVACAO_CONTRATO') {
    if (!analysisReady) failures.push('proposta nao comprovada por gate e reconciliacao favoraveis')
    if (!receiptTypes.has('ANALISTA::ANALISE::FAVORAVEL')) failures.push('proposta sem recibo favoravel do Analista')
    if (checkpoints?.contrato?.status !== 'AGUARDANDO_APROVACAO') failures.push('aguardando aprovacao de contrato sem contrato pendente')
    if (approvals.contrato !== null) failures.push('aguardando aprovacao de contrato nao pode conter aprovacao ja registrada')
  }
  if (state?.status === 'MONTANDO') {
    if (!analysisReady || !contractReady || checkpoints?.montagem?.status !== 'EM_ANDAMENTO') failures.push('MONTANDO exige analise comprovada e contrato aprovado explicitamente')
  }
  if (state?.status === 'VALIDANDO') {
    if (!assemblyReady || checkpoints?.validacao?.status !== 'EM_ANDAMENTO') failures.push('VALIDANDO exige analise, contrato e montagem concluidos com recibo favoravel do Montador')
  }
  if (state?.status === 'AGUARDANDO_APROVACAO_PROMOCAO') {
    if (!validationReady || checkpoints?.promocao?.status !== 'AGUARDANDO_APROVACAO') failures.push('aguardando promocao exige veredito favoravel independente')
    if (approvals.promocao !== null) failures.push('aguardando promocao nao pode conter aprovacao ja registrada')
  }
  if (state?.status === 'PROMOVENDO') {
    if (!validationReady || checkpoints?.promocao?.status !== 'APROVADA' || !promotionApproved) failures.push('PROMOVENDO exige veredito favoravel e aprovacao humana de promocao')
  }
  if (state?.status === 'CONCLUIDA') {
    if (!validationReady || !promotionPackage || checkpoints?.promocao?.status !== 'CONCLUIDA' || !promotionApproved || (!legacyPackages && !receiptTypes.has('MONTADOR::PROMOCAO::FAVORAVEL'))) failures.push('CONCLUIDA exige validacao favoravel e promocao explicitamente aprovada e concluida')
  }
  if (state?.status === 'AGUARDANDO_DECISAO_DO_DESIGNER' && !pendingDecision) failures.push('aguardando decisao sem pergunta pendente')
  if (state?.status === 'BLOQUEADA' && state?.bloqueios?.length === 0) failures.push('BLOQUEADA exige bloqueio registrado')
  if (state?.status === 'INTERROMPIDA' && !String(state?.motivoInterrupcao ?? '').trim()) failures.push('INTERROMPIDA exige motivo registrado')
  if (String(state?.motivoInterrupcao ?? '').startsWith('INCIDENTE_DA_OPERACAO:')) {
    if (!incident || incident.status !== 'ABERTO' || state.status !== 'INTERROMPIDA') failures.push('incidente da operacao precisa interromper a rodada com registro aberto')
  }
  if (incident?.status === 'ABERTO' && state?.status !== 'INTERROMPIDA') failures.push('incidente aberto exige rodada interrompida')
  return failures
}

module.exports = { STATUSES, TRANSITIONS, validateKoraStateData }
