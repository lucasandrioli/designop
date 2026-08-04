/*
 * Prova a origem de cada composicao de um template. Executar dentro de
 * use_figma depois de validar o contrato aprovado.
 */
async function validateCompositionContract(templateId, contract = {}) {
  const template = await figma.getNodeByIdAsync(templateId)
  const report = {
    roundId: contract.roundId ?? null,
    templateId,
    templateName: template?.name ?? null,
    contractIssues: [],
    sourceIssues: [],
    detachedIssues: [],
    unmappedInstances: [],
    slotResults: [],
    notVerifiable: [],
    verificationStatus: 'REPROVADO',
    passed: false,
  }
  if (!template) {
    report.contractIssues.push({ reason: 'template nao encontrado' })
    return report
  }
  if (!Array.isArray(contract.roles) || contract.roles.length === 0) {
    report.contractIssues.push({ reason: 'roles precisa declarar a fonte de cada composicao relevante' })
    return report
  }

  const descendants = [template, ...('children' in template ? template.findAll(() => true) : [])]
  const localTree = []
  const walk = (node) => {
    localTree.push(node)
    if (node.type === 'INSTANCE') return
    if ('children' in node) for (const child of node.children) walk(child)
  }
  walk(template)
  const approvedLocals = new Map()
  for (const local of contract.approvedLocalComponents ?? []) {
    if (!local?.id) {
      report.contractIssues.push({ reason: 'approvedLocalComponents possui item sem id' })
      continue
    }
    if (local.reuseEvidencePassed !== true || local.approved !== true) {
      report.contractIssues.push({ id: local.id, reason: 'componente local precisa ter aprovacao e reutilizacao comprovadas' })
    }
    approvedLocals.set(local.id, local)
  }
  const resolve = (selector) => {
    if (!selector || typeof selector !== 'object') return { error: 'selector ausente' }
    if (selector.root === true) return { node: template }
    if (!selector.nodeName) return { error: 'selector precisa de root:true ou nodeName' }
    const matches = localTree.filter((node) => node.name === selector.nodeName)
    if (matches.length !== 1) return { error: matches.length === 0 ? `no ${selector.nodeName} ausente` : `no ${selector.nodeName} ambiguo` }
    return { node: matches[0] }
  }
  const descendantsOf = (node) => {
    const result = [node]
    const visit = (candidate) => {
      if (!('children' in candidate)) return
      for (const child of candidate.children) {
        result.push(child)
        visit(child)
      }
    }
    visit(node)
    return result
  }
  const publicDefinitionsOf = async (instance) => {
    const main = instance.mainComponent ?? await instance.getMainComponentAsync?.()
    if (!main) return { main: null, definitions: null }
    const owner = main.parent?.type === 'COMPONENT_SET' ? main.parent : main
    return { main, definitions: owner.componentPropertyDefinitions ?? null }
  }
  const underInternalArea = (node) => {
    let current = node
    while (current) {
      if (current.name === '_componentes-locais') return true
      current = current.parent
    }
    return false
  }
  const claimedInstances = new Set()
  const claimedNodes = new Set()
  const slotContentRoleIds = new Set((contract.slots ?? []).flatMap((slot) => slot?.contentRoleIds ?? []))

  for (const role of contract.roles) {
    if (!role?.id || !['IDS', 'COMPONENTE_LOCAL', 'LOCAL_LAYOUT', 'TEXTO', 'ASSET'].includes(role.source)) {
      report.contractIssues.push({ role: role?.id ?? null, reason: 'papel precisa de id e source valido' })
      continue
    }
    const result = resolve(role.target)
    if (result.error) {
      if (slotContentRoleIds.has(role.id)) continue
      report.sourceIssues.push({ role: role.id, reason: result.error })
      continue
    }
    const node = result.node
    claimedNodes.add(node.id)
    if (node.detachedInfo) report.detachedIssues.push({ role: role.id, id: node.id, name: node.name })

    if (role.source === 'IDS') {
      if (node.type !== 'INSTANCE') {
        report.sourceIssues.push({ role: role.id, id: node.id, reason: 'papel IDS precisa ser INSTANCE remota' })
      } else {
        claimedInstances.add(node.id)
        const main = node.mainComponent ?? await node.getMainComponentAsync?.()
        const key = main?.key ?? null
        if (!key) report.sourceIssues.push({ role: role.id, id: node.id, reason: 'instancia IDS sem mainComponent.key' })
        else if (main.remote !== true) report.sourceIssues.push({ role: role.id, id: node.id, reason: 'papel IDS precisa resolver para componente remoto publicado' })
        else if (role.componentKey && key !== role.componentKey) report.sourceIssues.push({ role: role.id, id: node.id, expected: role.componentKey, actual: key, reason: 'key IDS diverge do contrato' })
      }
    }
    if (role.source === 'COMPONENTE_LOCAL') {
      if (node.type !== 'INSTANCE') {
        report.sourceIssues.push({ role: role.id, id: node.id, reason: 'componente local precisa ser consumido como INSTANCE' })
      } else {
        claimedInstances.add(node.id)
        const main = node.mainComponent ?? await node.getMainComponentAsync?.()
        const local = main ? approvedLocals.get(main.id) : null
        if (!main || !local) {
          report.sourceIssues.push({ role: role.id, id: node.id, reason: 'instancia nao resolve para componente local aprovado' })
        } else if (!underInternalArea(main)) {
          report.sourceIssues.push({ role: role.id, id: node.id, reason: 'componente local aprovado precisa estar sob _componentes-locais' })
        }
      }
    }
    if (role.source === 'LOCAL_LAYOUT' && (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET' || node.type === 'INSTANCE')) {
      report.sourceIssues.push({ role: role.id, id: node.id, reason: 'LOCAL_LAYOUT nao pode mascarar componente ou instancia' })
    }
  }

  const roleById = new Map((contract.roles ?? []).map((role) => [role?.id, role]))
  for (const slot of contract.slots ?? []) {
    const result = {
      id: slot?.id ?? null,
      hostInstanceId: null,
      slotNodeId: null,
      contentNodeIds: [],
      componentKey: null,
      libraryKey: slot?.libraryKey ?? null,
      componentPropertyKey: null,
      componentPropertyName: slot?.componentPropertyName ?? null,
      componentPropertyType: null,
      limitViolations: null,
      passed: false,
    }
    report.slotResults.push(result)
    if (!contract.roundId) {
      report.contractIssues.push({ slot: slot?.id ?? null, reason: 'Slot exige roundId para vincular relatorio MCP' })
      continue
    }
    const hostRole = roleById.get(slot?.hostRole)
    if (!hostRole) {
      report.contractIssues.push({ slot: slot?.id ?? null, reason: 'hostRole do Slot nao existe no contrato' })
      continue
    }
    const hostResolution = resolve(hostRole.target)
    if (hostResolution.error || hostResolution.node?.type !== 'INSTANCE') {
      report.sourceIssues.push({ slot: slot?.id ?? null, reason: hostResolution.error ?? 'hostRole do Slot precisa resolver para INSTANCE' })
      continue
    }
    const host = hostResolution.node
    result.hostInstanceId = host.id
    const { main, definitions } = await publicDefinitionsOf(host)
    result.componentKey = main?.key ?? null
    if (!main || main.remote !== true || !result.componentKey) {
      report.sourceIssues.push({ slot: slot?.id ?? null, id: host.id, reason: 'host do Slot precisa ser INSTANCE IDS remota' })
      continue
    }
    const property = Object.entries(definitions ?? {}).find(([key, definition]) =>
      key === slot?.componentPropertyName || key.split('#')[0] === slot?.componentPropertyName || definition?.name === slot?.componentPropertyName,
    )
    if (!property || property[1]?.type !== 'SLOT') {
      report.sourceIssues.push({ slot: slot?.id ?? null, id: host.id, reason: 'property publica SLOT esperada nao existe no componente IDS' })
      continue
    }
    result.componentPropertyKey = property[0]
    result.componentPropertyType = property[1].type
    let slotNode
    try {
      slotNode = descendantsOf(host).find((candidate) => candidate.type === 'SLOT' && candidate.name === slot?.slotName)
    } catch (error) {
      report.notVerifiable.push({ slot: slot?.id ?? null, reason: `nao foi possivel ler SlotNode: ${String(error)}` })
      continue
    }
    if (!slotNode) {
      report.notVerifiable.push({ slot: slot?.id ?? null, id: host.id, reason: 'SlotNode esperado nao pode ser confirmado na instancia' })
      continue
    }
    result.slotNodeId = slotNode.id
    const referencesProperty = (value) => {
      if (value === result.componentPropertyKey) return true
      if (!value || typeof value !== 'object') return false
      return Object.values(value).some(referencesProperty)
    }
    if (!referencesProperty(slotNode.componentPropertyReferences)) {
      report.notVerifiable.push({ slot: slot?.id ?? null, id: slotNode.id, reason: 'SlotNode nao confirma o vinculo com a property publica SLOT' })
      continue
    }
    if (!Array.isArray(slotNode.limitViolations)) {
      report.notVerifiable.push({ slot: slot?.id ?? null, id: slotNode.id, reason: 'SlotNode nao expoe limitViolations para leitura' })
      continue
    }
    result.limitViolations = [...slotNode.limitViolations]
    if (result.limitViolations.length > 0) {
      report.sourceIssues.push({ slot: slot?.id ?? null, id: slotNode.id, limitViolations: result.limitViolations, reason: 'conteudo do Slot viola limites configurados' })
      continue
    }
    for (const contentRoleId of slot?.contentRoleIds ?? []) {
      const contentRole = roleById.get(contentRoleId)
      const candidates = descendantsOf(slotNode).filter((candidate) => candidate !== slotNode)
      const matches = candidates.filter((candidate) => candidate.name === contentRole?.target?.nodeName)
      if (!contentRole || !contentRole.target?.nodeName || matches.length !== 1) {
        report.sourceIssues.push({ slot: slot?.id ?? null, role: contentRoleId ?? null, reason: 'papel de conteudo nao pode ser confirmado dentro do SlotNode' })
        continue
      }
      result.contentNodeIds.push(matches[0].id)
    }
    result.passed = result.contentNodeIds.length === (slot?.contentRoleIds ?? []).length
  }

  for (const node of localTree) {
    if (node.detachedInfo && !claimedNodes.has(node.id)) report.detachedIssues.push({ id: node.id, name: node.name, reason: 'instancia destacada fora do contrato' })
    if (node.type === 'INSTANCE' && !claimedInstances.has(node.id)) {
      report.unmappedInstances.push({ id: node.id, name: node.name, reason: 'instancia sem papel e fonte declarados no contrato' })
    }
    if (node.id !== template.id && (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET')) {
      report.sourceIssues.push({ id: node.id, name: node.name, reason: 'componente local inserido na arvore do template; use INSTANCE aprovada ou LOCAL_LAYOUT' })
    }
  }

  report.passed =
    report.contractIssues.length === 0 &&
    report.sourceIssues.length === 0 &&
    report.detachedIssues.length === 0 &&
    report.unmappedInstances.length === 0 &&
    report.notVerifiable.length === 0 &&
    report.slotResults.every((result) => result.passed)
  report.verificationStatus = report.notVerifiable.length > 0
    ? 'NAO_VERIFICAVEL'
    : report.passed ? 'APROVADO' : 'REPROVADO'
  return report
}
