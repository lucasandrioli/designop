/**
 * validatePromotion
 *
 * Portao final entre um COMPONENT de rascunho e um template publicado.
 * O Montador chama esta funcao somente depois de o Validador devolver
 * APTO PARA PROMOCAO. Ela nao renomeia nada: apenas torna explicita a
 * evidencia que precisa existir antes de `_rascunho-*` virar `tpl-*`.
 *
 * Uso via use_figma: cole a funcao inteira e chame, por exemplo:
 *
 * return await validatePromotion('12:34', {
 *   contentCollectionId: 'VariableCollectionId:conteudo',
 *   roundId: 'rodada-atual',
 *   referenceIds: ['12:1', '12:2'],
 *   evidence: {
 *     creationPassed: true,
 *     contentContractPassed: true,
 *     compositionContractPassed: true,
 *     typographyContractPassed: true,
 *     modeBehaviorPassed: true,
 *     reconstructionContractPassed: true,
 *     layoutPassed: true,
 *     visualReviewPassed: true,
 *     roundPassed: true,
 *     validatorVerdict: 'APTO PARA PROMOCAO',
 *     mcpReports: { composition: <relatorio literal>, typography: <relatorio literal> },
 *   },
 * })
 *
 * Os campos de evidence vem dos relatorios reais desta conversa.
 * Passar `true` sem ter rodado a prova e quebra de processo, nao uma
 * forma de contornar o portao.
 */
async function validatePromotion(candidateId, opts = {}) {
  const report = {
    candidateId,
    candidateName: null,
    missing: [],
    referenceIssues: [],
    conventionIssues: [],
    bindingIssues: [],
    modeIssues: [],
    evidenceIssues: [],
    passed: false,
  }

  const candidate = await figma.getNodeByIdAsync(candidateId)
  if (!candidate) {
    report.missing.push({ id: candidateId, reason: 'rascunho nao encontrado' })
    return report
  }
  report.candidateName = candidate.name

  const reportMcp = (name, literal, requireTargets) => {
    if (!literal || literal.roundId !== opts.roundId || literal.templateId !== candidateId || literal.passed !== true || literal.verificationStatus !== 'APROVADO') {
      report.evidenceIssues.push({ key: `mcpReports.${name}`, reason: 'relatorio MCP literal ausente, reprovado ou fora da rodada/candidato atual' })
      return
    }
    const results = name === 'composition' ? literal.slotResults : literal.targetResults
    if (!Array.isArray(results) || (requireTargets && results.length === 0)) {
      report.evidenceIssues.push({ key: `mcpReports.${name}`, reason: 'relatorio MCP nao traz os resultados exigidos' })
      return
    }
    for (const item of results) {
      const ids = name === 'composition'
        ? [item?.hostInstanceId, item?.slotNodeId, ...(item?.contentNodeIds ?? [])]
        : item?.targetNodeIds ?? []
      if (item?.passed !== true || ids.length === 0 || ids.some((id) => typeof id !== 'string' || !id)) {
        report.evidenceIssues.push({ key: `mcpReports.${name}`, reason: 'relatorio MCP nao vincula resultado aprovado aos IDs verificados' })
        return
      }
      if (name === 'composition' && (item.componentPropertyType !== 'SLOT' || !item.componentPropertyKey || !Array.isArray(item.limitViolations) || item.limitViolations.length > 0)) {
        report.evidenceIssues.push({ key: 'mcpReports.composition', reason: 'relatorio MCP de Slot nao confirma property SLOT ou limitViolations vazio' })
        return
      }
    }
  }
  if (typeof opts.roundId !== 'string' || !opts.roundId) {
    report.evidenceIssues.push({ key: 'roundId', reason: 'promocao exige roundId atual' })
  }
  reportMcp('composition', opts.evidence?.mcpReports?.composition, false)
  if (opts.evidence?.typographyRequired !== false) reportMcp('typography', opts.evidence?.mcpReports?.typography, true)

  if (candidate.type !== 'COMPONENT' && candidate.type !== 'COMPONENT_SET') {
    report.conventionIssues.push({
      id: candidate.id,
      reason: 'rascunho precisa ser COMPONENT ou COMPONENT_SET antes da promocao',
    })
  }
  if (!candidate.name.startsWith('_rascunho-')) {
    report.conventionIssues.push({
      id: candidate.id,
      reason: 'promocao so aceita objeto nomeado _rascunho-<modalidade>-<etapa>-<nome>',
    })
  }

  const localNodes = []
  const walkLocal = (node) => {
    localNodes.push(node)
    // A property da instancia e segura para leitura. Seus filhos podem
    // ser remotos ou stale e nao pertencem a arvore editavel do template.
    if (node.type === 'INSTANCE') return
    if ('children' in node) {
      for (const child of node.children) walkLocal(child)
    }
  }
  walkLocal(candidate)

  const contentVariableIds = new Set()
  if (typeof opts.contentCollectionId !== 'string' || !opts.contentCollectionId) {
    report.bindingIssues.push({ reason: 'contentCollectionId e obrigatorio' })
  } else {
    const variables = await figma.variables.getLocalVariablesAsync()
    for (const variable of variables) {
      if (variable.variableCollectionId === opts.contentCollectionId) {
        contentVariableIds.add(variable.id)
      }
    }
    if (contentVariableIds.size === 0) {
      report.bindingIssues.push({
        reason: 'collection de conteudo nao possui variaveis locais para provar bindings',
      })
    }
  }

  const aliasesIn = (value, ids = new Set()) => {
    if (!value || typeof value !== 'object') return ids
    if (value.type === 'VARIABLE_ALIAS' && typeof value.id === 'string') {
      ids.add(value.id)
      return ids
    }
    for (const child of Object.values(value)) aliasesIn(child, ids)
    return ids
  }

  // Component property definitions vivem no set para componentes variantes.
  // A leitura direta no filho variante causa erro na Plugin API.
  const componentPropertyDefinitionsOf = (node) => {
    if (node?.type === 'COMPONENT_SET') return node.componentPropertyDefinitions
    if (node?.type === 'COMPONENT' && node.parent?.type !== 'COMPONENT_SET') {
      return node.componentPropertyDefinitions
    }
    if (node?.type === 'COMPONENT' && node.parent?.type === 'COMPONENT_SET') {
      return node.parent.componentPropertyDefinitions
    }
    return null
  }

  const hasContentAlias = (node) => {
    const candidates = [
      node.boundVariables,
      node.componentProperties,
      componentPropertyDefinitionsOf(node),
    ]
    return candidates.some((value) =>
      [...aliasesIn(value)].some((id) => contentVariableIds.has(id)),
    )
  }

  if (contentVariableIds.size > 0 && !localNodes.some(hasContentAlias)) {
    report.bindingIssues.push({
      reason: 'rascunho nao tem binding real da collection de conteudo',
    })
  }

  if (opts.contentCollectionId) {
    for (const node of localNodes) {
      const modeId = node.explicitVariableModes?.[opts.contentCollectionId]
      if (modeId) {
        report.modeIssues.push({
          id: node.id,
          name: node.name,
          modeId,
          reason: 'mode explicito de conteudo no rascunho ou em descendente local',
        })
      }
    }
  }

  if (!Array.isArray(opts.referenceIds) || opts.referenceIds.length === 0) {
    report.referenceIssues.push({ reason: 'referenceIds precisa listar as referencias cruas comparadas' })
  } else {
    for (const referenceId of opts.referenceIds) {
      const reference = await figma.getNodeByIdAsync(referenceId)
      if (!reference) {
        report.referenceIssues.push({ id: referenceId, reason: 'referencia crua nao encontrada' })
        continue
      }
      if (!reference.name.startsWith('ref-')) {
        report.referenceIssues.push({
          id: reference.id,
          name: reference.name,
          reason: 'referencia precisa manter o prefixo ref-',
        })
      }
      if (reference.type === 'COMPONENT' || reference.type === 'COMPONENT_SET') {
        report.referenceIssues.push({
          id: reference.id,
          name: reference.name,
          reason: 'referencia crua nao pode ser COMPONENT ou COMPONENT_SET',
        })
      }
    }
  }

  const requiredEvidence = [
    'creationPassed',
    'contentContractPassed',
    'compositionContractPassed',
    'typographyContractPassed',
    'modeBehaviorPassed',
    'reconstructionContractPassed',
    'layoutPassed',
    'visualReviewPassed',
    'roundPassed',
  ]
  for (const key of requiredEvidence) {
    if (opts.evidence?.[key] !== true) {
      report.evidenceIssues.push({
        key,
        reason: 'evidencia ausente ou reprovada pelo Validador',
      })
    }
  }
  if (opts.evidence?.validatorVerdict !== 'APTO PARA PROMOCAO') {
    report.evidenceIssues.push({
      key: 'validatorVerdict',
      reason: 'promocao exige veredito APTO PARA PROMOCAO do Validador',
    })
  }

  report.passed =
    report.missing.length === 0 &&
    report.referenceIssues.length === 0 &&
    report.conventionIssues.length === 0 &&
    report.bindingIssues.length === 0 &&
    report.modeIssues.length === 0 &&
    report.evidenceIssues.length === 0

  return report
}
