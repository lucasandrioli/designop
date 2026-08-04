/*
 * inspectRemoteComponent
 *
 * Preflight de uma fonte IDS antes de qualquer montagem. O resultado de
 * search_design_system deve alimentar `key` e `assetType`; esta funcao prova
 * que a key ainda pode ser importada no arquivo atual e quais properties
 * publicas o componente realmente oferece.
 *
 * Uso via use_figma:
 * return await inspectRemoteComponent({
 *   key: '<key retornada pela busca>',
 *   assetType: 'COMPONENT_SET',
 *   libraryKey: '<libraryKey usada na busca>',
 * })
 */
async function inspectRemoteComponent(candidate = {}) {
  const report = {
    key: candidate.key ?? null,
    assetType: candidate.assetType ?? null,
    libraryKey: candidate.libraryKey ?? null,
    imported: false,
    remote: null,
    componentName: null,
    publicProperties: [],
    error: null,
    passed: false,
  }

  if (typeof candidate.key !== 'string' || !candidate.key) {
    report.error = 'candidate.key e obrigatoria e deve vir da rodada atual'
    return report
  }
  if (typeof candidate.libraryKey !== 'string' || !candidate.libraryKey) {
    report.error = 'candidate.libraryKey e obrigatoria para provar a biblioteca de origem'
    return report
  }
  const assetType = String(candidate.assetType ?? '').trim().toUpperCase().replace(/-/g, '_')
  if (assetType !== 'COMPONENT' && assetType !== 'COMPONENT_SET') {
    report.error = "candidate.assetType deve ser COMPONENT ou COMPONENT_SET conforme a busca IDS"
    return report
  }

  try {
    const imported = assetType === 'COMPONENT_SET'
      ? await figma.importComponentSetByKeyAsync(candidate.key)
      : await figma.importComponentByKeyAsync(candidate.key)
    report.imported = true
    report.remote = imported.remote === true
    report.componentName = imported.name
    if (!report.remote) {
      report.error = 'key importada nao resolve para componente remoto publicado'
      return report
    }

    const component = assetType === 'COMPONENT_SET' ? imported.defaultVariant : imported
    const instance = component.createInstance()
    const definitions = assetType === 'COMPONENT_SET'
      ? imported.componentPropertyDefinitions
      : component.parent?.type === 'COMPONENT_SET'
        ? component.parent.componentPropertyDefinitions
        : component.componentPropertyDefinitions
    report.publicProperties = Object.entries(definitions ?? {}).map(([componentPropertyKey, definition]) => ({
      componentPropertyKey,
      name: definition?.name ?? componentPropertyKey.split('#')[0],
      type: definition?.type ?? null,
      defaultValue: definition?.defaultValue ?? null,
    }))
    report.instanceProperties = Object.entries(instance.componentProperties ?? {}).map(([name, property]) => ({
      name,
      type: property?.type ?? null,
      value: property?.value ?? null,
      boundVariables: property?.boundVariables ?? null,
    }))
    const slotNodes = []
    const walk = (node) => {
      if (node.type === 'SLOT') {
        slotNodes.push({
          id: node.id,
          name: node.name,
          limitViolations: Array.isArray(node.limitViolations) ? [...node.limitViolations] : null,
          componentPropertyReferences: node.componentPropertyReferences ?? null,
        })
      }
      if ('children' in node) for (const child of node.children) walk(child)
    }
    walk(instance)
    report.slotNodes = slotNodes
    instance.remove()
    report.passed = true
    return report
  } catch (error) {
    report.error = error instanceof Error ? error.message : String(error)
    return report
  }
}
