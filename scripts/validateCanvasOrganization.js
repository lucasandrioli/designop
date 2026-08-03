/**
 * validateCanvasOrganization
 *
 * Confere a organizacao do canvas contra as secoes declaradas para uma
 * pagina. Nenhuma secao e universal: o contrato informa quais regioes a
 * pagina deve ter e se masters locais devem ser checados.
 *
 * Uso via use_figma:
 *
 * return await validateCanvasOrganization('0:1', {
 *   regions: ['_ref-<cluster-a>', '_ref-<cluster-b>', '_componentes-locais'],
 *   checkLocalComponentOverlap: true,
 * })
 */
async function validateCanvasOrganization(pageId, contract = {}) {
  const page = await figma.getNodeByIdAsync(pageId)
  if (!page || page.type !== 'PAGE') throw new Error(`Pagina ${pageId} nao encontrada`)

  const report = {
    pageId: page.id,
    pageName: page.name,
    missingRegions: [],
    regionOverlaps: [],
    localComponentOverlaps: [],
    passed: false,
  }
  const tolerance = Number.isFinite(contract.tolerance) ? contract.tolerance : 1
  const area = (a, b) => {
    const x = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
    const y = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
    return x > tolerance && y > tolerance ? Math.round(x * y) : 0
  }
  const namedRegions = []
  for (const name of contract.regions ?? []) {
    const matches = page.children.filter((node) => node.type === 'SECTION' && node.name === name)
    if (matches.length !== 1) {
      report.missingRegions.push({ name, reason: matches.length === 0 ? 'secao ausente' : 'secao ambigua' })
    } else {
      namedRegions.push(matches[0])
    }
  }
  for (let i = 0; i < namedRegions.length; i += 1) {
    for (let j = i + 1; j < namedRegions.length; j += 1) {
      const a = namedRegions[i].absoluteBoundingBox
      const b = namedRegions[j].absoluteBoundingBox
      if (a && b) {
        const overlap = area(a, b)
        if (overlap > 0) report.regionOverlaps.push({ a: namedRegions[i].name, b: namedRegions[j].name, areaPx: overlap })
      }
    }
  }
  if (contract.checkLocalComponentOverlap === true) {
    const components = page.children.filter((node) => node.type === 'COMPONENT')
    for (let i = 0; i < components.length; i += 1) {
      for (let j = i + 1; j < components.length; j += 1) {
        const a = components[i].absoluteBoundingBox
        const b = components[j].absoluteBoundingBox
        if (a && b) {
          const overlap = area(a, b)
          if (overlap > 0) report.localComponentOverlaps.push({ a: components[i].name, b: components[j].name, areaPx: overlap })
        }
      }
    }
  }
  report.passed =
    report.missingRegions.length === 0 &&
    report.regionOverlaps.length === 0 &&
    report.localComponentOverlaps.length === 0
  return report
}
