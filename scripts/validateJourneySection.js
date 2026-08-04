/**
 * validateJourneySection
 *
 * Prova o consumo de uma modalidade em uma Section. Esta validacao nao
 * promove templates isolados: ela verifica uma jornada que ja declara quais
 * instancias, bindings e herancas de mode devem existir.
 */
async function validateJourneySection(sectionId, opts = {}) {
  const required = ['contentCollectionId', 'modeId', 'selection']
  for (const field of required) {
    if (!opts[field]) throw new Error(field + ' e obrigatorio')
  }
  if (!Array.isArray(opts.knownContentCollectionIds) || opts.knownContentCollectionIds.length === 0) {
    throw new Error('knownContentCollectionIds precisa listar as collections de conteudo conhecidas')
  }
  if (!Array.isArray(opts.templates) || opts.templates.length === 0) {
    throw new Error('templates precisa listar instancias esperadas da jornada')
  }
  if (!opts.selection || typeof opts.selection !== 'object' || !opts.selection.contextId) {
    throw new Error('selection precisa declarar contextoId e templates presentes/ausentes da jornada')
  }
  if (!Array.isArray(opts.selection.presentTemplateIds) || !Array.isArray(opts.selection.absentTemplateIds)) {
    throw new Error('selection precisa declarar presentTemplateIds e absentTemplateIds')
  }
  if (!opts.knownContentCollectionIds.includes(opts.contentCollectionId)) {
    throw new Error('contentCollectionId precisa constar em knownContentCollectionIds')
  }

  const section = await figma.getNodeByIdAsync(sectionId)
  if (!section || section.type !== 'SECTION') throw new Error('Section de jornada nao encontrada')

  const report = {
    sectionId: section.id,
    sectionName: section.name,
    collectionIssues: [],
    modeIssues: [],
    descendantModeIssues: [],
    templateIssues: [],
    bindingIssues: [],
    unexpectedContentBindings: [],
    selectionIssues: [],
    absentTemplateIssues: [],
    passed: false,
  }
  const known = new Set(opts.knownContentCollectionIds)
  const descendants = section.findAll(() => true)
  const nodes = [section, ...descendants]
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const instances = descendants.filter((node) => node.type === 'INSTANCE')

  const expectedMode = section.explicitVariableModes?.[opts.contentCollectionId]
  if (expectedMode !== opts.modeId) {
    report.modeIssues.push({
      expected: opts.modeId,
      actual: expectedMode ?? null,
      reason: 'Section precisa fixar somente o mode esperado da collection de conteudo',
    })
  }
  for (const collectionId of known) {
    if (collectionId === opts.contentCollectionId) continue
    if (section.explicitVariableModes?.[collectionId]) {
      report.collectionIssues.push({ collectionId, reason: 'Section fixa outra collection de conteudo' })
    }
  }
  for (const node of descendants) {
    for (const collectionId of known) {
      const modeId = node.explicitVariableModes?.[collectionId]
      if (modeId) report.descendantModeIssues.push({ id: node.id, name: node.name, collectionId, modeId })
    }
  }

  const collectAliases = (value, ids) => {
    if (!value || typeof value !== 'object') return
    if (value.type === 'VARIABLE_ALIAS' && value.id) {
      ids.add(value.id)
      return
    }
    for (const child of Object.values(value)) collectAliases(child, ids)
  }
  const variableCollectionById = new Map()
  const resolveAliases = async (nodesToInspect) => {
    const aliases = new Set()
    for (const node of nodesToInspect.filter(Boolean)) {
      collectAliases(node.boundVariables, aliases)
      collectAliases(node.componentProperties, aliases)
      collectAliases(node.componentPropertyDefinitions, aliases)
    }
    for (const variableId of aliases) {
      if (variableCollectionById.has(variableId)) continue
      const variable = await figma.variables.getVariableByIdAsync(variableId)
      variableCollectionById.set(variableId, variable?.variableCollectionId ?? null)
    }
    return aliases
  }

  const sectionAliases = await resolveAliases(nodes)
  for (const variableId of sectionAliases) {
    const collectionId = variableCollectionById.get(variableId)
    if (collectionId && known.has(collectionId) && collectionId !== opts.contentCollectionId) {
      report.unexpectedContentBindings.push({ variableId, collectionId })
    }
  }

  for (const [index, expected] of opts.templates.entries()) {
    if (!expected?.instanceId || !expected?.templateId) {
      report.templateIssues.push({ index, reason: 'template esperado precisa ter instanceId e templateId' })
      continue
    }
    const hasVariables = Array.isArray(expected.expectedContentVariableIds) && expected.expectedContentVariableIds.length > 0
    const hasRoles = Array.isArray(expected.expectedContentRoles) && expected.expectedContentRoles.length > 0
    if (!hasVariables && !hasRoles) {
      report.bindingIssues.push({ index, instanceId: expected.instanceId, reason: 'template esperado precisa declarar papeis ou variaveis de conteudo' })
    }
    const instance = nodeById.get(expected.instanceId)
    if (!instance) {
      report.templateIssues.push({ index, instanceId: expected.instanceId, reason: 'instancia esperada nao esta dentro da Section' })
      continue
    }
    if (instance.type !== 'INSTANCE') {
      report.templateIssues.push({ index, instanceId: instance.id, reason: 'no esperado precisa ser INSTANCE' })
      continue
    }
    const mainComponent = instance.mainComponent ?? await instance.getMainComponentAsync?.()
    if (!mainComponent || mainComponent.id !== expected.templateId) {
      report.templateIssues.push({
        index,
        instanceId: instance.id,
        expectedTemplateId: expected.templateId,
        actualTemplateId: mainComponent?.id ?? null,
        reason: 'instancia nao resolve para o template previsto',
      })
      continue
    }
    const aliases = await resolveAliases([instance, mainComponent])
    const expectedCollectionAliases = [...aliases].filter((id) => variableCollectionById.get(id) === opts.contentCollectionId)
    if (expectedCollectionAliases.length === 0) {
      report.bindingIssues.push({ index, instanceId: instance.id, reason: 'template nao possui binding da collection de conteudo esperada' })
    }
    if (hasVariables) {
      for (const variableId of expected.expectedContentVariableIds) {
        if (!aliases.has(variableId) || variableCollectionById.get(variableId) !== opts.contentCollectionId) {
          report.bindingIssues.push({ index, instanceId: instance.id, variableId, reason: 'binding de conteudo esperado nao encontrado no template' })
        }
      }
    }
    for (const variableId of aliases) {
      const collectionId = variableCollectionById.get(variableId)
      if (collectionId && known.has(collectionId) && collectionId !== opts.contentCollectionId) {
        report.unexpectedContentBindings.push({ instanceId: instance.id, variableId, collectionId })
      }
    }
  }

  const presentTemplateIds = new Set(opts.selection.presentTemplateIds)
  const absentTemplateIds = new Set(opts.selection.absentTemplateIds)
  if (presentTemplateIds.size !== opts.selection.presentTemplateIds.length || absentTemplateIds.size !== opts.selection.absentTemplateIds.length) {
    report.selectionIssues.push({ reason: 'selection nao pode repetir templateIds' })
  }
  for (const templateId of presentTemplateIds) {
    if (absentTemplateIds.has(templateId)) report.selectionIssues.push({ templateId, reason: 'template nao pode estar presente e ausente no mesmo contexto' })
    if (!opts.templates.some((template) => template.templateId === templateId)) {
      report.selectionIssues.push({ templateId, reason: 'template presente nao foi declarado como instancia esperada' })
    }
    let found = false
    for (const instance of instances) {
      const main = instance.mainComponent ?? await instance.getMainComponentAsync?.()
      if (main?.id === templateId) {
        found = true
        break
      }
    }
    if (!found) report.selectionIssues.push({ templateId, reason: 'template declarado presente nao foi encontrado na Section' })
  }
  for (const instance of instances) {
    const main = instance.mainComponent ?? await instance.getMainComponentAsync?.()
    if (!main || !absentTemplateIds.has(main.id)) continue
    report.absentTemplateIssues.push({
      instanceId: instance.id,
      templateId: main.id,
      visible: instance.visible !== false,
      reason: instance.visible === false
        ? 'tela ausente foi escondida na Section; ausencia pertence ao mapa, nao a visibilidade'
        : 'tela ausente pelo mapa esta presente na Section',
    })
  }

  report.passed =
    report.collectionIssues.length === 0 &&
    report.modeIssues.length === 0 &&
    report.descendantModeIssues.length === 0 &&
    report.templateIssues.length === 0 &&
    report.bindingIssues.length === 0 &&
    report.unexpectedContentBindings.length === 0
    && report.selectionIssues.length === 0
    && report.absentTemplateIssues.length === 0
  return report
}
