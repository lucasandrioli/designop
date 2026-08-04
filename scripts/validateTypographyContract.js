/*
 * Valida tipografia real no Figma. O contrato usa papeis logicos; IDs de
 * estilo e de no entram apenas na chamada MCP e no relatorio temporario.
 */
async function validateTypographyContract(templateId, contract = {}) {
  const report = {
    roundId: contract.roundId ?? null,
    templateId,
    invalidContract: [],
    targetResults: [],
    notVerifiable: [],
    verificationStatus: 'REPROVADO',
    passed: false,
  }
  const template = await figma.getNodeByIdAsync(templateId)
  if (!template) {
    report.invalidContract.push({ reason: 'template nao encontrado' })
    return report
  }
  if (!contract.roundId) report.invalidContract.push({ reason: 'roundId e obrigatorio' })
  if (!Array.isArray(contract.targets) || contract.targets.length === 0) report.invalidContract.push({ reason: 'targets tipograficos sao obrigatorios' })
  const allNodes = [template, ...('children' in template ? template.findAll(() => true) : [])]
  const styles = new Map((contract.styles ?? []).map((style) => [style?.role, style]))
  const aliasesIn = (value, output = new Set()) => {
    if (!value || typeof value !== 'object') return output
    if (value.type === 'VARIABLE_ALIAS' && typeof value.id === 'string') output.add(value.id)
    for (const child of Object.values(value)) aliasesIn(child, output)
    return output
  }
  const normalize = (segments) => {
    const result = []
    for (const segment of segments) {
      const signature = JSON.stringify({ textStyleId: segment.textStyleId ?? null, aliases: [...aliasesIn(segment.boundVariables)].sort() })
      const previous = result[result.length - 1]
      if (previous?.signature === signature) previous.end = segment.end
      else result.push({ signature, start: segment.start, end: segment.end, textStyleId: segment.textStyleId ?? null, boundVariableIds: [...aliasesIn(segment.boundVariables)].sort() })
    }
    return result
  }
  const resolveTarget = (target) => {
    if (target?.nodeId) return allNodes.find((node) => node.id === target.nodeId) ?? null
    const matches = allNodes.filter((node) => node.name === target?.nodeName)
    return matches.length === 1 ? matches[0] : null
  }
  for (const target of contract.targets ?? []) {
    const result = { id: target?.id ?? null, targetNodeIds: [], segments: [], passed: false }
    report.targetResults.push(result)
    const node = resolveTarget(target?.target)
    if (!target?.id || !node || !['IDS_STYLE', 'IDS_COMPONENT', 'LOCAL_APPROVED'].includes(target?.source) || !['UNICO', 'MISTO'].includes(target?.kind)) {
      report.invalidContract.push({ target: target?.id ?? null, reason: 'alvo tipografico ausente ou ambiguo' })
      continue
    }
    result.targetNodeIds = [node.id]
    const expectedRoles = target.kind === 'MISTO' ? (target.segments ?? []).map((segment) => segment.styleRole) : [target.styleRole]
    if (target.kind === 'MISTO' && (!Array.isArray(target.segments) || target.segments.length === 0)) {
      report.invalidContract.push({ target: target.id, reason: 'MISTO exige segmentos ordenados' })
      continue
    }
    if (target.kind === 'UNICO' && !target.styleRole) {
      report.invalidContract.push({ target: target.id, reason: 'UNICO exige styleRole' })
      continue
    }
    if (target.source === 'LOCAL_APPROVED' && !target.approvalId) {
      report.invalidContract.push({ target: target.id, reason: 'LOCAL_APPROVED exige approvalId humano' })
      continue
    }
    if (target.source !== 'IDS_COMPONENT' && expectedRoles.some((role) => !styles.has(role))) {
      report.invalidContract.push({ target: target.id, reason: 'estilos esperados ausentes ou invalidos' })
      continue
    }
    if (target.source === 'IDS_STYLE' && expectedRoles.some((role) => !styles.get(role)?.styleId)) {
      report.invalidContract.push({ target: target.id, reason: 'IDS_STYLE exige Text Style publicado para cada segmento' })
      continue
    }
    if (target.source === 'IDS_COMPONENT') {
      const main = node.type === 'INSTANCE' ? (node.mainComponent ?? await node.getMainComponentAsync?.()) : null
      if (!main || main.remote !== true) report.targetResults[result.targetResults.length - 1].reason = 'IDS_COMPONENT exige INSTANCE remota'
      else result.passed = true
      continue
    }
    if (node.type !== 'TEXT') {
      report.invalidContract.push({ target: target.id, reason: 'IDS_STYLE ou LOCAL_APPROVED exige TEXT local' })
      continue
    }
    if (typeof node.getStyledTextSegments !== 'function') {
      report.notVerifiable.push({ target: target.id, id: node.id, reason: 'API nao expoe getStyledTextSegments' })
      continue
    }
    let actual
    try {
      actual = normalize(node.getStyledTextSegments(['textStyleId', 'boundVariables']))
    } catch (error) {
      report.notVerifiable.push({ target: target.id, id: node.id, reason: `leitura de segmentos falhou: ${String(error)}` })
      continue
    }
    result.segments = actual
    if (actual.length !== expectedRoles.length) {
      result.reason = 'quantidade de segmentos tipograficos diverge do contrato'
      continue
    }
    const mismatches = actual.filter((segment, index) => {
      const expected = styles.get(expectedRoles[index])
      if (expected?.styleId && segment.textStyleId !== expected.styleId) return true
      if (!Array.isArray(expected?.boundVariableIds)) return true
      const expectedBindings = [...expected.boundVariableIds].sort()
      return JSON.stringify(segment.boundVariableIds) !== JSON.stringify(expectedBindings)
    })
    if (mismatches.length > 0) {
      result.reason = 'estilo ou binding de segmento diverge do contrato'
      continue
    }
    result.passed = true
  }
  report.passed = report.invalidContract.length === 0 && report.notVerifiable.length === 0 && report.targetResults.every((result) => result.passed)
  report.verificationStatus = report.notVerifiable.length > 0 ? 'NAO_VERIFICAVEL' : report.passed ? 'APROVADO' : 'REPROVADO'
  return report
}
