/**
 * validateLocalComponents
 *
 * Prova que um componente local e interno, aprovado e reutilizado. A API nao
 * expoe de modo confiavel o estado de publicacao da library; essa confirmacao
 * continua como checklist humano antes da publicacao.
 */
async function validateLocalComponents(componentId, contract = {}) {
  const component = await figma.getNodeByIdAsync(componentId)
  const report = {
    componentId,
    componentName: component?.name ?? null,
    contractIssues: [],
    locationIssues: [],
    namingIssues: [],
    reuseIssues: [],
    contextIssues: [],
    humanChecklist: ['Confirmar no Figma que o componente local permanece oculto antes de publicar a library.'],
    passed: false,
  }
  if (!component) {
    report.contractIssues.push({ reason: 'componente local nao encontrado' })
    return report
  }
  if (component.type !== 'COMPONENT' && component.type !== 'COMPONENT_SET') {
    report.contractIssues.push({ reason: 'componente local precisa ser COMPONENT ou COMPONENT_SET' })
  }
  if (!component.name.startsWith('_componentes-locais/')) {
    report.namingIssues.push({ reason: 'nome precisa usar _componentes-locais/<dominio>/<nome>' })
  }
  let ancestor = component.parent
  let underInternalArea = false
  while (ancestor) {
    if (ancestor.name === '_componentes-locais') {
      underInternalArea = true
      break
    }
    ancestor = ancestor.parent
  }
  if (!underInternalArea) {
    report.locationIssues.push({ reason: 'componente local precisa estar sob a area interna _componentes-locais' })
  }
  if (contract.approved !== true) {
    report.contractIssues.push({ reason: 'contrato nao registra aprovacao humana do componente local' })
  }
  if (!Array.isArray(contract.reuseEvidence)) {
    report.contractIssues.push({ reason: 'reuseEvidence precisa listar usos previstos aprovados' })
  } else {
    const uniqueUses = new Set()
    for (const evidence of contract.reuseEvidence) {
      if (!evidence?.modalidade || !evidence?.etapa || !evidence?.tela || !evidence?.casoUso) {
        report.reuseIssues.push({ reason: 'evidencia precisa ter modalidade, etapa, tela e casoUso' })
        continue
      }
      uniqueUses.add([evidence.modalidade, evidence.etapa, evidence.tela, evidence.casoUso].join('::'))
    }
    if (uniqueUses.size < 2) {
      report.reuseIssues.push({ reason: 'componente local exige duas reutilizacoes previstas distintas' })
    }
  }
  if (!Array.isArray(contract.knownContexts) || contract.knownContexts.length === 0) {
    report.contractIssues.push({ reason: 'knownContexts precisa listar contexto-id e rotulo conhecidos' })
  } else {
    const stampParts = [component.name, component.description ?? '']
    if (typeof component.findAll === 'function') {
      for (const node of component.findAll(() => true)) {
        stampParts.push(node.name ?? '')
        if (typeof node.characters === 'string') stampParts.push(node.characters)
      }
    }
    const searchable = stampParts.join('\n').toLocaleLowerCase('pt-BR')
    for (const context of contract.knownContexts) {
      if (!context?.id || !context?.label) {
        report.contractIssues.push({ reason: 'knownContexts precisa ter id e label nao vazios' })
        continue
      }
      for (const token of [context.id, context.label]) {
        if (searchable.includes(token.toLocaleLowerCase('pt-BR'))) {
          report.contextIssues.push({ token, reason: 'componente local carrega identificador ou rotulo de contexto no nome, descricao ou carimbo' })
        }
      }
    }
  }
  report.passed =
    report.contractIssues.length === 0 &&
    report.locationIssues.length === 0 &&
    report.namingIssues.length === 0 &&
    report.reuseIssues.length === 0 &&
    report.contextIssues.length === 0
  return report
}
