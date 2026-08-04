/*
 * Coletor de estrutura de referencias para executar DENTRO de use_figma.
 *
 * Uso:
 * return await collectReferenceStructure('<page-id>', '<section-id>')
 *
 * Para respostas que poderiam truncar no cliente:
 * return await collectReferenceStructure('<page-id>', '<section-id>', {
 *   summaryOnly: true,
 * })
 *
 * Ele descreve fatos tecnicos da referencia sem concluir se um valor manual,
 * componente local ou instancia destacada e uma regra de negocio.
 */
async function collectReferenceStructure(pageId, sectionId, opts = {}) {
  const page = figma.root.children.find((candidate) => candidate.id === pageId)
  if (!page) throw new Error(`Pagina invalida: ${pageId}`)
  await figma.setCurrentPageAsync(page)

  const section = page.findOne((node) => node.id === sectionId)
  if (!section || section.type !== 'SECTION') {
    throw new Error(`Section de referencia invalida: ${sectionId}`)
  }

  const nodeSummary = (node, path, parentId) => {
    const boundKeys = Object.keys(node.boundVariables ?? {})
    const unboundVisualFields = []
    const visualFields = ['fills', 'strokes', 'cornerRadius', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing']
    for (const field of visualFields) {
      if (!(field in node)) continue
      if (!boundKeys.includes(field) && node[field] !== undefined && node[field] !== null) unboundVisualFields.push(field)
    }
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      parentId,
      path,
      visible: node.visible !== false,
      layoutMode: 'layoutMode' in node ? node.layoutMode : null,
      layoutPositioning: 'layoutPositioning' in node ? node.layoutPositioning : null,
      box: node.absoluteBoundingBox ?? null,
      boundVariableFields: boundKeys,
      unboundVisualFields,
      mainComponentKey: node.type === 'INSTANCE' ? node.mainComponent?.key ?? null : null,
      mainComponentId: node.type === 'INSTANCE' ? node.mainComponent?.id ?? null : null,
      mainComponentRemote: node.type === 'INSTANCE' ? node.mainComponent?.remote === true : false,
      detached: Boolean(node.detachedInfo),
      detachedInfo: node.detachedInfo ?? null,
    }
  }

  const nodes = []
  const detachedInstances = []
  const remoteInstances = []
  const localComponents = []
  const unboundVisualSignals = []
  const noAutoLayout = []
  const visit = (node, path, parentId = null) => {
    const summary = nodeSummary(node, path, parentId)
    nodes.push(summary)
    if (summary.detached) detachedInstances.push(summary)
    if (node.type === 'INSTANCE' && summary.mainComponentRemote) remoteInstances.push(summary)
    if (
      ((node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') && node !== section) ||
      (node.type === 'INSTANCE' && summary.mainComponentId && !summary.mainComponentRemote)
    ) localComponents.push(summary)
    if (summary.unboundVisualFields.length > 0) unboundVisualSignals.push(summary)
    if ('children' in node) {
      const visibleChildren = node.children.filter((child) => child.visible !== false)
      if ((node.type === 'FRAME' || node.type === 'COMPONENT') && node.layoutMode === 'NONE' && visibleChildren.length >= 2) {
        noAutoLayout.push(summary)
      }
      for (const child of node.children) visit(child, `${path}/${child.name}`, node.id)
    }
  }

  visit(section, section.name)
  const screenNames = Array.isArray(opts.screenNames) ? new Set(opts.screenNames) : null
  const summaryOnly = opts.summaryOnly === true
  const compact = (summary) => ({
    id: summary.id,
    name: summary.name,
    type: summary.type,
    parentId: summary.parentId,
    path: summary.path,
    layoutMode: summary.layoutMode,
    box: summary.box,
    boundVariableFields: summary.boundVariableFields,
    detached: summary.detached,
    detachedInfo: summary.detachedInfo,
    mainComponentKey: summary.mainComponentKey,
    mainComponentRemote: summary.mainComponentRemote,
  })
  const screens = nodes.filter((node) =>
    (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') &&
    node.id !== section.id &&
    (screenNames ? screenNames.has(node.name) : node.parentId === section.id),
  )

  return {
    cobertura: {
      secao: section.name,
      nodeId: section.id,
      nodesInspecionados: nodes.length,
      coletor: 'scripts/collectReferenceStructure.js',
      status: 'COBERTA',
    },
    telas: summaryOnly ? screens.map(compact) : screens,
    sinais: {
      detachedInstances: summaryOnly ? detachedInstances.map(compact) : detachedInstances,
      remoteInstances: summaryOnly ? remoteInstances.map(compact) : remoteInstances,
      localComponents: summaryOnly ? localComponents.map(compact) : localComponents,
      unboundVisualSignals: summaryOnly ? [] : unboundVisualSignals,
      unboundVisualSignalCount: unboundVisualSignals.length,
      noAutoLayout: summaryOnly ? noAutoLayout.map(compact) : noAutoLayout,
    },
    nodes: summaryOnly ? [] : nodes,
  }
}
