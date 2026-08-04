/**
 * validateLayout
 *
 * Validação matemática de integridade visual de um frame (tela), sem
 * depender de screenshot. Projetado para ambientes onde captura de imagem
 * é restrita ou para validação em lote onde inspeção visual não escala.
 *
 * Detecta, por node ID raiz:
 *  1. TEXTO CORTADO: absoluteRenderBounds excedendo o box de um ancestral
 *     com clipsContent=true, ou TEXT com textAutoResize NONE/TRUNCATE
 *     cujo conteúdo renderizado excede o próprio box.
 *  2. SOBREPOSIÇÃO: interseção de bounding boxes entre irmãos diretos
 *     dentro de frames SEM auto layout (em auto layout com gap >= 0 e
 *     sem layoutPositioning ABSOLUTE, sobreposição é impossível por
 *     construção e não é verificada).
 *  3. AUSÊNCIA SUSPEITA DE AUTO LAYOUT: frame com layoutMode NONE
 *     contendo 2+ filhos visíveis não-absolutos (candidato a
 *     empilhamento acidental).
 *  4. FILHOS ABSOLUTOS INESPERADOS: layoutPositioning ABSOLUTE dentro
 *     de auto layout (legítimo para badges/FABs, mas deve ser
 *     intencional, então é reportado como aviso).
 *  5. FONTE FALTANDO: hasMissingFont em qualquer TEXT descendente.
 *  6. TEXTO BINDADO VAZIO (aviso, não reprova sozinho): TEXT com
 *     boundVariables.characters preenchido mas characters === ''.
 *     Estrutural, não sabe SE é esperado (etapa que não existe nesse
 *     contexto tem valor vazio por design — ver skill
 *     consignado-validacao, seção 5, que cruza contra o mapa de
 *     fluxo). Aqui é só o sinal bruto: presença de texto bindado vazio,
 *     para o validador ou o revisor humano decidir se é esperado.
 *
 * Uso via use_figma (a skill figma-use DEVE estar carregada):
 *   cole a função e chame `return await validateLayout('123:456')`.
 *
 * @param {string} rootNodeId - node ID do frame de tela a validar.
 * @param {object} [opts]
 * @param {number} [opts.overlapTolerancePx=1] - interseção mínima (px)
 *   para reportar sobreposição, evitando falsos positivos de borda.
 * @returns {Promise<{
 *   rootId: string, rootName: string,
 *   clippedText: Array<{id: string, name: string, reason: string}>,
 *   overlaps: Array<{parentId: string, aId: string, bId: string, areaPx: number}>,
 *   noAutoLayout: Array<{id: string, name: string, visibleChildren: number}>,
 *   absoluteChildren: Array<{id: string, name: string, parentId: string}>,
 *   missingFonts: Array<{id: string, name: string}>,
 *   emptyBoundText: Array<{id: string, name: string}>,
 *   passed: boolean
 * }>}
 */
async function validateLayout(rootNodeId, opts = {}) {
  const tol = opts.overlapTolerancePx ?? 1
  const root = await figma.getNodeByIdAsync(rootNodeId)
  if (!root) throw new Error(`Node ${rootNodeId} não encontrado`)

  const report = {
    rootId: root.id,
    rootName: root.name,
    clippedText: [],
    overlaps: [],
    noAutoLayout: [],
    absoluteChildren: [],
    missingFonts: [],
    emptyBoundText: [],
    passed: true,
  }

  const rectsIntersect = (a, b) => {
    const x = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
    const y = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
    return x > tol && y > tol ? x * y : 0
  }

  // exceeds: render bounds de `node` estouram o box `bounds` de um ancestral?
  const exceeds = (rb, bounds) =>
    rb.x < bounds.x - tol ||
    rb.y < bounds.y - tol ||
    rb.x + rb.width > bounds.x + bounds.width + tol ||
    rb.y + rb.height > bounds.y + bounds.height + tol

  const SHAPE_TYPES = new Set([
    'VECTOR', 'RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'LINE', 'BOOLEAN_OPERATION',
  ])
  // Um no e "arte" se todos os descendentes diretos sao shapes (icones,
  // ilustracoes). Sobreposicao entre shapes e intencional (compoem o
  // desenho), entao arte e isenta de overlap e noAutoLayout. Clipping de
  // texto e fonte continuam valendo (arte nao tem texto).
  const isArtNode = (node) =>
    'children' in node &&
    node.children.length > 0 &&
    node.children.every((c) => SHAPE_TYPES.has(c.type))

  const walk = (node, clippingAncestors, inInstance) => {
    if (node.visible === false) return

    // 5. fontes faltando
    if (node.type === 'TEXT' && node.hasMissingFont) {
      report.missingFonts.push({ id: node.id, name: node.name })
    }

    // 6. texto bindado vazio (aviso; ver doc da funcao)
    if (
      node.type === 'TEXT' &&
      node.boundVariables &&
      node.boundVariables.characters &&
      node.characters === ''
    ) {
      report.emptyBoundText.push({ id: node.id, name: node.name })
    }

    // 1. texto cortado
    // METRICA CORRETA: absoluteBoundingBox (caixa de layout, cresce com
    // o conteudo e NAO e clipada). absoluteRenderBounds mede pixels
    // renderizados POS-clipping e por definicao nunca excede um
    // ancestral que clipa; usa-lo aqui torna o corte indetectavel.
    // Regra comprovada em teste interno.
    if (node.type === 'TEXT' && node.absoluteBoundingBox) {
      const rb = node.absoluteBoundingBox
      // 1a. contra ancestrais que clipam
      for (const anc of clippingAncestors) {
        if (exceeds(rb, anc.absoluteBoundingBox)) {
          report.clippedText.push({
            id: node.id,
            name: node.name,
            reason: `render bounds excedem ancestral com clipsContent (${anc.name})`,
          })
          break
        }
      }
      // 1b. auto-clip do proprio no: com NONE/TRUNCATION o conteudo
      // excedente nao gera geometria mensuravel (render ja clipado,
      // bounding box fixo). Deteccao confiavel exige medir o texto com
      // resize livre; aqui apenas sinalizamos como suspeito quando o
      // texto tem variavel bindada (conteudo pode variar por mode).
      if ((node.textAutoResize === 'NONE' || node.textAutoResize === 'TRUNCATION') &&
          node.boundVariables && node.boundVariables.characters) {
        report.clippedText.push({
          id: node.id,
          name: node.name,
          reason: `textAutoResize=${node.textAutoResize} em texto bindado: corte indetectavel geometricamente; usar HEIGHT ou WIDTH_AND_HEIGHT`,
        })
      }
    }

    if (!('children' in node)) return
    const kids = node.children.filter((c) => c.visible !== false)
    const isAutoLayout = 'layoutMode' in node && node.layoutMode !== 'NONE'

    // Nota: dentro de INSTANCE, overlap e noAutoLayout sao pulados
    // (arte de componente sobrepoe de proposito; valida-se no master).
    // Clipping e fontes continuam sendo checados em qualquer nivel.

    // 3. frame sem auto layout com múltiplos filhos
    if (
      !inInstance &&
      node.type !== 'INSTANCE' &&
      !isArtNode(node) &&
      !isAutoLayout &&
      (node.type === 'FRAME' || node.type === 'COMPONENT') &&
      kids.length >= 2
    ) {
      report.noAutoLayout.push({ id: node.id, name: node.name, visibleChildren: kids.length })
    }

    // 4. filhos absolutos dentro de auto layout (aviso de intencionalidade)
    if (isAutoLayout) {
      for (const c of kids) {
        if ('layoutPositioning' in c && c.layoutPositioning === 'ABSOLUTE') {
          report.absoluteChildren.push({ id: c.id, name: c.name, parentId: node.id })
        }
      }
    }

    // 2. sobreposição entre irmãos (só onde auto layout não garante)
    const checkOverlap = !inInstance && node.type !== 'INSTANCE' && !isArtNode(node) && (
      !isAutoLayout ||
      kids.some((c) => 'layoutPositioning' in c && c.layoutPositioning === 'ABSOLUTE'))
    if (checkOverlap) {
      for (let i = 0; i < kids.length; i++) {
        for (let j = i + 1; j < kids.length; j++) {
          const a = kids[i].absoluteBoundingBox
          const b = kids[j].absoluteBoundingBox
          if (!a || !b) continue
          const area = rectsIntersect(a, b)
          if (area > 0) {
            report.overlaps.push({
              parentId: node.id,
              aId: kids[i].id,
              bId: kids[j].id,
              areaPx: Math.round(area),
            })
          }
        }
      }
    }

    const nextClipping =
      'clipsContent' in node && node.clipsContent && node.absoluteBoundingBox
        ? [...clippingAncestors, node]
        : clippingAncestors
    for (const c of kids) walk(c, nextClipping, inInstance || node.type === 'INSTANCE')
  }

  walk(root, [], false)

  report.passed =
    report.clippedText.length === 0 &&
    report.overlaps.length === 0 &&
    report.missingFonts.length === 0
  // noAutoLayout e absoluteChildren são avisos, não reprovam sozinhos

  return report
}
