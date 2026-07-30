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
 *   referenceIds: ['12:1', '12:2'],
 *   evidence: {
 *     creationPassed: true,
 *     contentContractPassed: true,
 *     modeBehaviorPassed: true,
 *     reconstructionContractPassed: true,
 *     layoutPassed: true,
 *     visualReviewPassed: true,
 *   },
 * })
 *
 * Os cinco campos de evidence vem dos relatorios reais desta conversa.
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

  if (candidate.type !== 'COMPONENT' && candidate.type !== 'COMPONENT_SET') {
    report.conventionIssues.push({
      id: candidate.id,
      reason: 'rascunho precisa ser COMPONENT ou COMPONENT_SET antes da promocao',
    })
  }
  if (!candidate.name.startsWith('_rascunho-')) {
    report.conventionIssues.push({
      id: candidate.id,
      reason: 'promocao so aceita objeto nomeado _rascunho-<etapa>-<nome>',
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

  const hasContentAlias = (node) => {
    const candidates = [
      node.boundVariables,
      node.componentProperties,
      node.componentPropertyDefinitions,
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
    'modeBehaviorPassed',
    'reconstructionContractPassed',
    'layoutPassed',
    'visualReviewPassed',
  ]
  for (const key of requiredEvidence) {
    if (opts.evidence?.[key] !== true) {
      report.evidenceIssues.push({
        key,
        reason: 'evidencia ausente ou reprovada pelo Validador',
      })
    }
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
