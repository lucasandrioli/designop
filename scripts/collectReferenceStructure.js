/*
 * Coletor de estrutura de referencias para executar DENTRO de use_figma.
 *
 * Uso:
 * return await collectReferenceStructure('<page-id>', '<section-id>', {
 *   part: 1,
 *   pageSize: 20,
 * })
 *
 * A arvore inteira e sempre lida dentro do Figma. A resposta e paginada
 * para que o agente consiga ler todos os nos sem depender de truncamento
 * do cliente. Leia parte 1, use `paginacao.totalPartes` e chame cada parte
 * restante antes de declarar a cobertura como completa.
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

  const nodeSummary = (node, path, parentId, localComposition = null) => {
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
      localCompositionId: localComposition?.id ?? null,
      localCompositionName: localComposition?.name ?? null,
    }
  }

  const nodes = []
  const detachedInstances = []
  const remoteInstances = []
  const localComponents = []
  const localComponentsWithIds = []
  const unboundVisualSignals = []
  const noAutoLayout = []
  const visit = (node, path, parentId = null, inheritedLocalComposition = null) => {
    const currentSummary = nodeSummary(node, path, parentId, inheritedLocalComposition)
    const isLocalComposition =
      ((node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') && node !== section) ||
      (node.type === 'INSTANCE' && currentSummary.mainComponentId && !currentSummary.mainComponentRemote)
    const localComposition = isLocalComposition
      ? { id: currentSummary.id, name: currentSummary.name }
      : inheritedLocalComposition
    const summary = isLocalComposition
      ? nodeSummary(node, path, parentId, inheritedLocalComposition)
      : currentSummary
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
      // Instancias remotas sao opacas. So Slots nativos confirmados podem ser lidos abaixo delas.
      const children = summary.mainComponentRemote
        ? node.children.filter((child) => child.type === 'SLOT')
        : node.children
      for (const child of children) visit(child, `${path}/${child.name}`, node.id, localComposition)
    }
  }

  visit(section, section.name)
  for (const local of localComponents) {
    const descendants = remoteInstances.filter((instance) => instance.localCompositionId === local.id)
    if (descendants.length > 0) {
      localComponentsWithIds.push({
        ...local,
        classificacaoObservada: 'COMPONENTE_LOCAL_COM_IDS',
        instanciasIDSDescendentes: descendants,
      })
    }
  }
  const screenNames = Array.isArray(opts.screenNames) ? new Set(opts.screenNames) : null
  const requestedPart = Number.isInteger(opts.part) ? opts.part : 1
  const pageSize = Number.isInteger(opts.pageSize) ? Math.min(Math.max(opts.pageSize, 1), 20) : 20
  const totalParts = Math.max(1, Math.ceil(nodes.length / pageSize))
  if (requestedPart < 1 || requestedPart > totalParts) {
    throw new Error(`Parte estrutural invalida: ${requestedPart}/${totalParts}`)
  }
  const start = (requestedPart - 1) * pageSize
  const nodesThisPart = nodes.slice(start, start + pageSize)
  const itemsPerPart = Array.from({ length: totalParts }, (_, index) =>
    Math.max(0, Math.min(pageSize, nodes.length - index * pageSize)),
  )
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
      mainComponentId: summary.mainComponentId,
      mainComponentRemote: summary.mainComponentRemote,
      localCompositionId: summary.localCompositionId,
      localCompositionName: summary.localCompositionName,
      classificacaoObservada: summary.classificacaoObservada ?? null,
      instanciasIDSDescendentes: Array.isArray(summary.instanciasIDSDescendentes)
        ? summary.instanciasIDSDescendentes.map(compact)
        : [],
  })
  const isScreen = (node) =>
    (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') &&
    node.id !== section.id &&
    (screenNames ? screenNames.has(node.name) : node.parentId === section.id)
  const inThisPart = (summaries) => {
    const ids = new Set(summaries.map((summary) => summary.id))
    return summaries.filter((summary) => ids.has(summary.id) && nodesThisPart.some((node) => node.id === summary.id)).map(compact)
  }

  return {
    paginacao: {
      parteAtual: requestedPart,
      totalPartes: totalParts,
      pageSize,
      totalItens: nodes.length,
      itensNestaParte: nodesThisPart.length,
      itensPorParte: itemsPerPart,
    },
    cobertura: {
      secao: section.name,
      nodeId: section.id,
      nodesInspecionados: nodes.length,
      coletor: 'scripts/collectReferenceStructure.js',
      status: totalParts === 1 ? 'COBERTA' : 'PARCIAL',
    },
    telas: nodesThisPart.filter(isScreen).map(compact),
    sinais: {
      totais: {
        detachedInstances: detachedInstances.length,
        remoteInstances: remoteInstances.length,
        localComponents: localComponents.length,
        componentesLocaisComIDS: localComponentsWithIds.length,
        propriedadesVisuaisComValorSemBindingObservado: unboundVisualSignals.length,
        noAutoLayout: noAutoLayout.length,
      },
      nestaParte: {
        detachedInstances: inThisPart(detachedInstances),
        remoteInstances: inThisPart(remoteInstances),
        localComponents: inThisPart(localComponents),
        componentesLocaisComIDS: inThisPart(localComponentsWithIds),
        propriedadesVisuaisComValorSemBindingObservado: inThisPart(unboundVisualSignals),
        noAutoLayout: inThisPart(noAutoLayout),
      },
    },
    nodes: nodesThisPart,
  }
}
