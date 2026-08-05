/* Validador portatil do recibo independente do Validador. */
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const REQUIRED_LINKS = ['PACOTE_MONTAGEM', 'CONTRATO', 'RESOLUCAO', 'EVIDENCIAS_MCP', 'PRE_PROMOCAO']
const REQUIRED_CHECKS = ['CRIACAO', 'CONTEUDO', 'MODES', 'LAYOUT', 'PRE_PROMOCAO']

function validDate(value) { return typeof value === 'string' && !Number.isNaN(Date.parse(value)) }
function validRound(value) { return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value) }
function validHash(value) { return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) }

function validateArtifact(artifact, label, options, failures) {
  if (!artifact?.caminho || !validHash(artifact.sha256)) {
    failures.push(`${label} precisa ter caminho e sha256 valido`)
    return
  }
  const expectedPrefix = `.designops/runs/${options.round}/`
  if (!artifact.caminho.startsWith(expectedPrefix) || path.isAbsolute(artifact.caminho)) {
    failures.push(`${label} precisa permanecer isolado na rodada atual`)
    return
  }
  if (!options.repositoryRoot) return
  const absolute = path.resolve(options.repositoryRoot, artifact.caminho)
  const relative = path.relative(options.repositoryRoot, absolute)
  if (relative === '..' || relative.startsWith('..' + path.sep) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    failures.push(`${label} nao encontrado na rodada atual`)
    return
  }
  const actual = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')
  if (actual !== artifact.sha256) failures.push(`${label} diverge do sha256 registrado`)
}

function validateValidatorVerdictData(data, options = {}) {
  const failures = []
  const round = options.round ?? data?.rodada
  if (data?.schemaVersion !== 1) failures.push('schemaVersion precisa ser 1')
  if (!validRound(data?.rodada) || (options.round && data.rodada !== options.round)) failures.push('veredito pertence a outra rodada ou possui rodada invalida')
  if (!validDate(data?.emitidoEm)) failures.push('emitidoEm invalido')
  if (!['APTO_PARA_PROMOCAO', 'REPROVADO', 'NAO_VERIFICAVEL'].includes(data?.resultado)) failures.push('resultado do veredito invalido')

  const links = data?.artefatosVinculados
  if (!Array.isArray(links)) {
    failures.push('artefatosVinculados precisa ser lista')
  } else {
    const seen = new Set()
    for (const [index, artifact] of links.entries()) {
      if (!REQUIRED_LINKS.includes(artifact?.papel)) failures.push(`artefatosVinculados[${index}] possui papel invalido`)
      if (seen.has(artifact?.papel)) failures.push(`artefato vinculado duplicado: ${artifact?.papel}`)
      seen.add(artifact?.papel)
      validateArtifact(artifact, `artefatosVinculados[${index}]`, { ...options, round }, failures)
    }
    for (const role of REQUIRED_LINKS) if (!seen.has(role)) failures.push(`veredito sem artefato vinculado: ${role}`)
  }

  const resultIds = new Set()
  const resultPairs = new Set()
  if (!Array.isArray(data?.resultados) || data.resultados.length === 0) {
    failures.push('resultados por template e contexto sao obrigatorios')
  } else {
    for (const [index, result] of data.resultados.entries()) {
      if (!result?.id || !result?.template || !result?.contextoId || !['FAVORAVEL', 'REPROVADO', 'NAO_VERIFICAVEL'].includes(result?.resultado) || !['FAVORAVEL', 'REPROVADO', 'NAO_VERIFICAVEL'].includes(result?.revisaoVisual)) {
        failures.push(`resultados[${index}] invalido`)
        continue
      }
      if (resultIds.has(result.id)) failures.push(`resultado duplicado: ${result.id}`)
      resultIds.add(result.id)
      const pair = `${result.template}::${result.contextoId}`
      if (resultPairs.has(pair)) failures.push(`template/contexto duplicado: ${pair}`)
      resultPairs.add(pair)
    }
  }

  const checks = data?.verificacoes
  if (!Array.isArray(checks)) {
    failures.push('verificacoes precisa ser lista')
  } else {
    const seen = new Set()
    for (const [index, check] of checks.entries()) {
      if (!REQUIRED_CHECKS.includes(check?.tipo) && !['COMPOSICAO', 'RECONSTRUCAO', 'JORNADA', 'CANVAS'].includes(check?.tipo)) failures.push(`verificacoes[${index}] possui tipo invalido`)
      if (seen.has(check?.tipo)) failures.push(`verificacao duplicada: ${check?.tipo}`)
      seen.add(check?.tipo)
      if (!['FAVORAVEL', 'REPROVADO', 'NAO_VERIFICAVEL'].includes(check?.resultado) || !validDate(check?.executadaEm)) failures.push(`verificacoes[${index}] incompleta`)
      validateArtifact(check?.artefato, `verificacoes[${index}].artefato`, { ...options, round }, failures)
    }
    for (const type of REQUIRED_CHECKS) if (!seen.has(type)) failures.push(`veredito sem verificacao obrigatoria: ${type}`)
  }

  const rereads = data?.releiturasIndependentes
  if (!Array.isArray(rereads) || rereads.length < 2) {
    failures.push('veredito exige releituras independentes de estrutura e interacoes')
  } else {
    const seen = new Set()
    for (const [index, reread] of rereads.entries()) {
      if (!['ESTRUTURA', 'INTERACOES'].includes(reread?.tipo) || seen.has(reread?.tipo)) failures.push(`releiturasIndependentes[${index}] invalida ou duplicada`)
      seen.add(reread?.tipo)
      if (reread?.independenteDaMontagem !== true || !['FAVORAVEL', 'REPROVADO', 'NAO_VERIFICAVEL'].includes(reread?.resultado) || !validDate(reread?.executadaEm)) failures.push(`releiturasIndependentes[${index}] sem independencia comprovada`)
      validateArtifact(reread?.artefato, `releiturasIndependentes[${index}].artefato`, { ...options, round }, failures)
    }
    for (const type of ['ESTRUTURA', 'INTERACOES']) if (!seen.has(type)) failures.push(`veredito sem releitura independente: ${type}`)
  }

  if (!data?.revisaoVisual || !['FAVORAVEL', 'REPROVADO', 'NAO_VERIFICAVEL'].includes(data.revisaoVisual.resultado) || !validDate(data.revisaoVisual.executadaEm)) failures.push('revisao visual invalida')
  validateArtifact(data?.revisaoVisual?.artefato, 'revisaoVisual.artefato', { ...options, round }, failures)
  if (!data?.prePromocao || !['FAVORAVEL', 'REPROVADO', 'NAO_VERIFICAVEL'].includes(data.prePromocao.resultado) || !validDate(data.prePromocao.executadaEm)) failures.push('prePromocao invalida')
  validateArtifact(data?.prePromocao?.artefato, 'prePromocao.artefato', { ...options, round }, failures)

  if (data?.resultado === 'APTO_PARA_PROMOCAO') {
    if ((data.resultados ?? []).some((result) => result?.resultado !== 'FAVORAVEL' || result?.revisaoVisual !== 'FAVORAVEL')) failures.push('APTO_PARA_PROMOCAO exige todos os templates e contextos favoraveis, inclusive revisao visual')
    if ((data.verificacoes ?? []).some((check) => check?.resultado !== 'FAVORAVEL')) failures.push('APTO_PARA_PROMOCAO exige todas as verificacoes favoraveis')
    if ((data.releiturasIndependentes ?? []).some((reread) => reread?.resultado !== 'FAVORAVEL')) failures.push('APTO_PARA_PROMOCAO exige todas as releituras independentes favoraveis')
    if (data.revisaoVisual?.resultado !== 'FAVORAVEL') failures.push('APTO_PARA_PROMOCAO exige revisao visual favoravel')
    if (data.prePromocao?.resultado !== 'FAVORAVEL') failures.push('APTO_PARA_PROMOCAO exige pre-promocao favoravel')
  }
  return failures
}

module.exports = { REQUIRED_CHECKS, REQUIRED_LINKS, validateValidatorVerdictData }
