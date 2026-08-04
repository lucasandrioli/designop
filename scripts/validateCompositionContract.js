/*
 * Prova a origem de cada composicao de um template. Executar dentro de
 * use_figma depois de validar o contrato aprovado.
 */
async function validateCompositionContract(templateId, contract = {}) {
  const template = await figma.getNodeByIdAsync(templateId)
  const report = {
    templateId,
    templateName: template?.name ?? null,
    contractIssues: [],
    sourceIssues: [],
    detachedIssues: [],
    unmappedInstances: [],
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

  for (const role of contract.roles) {
    if (!role?.id || !['IDS', 'COMPONENTE_LOCAL', 'LOCAL_LAYOUT', 'TEXTO', 'ASSET'].includes(role.source)) {
      report.contractIssues.push({ role: role?.id ?? null, reason: 'papel precisa de id e source valido' })
      continue
    }
    const result = resolve(role.target)
    if (result.error) {
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
    report.unmappedInstances.length === 0
  return report
}
