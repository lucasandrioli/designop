/* Validador do recibo posterior a promocao. */
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { validateValidatorVerdictData } = require('./validateValidatorVerdictCore')

function validDate(value) { return typeof value === 'string' && !Number.isNaN(Date.parse(value)) }
function validRound(value) { return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value) }
function validHash(value) { return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) }
function readJson(file, failures, label) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch (error) { failures.push(`${label} invalido: ${error.message}`); return null }
}

function validateArtifact(artifact, label, options, failures) {
  if (!artifact?.caminho || !validHash(artifact.sha256)) {
    failures.push(`${label} precisa ter caminho e sha256 valido`)
    return null
  }
  const prefix = `.designops/runs/${options.round}/`
  if (path.isAbsolute(artifact.caminho) || !artifact.caminho.startsWith(prefix)) {
    failures.push(`${label} precisa permanecer isolado na rodada atual`)
    return null
  }
  if (!options.repositoryRoot) return null
  const absolute = path.resolve(options.repositoryRoot, artifact.caminho)
  const relative = path.relative(options.repositoryRoot, absolute)
  if (relative === '..' || relative.startsWith('..' + path.sep) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    failures.push(`${label} nao encontrado na rodada atual`)
    return null
  }
  const actual = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')
  if (actual !== artifact.sha256) failures.push(`${label} diverge do sha256 registrado`)
  return absolute
}

function validatePromotionPackageData(data, options = {}) {
  const failures = []
  const round = options.round ?? data?.rodada
  if (data?.schemaVersion !== 1) failures.push('schemaVersion precisa ser 1')
  if (!validRound(data?.rodada) || (options.round && data.rodada !== options.round)) failures.push('pacote pertence a outra rodada ou possui rodada invalida')
  if (!validDate(data?.emitidoEm)) failures.push('emitidoEm invalido')
  const koraPath = validateArtifact(data?.aprovacaoKora, 'aprovacaoKora', { ...options, round }, failures)
  const verdictPath = validateArtifact(data?.veredito, 'veredito', { ...options, round }, failures)
  const promotionArtifact = validateArtifact(data?.validacaoPromocao?.artefato, 'validacaoPromocao.artefato', { ...options, round }, failures)
  if (data?.aprovacaoKora?.caminho !== `.designops/runs/${round}/aprovacao-promocao.json`) failures.push('aprovacaoKora precisa apontar para o comprovante imutavel de aprovacao da rodada atual')
  if (data?.veredito?.caminho !== `.designops/runs/${round}/veredito-validador.json`) failures.push('veredito precisa apontar para o recibo independente da rodada atual')
  if (data?.validacaoPromocao?.origem !== 'VALIDATE_PROMOTION' || data?.validacaoPromocao?.resultado !== 'FAVORAVEL' || !validDate(data?.validacaoPromocao?.executadaEm)) failures.push('validacaoPromocao precisa ser validatePromotion favoravel e datada')

  let state = null
  if (koraPath) {
    state = readJson(koraPath, failures, 'estado Kora')
    const approval = state?.aprovacoes?.promocao
    if (approval?.tipo !== 'PROMOCAO' || approval?.decisao !== 'APROVADA' || approval?.confirmadoPor !== 'DESIGNER' || !validDate(approval?.ocorreuEm)) failures.push('pacote exige aprovacao humana de promocao registrada pela Kora')
    if (!['APROVADA', 'CONCLUIDA'].includes(state?.checkpoints?.promocao?.status)) failures.push('aprovacao Kora nao esta no checkpoint de promocao aprovado')
  }
  let verdict = null
  if (verdictPath) {
    verdict = readJson(verdictPath, failures, 'veredito do Validador')
    failures.push(...validateValidatorVerdictData(verdict, { round, repositoryRoot: options.repositoryRoot }))
    if (verdict?.resultado !== 'APTO_PARA_PROMOCAO') failures.push('promocao exige veredito APTO_PARA_PROMOCAO')
  }
  if (promotionArtifact) {
    const report = readJson(promotionArtifact, failures, 'validacao de promocao')
    if (report?.passed !== true) failures.push('validacao de promocao nao possui passed favoravel')
  }

  const assets = data?.ativosPublicados
  const assetsByTemplate = new Map()
  if (!Array.isArray(assets) || assets.length === 0) {
    failures.push('ativosPublicados precisa conter ao menos um template')
  } else {
    const names = new Set()
    const forbidden = ['ctx-', ...(data.contextosProibidosNoNome ?? [])].map((term) => String(term).toLowerCase())
    for (const [index, asset] of assets.entries()) {
      if (!asset?.template || !/^[a-z0-9-]+\/[a-z0-9-]+\/tpl-[a-z0-9-]+$/.test(asset?.nome ?? '') || !['COMPONENT', 'COMPONENT_SET'].includes(asset?.tipo) || asset?.resultado !== 'FAVORAVEL') failures.push(`ativosPublicados[${index}] invalido`)
      if (names.has(asset?.nome)) failures.push(`ativo publicado duplicado: ${asset?.nome}`)
      names.add(asset?.nome)
      if (forbidden.some((term) => term && asset?.nome?.toLowerCase().includes(term))) failures.push(`ativo publicado carrega contexto no nome: ${asset?.nome}`)
      if (assetsByTemplate.has(asset?.template)) failures.push(`mais de um ativo publicado para o mesmo template: ${asset?.template}`)
      assetsByTemplate.set(asset?.template, asset)
    }
  }

  const rereads = data?.releiturasPosPromocao
  if (!Array.isArray(rereads) || rereads.length === 0) {
    failures.push('releiturasPosPromocao sao obrigatorias')
  } else {
    const seen = new Set()
    for (const [index, reread] of rereads.entries()) {
      if (!reread?.template || reread?.resultado !== 'FAVORAVEL' || !validDate(reread?.executadaEm)) failures.push(`releiturasPosPromocao[${index}] invalida`)
      if (seen.has(reread?.template)) failures.push(`releitura pos-promocao duplicada: ${reread?.template}`)
      seen.add(reread?.template)
      validateArtifact(reread?.artefato, `releiturasPosPromocao[${index}].artefato`, { ...options, round }, failures)
    }
    for (const template of assetsByTemplate.keys()) if (!seen.has(template)) failures.push(`ativo publicado sem releitura pos-promocao: ${template}`)
  }
  if (verdict) {
    const verdictTemplates = new Set((verdict.resultados ?? []).map((result) => result.template))
    for (const template of assetsByTemplate.keys()) if (!verdictTemplates.has(template)) failures.push(`ativo publicado ausente do veredito: ${template}`)
  }
  return failures
}

module.exports = { validatePromotionPackageData }
