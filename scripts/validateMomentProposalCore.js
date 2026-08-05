function validateVariationMatrixData(matrix, scope, options = {}) {
  const failures = []
  if (!matrix || matrix.schemaVersion !== 1 || matrix.rodada !== options.round || !Array.isArray(matrix.variacoes)) failures.push('matriz de variacoes invalida')
  const allowedModalities = new Set(scope?.modalidades ?? [])
  const allowedSurfaces = new Set((scope?.telas ?? []).map((item) => item.id))
  const seen = new Set()
  for (const item of (matrix?.variacoes ?? [])) {
    if (!allowedModalities.has(item?.modalidade) || !allowedSurfaces.has(item?.tela) || !item?.contextoId || !['CONTEUDO', 'ESTRUTURA', 'COMPORTAMENTO', 'SEM_DIFERENCA'].includes(item?.classificacao) || !item?.evidencia) failures.push('variacao invalida ou fora do escopo')
    const key = [item?.modalidade, item?.tela, item?.contextoId, item?.id ?? ''].join('::')
    if (seen.has(key)) failures.push('variacao duplicada no mesmo contexto')
    seen.add(key)
    if (item?.classificacao === 'ESTRUTURA' && item?.tratamento === 'VARIAVEL') failures.push('diferenca estrutural nao pode ser tratada como variavel')
  }
  return failures
}

function validateMomentContractData(contract, scope, options = {}) {
  const failures = []
  if (!contract || contract.schemaVersion !== 1 || contract.rodada !== options.round || contract.etapa !== scope?.etapa || contract.momento !== scope?.momento) failures.push('contrato de momento invalido ou fora do escopo')
  const modalities = new Set(scope?.modalidades ?? [])
  const surfaces = new Set((scope?.telas ?? []).map((item) => item.id))
  if (!Array.isArray(contract?.modalidades) || contract.modalidades.length !== modalities.size || contract.modalidades.some((item) => !modalities.has(item))) failures.push('contrato de momento mistura modalidades')
  if (!Array.isArray(contract?.telas) || contract.telas.length !== surfaces.size || contract.telas.some((item) => !surfaces.has(item?.id))) failures.push('contrato de momento nao respeita telas declaradas')
  const covered = new Set()
  for (const item of (contract?.cobertura ?? [])) {
    if (!modalities.has(item?.modalidade) || !surfaces.has(item?.tela) || !item?.contextoId || !['PRESENTE', 'AUSENTE_OBSERVADA', 'NAO_VERIFICAVEL'].includes(item?.status) || !item?.evidencia) failures.push('cobertura de momento invalida')
    covered.add([item?.modalidade, item?.tela, item?.contextoId].join('::'))
  }
  const contextsByModalidade = new Map()
  for (const item of (contract?.cobertura ?? [])) {
    if (!modalities.has(item?.modalidade) || !item?.contextoId) continue
    if (!contextsByModalidade.has(item.modalidade)) contextsByModalidade.set(item.modalidade, new Set())
    contextsByModalidade.get(item.modalidade).add(item.contextoId)
  }
  for (const [modalidade, contextos] of contextsByModalidade) for (const contextoId of contextos) for (const tela of surfaces) {
    if (!covered.has([modalidade, tela, contextoId].join('::'))) failures.push(`tela declarada sem cobertura: ${modalidade}::${tela}::${contextoId}`)
  }
  if ((contract?.cobertura ?? []).some((item) => item?.status === 'NAO_VERIFICAVEL')) failures.push('contrato de momento possui cobertura nao verificavel')
  for (const connection of (contract?.conexoes ?? [])) if (!modalities.has(connection?.modalidade) || !surfaces.has(connection?.origem) || !surfaces.has(connection?.destino) || !connection?.evidencia) failures.push('conexao de momento invalida')
  return failures
}

if (typeof module !== 'undefined') module.exports = { validateVariationMatrixData, validateMomentContractData }
