/**
 * validateReconstructionContract
 *
 * Prova que um rascunho reconstruiu o CONTRATO aprovado, e nao a arvore
 * acidental da referencia. O contrato usa papeis semanticos estaveis e
 * nomes unicos, nunca node IDs permanentes.
 *
 * Use com validateCreation, validateContentContract, validateModeBehavior
 * e validateLayout. Esta funcao cobre tres perguntas independentes:
 *
 * A) ARVORE: pai, ordem, tipo, composicao permitida e sobreposicao.
 * B) GEOMETRIA: caixa relativa a raiz, padding e gap por papel.
 * C) IDS: instancia destacada, key/properties erradas e token/literal
 *    fora do mapa aprovado.
 * D) VIEWPORT: superficie e dimensoes-base, quando declaradas.
 * E) PROTOTIPO: direcao de rolagem e filhos fixos, quando declarados.
 *
 * A referencia pode ter nesting ruim, componentes destacados ou valores
 * manuais. Ela serve apenas para localizar os papeis e comparar a
 * geometria visivel. A arvore validada e somente a do rascunho.
 *
 * Uso via use_figma (cole a funcao inteira):
 *
 * return await validateReconstructionContract('200:10', '100:10', {
 *   tolerance: 2,
 *   viewport: { surface: 'mobile', width: 360, height: 800 },
 *   roles: [
 *     {
 *       id: 'orientacao',
 *       target: { root: true },
 *       reference: { root: true },
 *       type: 'COMPONENT',
 *       source: 'local-layout',
 *       layout: { mode: 'VERTICAL', padding: [24, 16, 24, 16], gap: 16 },
 *     },
 *     {
 *       id: 'acao-primaria',
 *       target: { nodeName: 'Acao primaria' },
 *       reference: { nodeName: 'CTA principal' },
 *       parent: 'orientacao', order: 2, type: 'INSTANCE',
 *       source: 'ids-instance',
 *       ids: { componentKey: '<key real>', properties: ['Label'] },
 *     },
 *   ],
 *   prototype: {
 *     overflowDirection: 'VERTICAL',
 *     fixedChildren: ['rodape-fixo'],
 *   },
 * }, { geometryCandidateId: '200:11' })
 *
 * @param {string} candidateId - COMPONENT ou COMPONENT_SET rascunho.
 * @param {string} referenceId - frame cru do mesmo caso e cluster.
 * @param {{
 *   tolerance?: number,
 *   roles: Array<{
 *     id: string,
 *     target: {root?: boolean, nodeName?: string},
 *     reference?: {root?: boolean, nodeName?: string},
 *     parent?: string, order?: number, type?: string,
 *     source?: 'ids-instance'|'local-layout'|'local-component'|'text'|'asset',
 *     localException?: boolean,
 *     overlay?: boolean,
 *     layout?: {mode?: 'HORIZONTAL'|'VERTICAL', padding?: number[], gap?: number},
 *     ids?: {componentKey?: string, properties?: string[]},
 *     tokens?: Array<{field: string, variable?: string, literal?: unknown, approvedLiteral?: boolean}>
 *   }>,
 *   prototype?: {
 *     overflowDirection?: 'NONE'|'HORIZONTAL'|'VERTICAL'|'HORIZONTAL_AND_VERTICAL',
 *     fixedChildren?: string[]
 *   },
 *   viewport?: { surface?: string, width?: number, height?: number }
 * }} contract
 * @param {{geometryCandidateId?: string}} [opts] - preview resolvido no
 *   mode do cluster. A arvore e IDS continuam auditados no rascunho;
 *   a geometria e medida neste preview. Sem ele, mede o rascunho.
 */
async function validateReconstructionContract(candidateId, referenceId, contract, opts = {}) {
  const report = {
    candidateId,
    referenceId,
    geometryCandidateId: opts.geometryCandidateId ?? candidateId,
    tolerance: Number.isFinite(contract?.tolerance) ? contract.tolerance : 2,
    invalidContract: [],
    treeIssues: [],
    geometryIssues: [],
    idsIssues: [],
    viewportIssues: [],
    prototypeIssues: [],
    roleResults: [],
    passed: false,
  }

  const candidate = await figma.getNodeByIdAsync(candidateId)
  const reference = await figma.getNodeByIdAsync(referenceId)
  const geometryCandidate = opts.geometryCandidateId
    ? await figma.getNodeByIdAsync(opts.geometryCandidateId)
    : candidate
  if (!candidate || !reference || !geometryCandidate) {
    report.invalidContract.push({
      reason: !candidate || !reference
        ? (!candidate && !reference ? 'rascunho e referencia nao encontrados' : !candidate ? 'rascunho nao encontrado' : 'referencia nao encontrada')
        : 'preview geometrico nao encontrado',
    })
    return report
  }
  if (!Array.isArray(contract?.roles) || contract.roles.length === 0) {
    report.invalidContract.push({ reason: 'contract.roles precisa declarar os papeis aprovados' })
    return report
  }
  if (!Number.isFinite(report.tolerance) || report.tolerance < 0) {
    report.invalidContract.push({ reason: 'tolerance precisa ser numero maior ou igual a zero' })
    return report
  }

  // Nao percorremos descendentes de INSTANCE. Uma instancia remota e
  // opaca: sua key/properties sao o contrato publico auditavel.
  const localTree = (root) => {
    const nodes = []
    const walk = (node) => {
      nodes.push(node)
      if (node.type === 'INSTANCE') return
      if ('children' in node) for (const child of node.children) walk(child)
    }
    walk(root)
    return nodes
  }
  const visibleTree = (root) => [root, ...('children' in root ? root.findAll(() => true) : [])]
  const targetNodes = localTree(candidate)
  const geometryNodes = visibleTree(geometryCandidate)
  const referenceNodes = visibleTree(reference)
  const nodeById = new Map()
  const roles = new Map()

  const resolve = (nodes, root, selector) => {
    if (!selector || typeof selector !== 'object') return { error: 'seletor ausente' }
    if (selector.root === true) return { node: root }
    if (typeof selector.nodeName !== 'string' || !selector.nodeName) {
      return { error: 'seletor precisa de root:true ou nodeName' }
    }
    const matches = nodes.filter((node) => node.name === selector.nodeName)
    if (matches.length === 0) return { error: `no "${selector.nodeName}" nao encontrado` }
    if (matches.length > 1) return { error: `no "${selector.nodeName}" e ambiguo (${matches.length})` }
    return { node: matches[0] }
  }

  const normalizeProperty = (key) => String(key).split('#')[0]
  const closeEnough = (actual, expected) => Math.abs(actual - expected) <= report.tolerance
  const relativeBox = (node, root) => {
    const box = node.absoluteBoundingBox
    const rootBox = root.absoluteBoundingBox
    if (!box || !rootBox) return null
    return { x: box.x - rootBox.x, y: box.y - rootBox.y, width: box.width, height: box.height }
  }
  const valuesEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)

  const variables = await figma.variables.getLocalVariablesAsync()
  const variableIdByName = new Map(variables.map((variable) => [variable.name, variable.id]))

  if (contract.viewport) {
    const viewport = contract.viewport
    for (const field of ['width', 'height']) {
      if (viewport[field] !== undefined && (!Number.isFinite(viewport[field]) || viewport[field] <= 0)) {
        report.invalidContract.push({ reason: `viewport.${field} precisa ser numero maior que zero` })
      } else if (Number.isFinite(viewport[field]) && !closeEnough(candidate[field], viewport[field])) {
        report.viewportIssues.push({
          id: candidate.id,
          field,
          expected: viewport[field],
          actual: candidate[field],
          tolerance: report.tolerance,
          reason: 'viewport diverge do contrato',
        })
      }
    }
  }

  if (contract.prototype) {
    const prototype = contract.prototype
    if (prototype.overflowDirection && candidate.overflowDirection !== prototype.overflowDirection) {
      report.prototypeIssues.push({
        id: candidate.id,
        expected: prototype.overflowDirection,
        actual: candidate.overflowDirection,
        reason: 'comportamento de rolagem diverge do contrato',
      })
    }
    if (prototype.fixedChildren !== undefined) {
      if (!Array.isArray(prototype.fixedChildren) || prototype.fixedChildren.some((name) => typeof name !== 'string' || !name)) {
        report.invalidContract.push({ reason: 'prototype.fixedChildren precisa ser uma lista de nomes unicos' })
      } else if (new Set(prototype.fixedChildren).size !== prototype.fixedChildren.length) {
        report.invalidContract.push({ reason: 'prototype.fixedChildren nao pode repetir nomes' })
      } else {
        const actualFixedChildren = prototype.fixedChildren.length === 0
          ? []
          : candidate.children.slice(-prototype.fixedChildren.length).map((node) => node.name)
        if (candidate.numberOfFixedChildren !== prototype.fixedChildren.length) {
          report.prototypeIssues.push({
            id: candidate.id,
            expected: prototype.fixedChildren.length,
            actual: candidate.numberOfFixedChildren,
            reason: 'quantidade de filhos fixos diverge do contrato',
          })
        }
        if (!valuesEqual(actualFixedChildren, prototype.fixedChildren)) {
          report.prototypeIssues.push({
            id: candidate.id,
            expected: prototype.fixedChildren,
            actual: actualFixedChildren,
            reason: 'ordem dos filhos fixos diverge do contrato',
          })
        }
      }
    }
  }

  for (const role of contract.roles) {
    const result = { role: role?.id ?? '', targetId: null, referenceId: null, passed: false }
    if (!role?.id || roles.has(role.id)) {
      report.invalidContract.push({ role: role?.id, reason: !role?.id ? 'papel sem id' : 'papel duplicado' })
      report.roleResults.push(result)
      continue
    }
    const targetResult = resolve(targetNodes, candidate, role.target)
    const geometryResult = resolve(
      geometryNodes,
      geometryCandidate,
      role.geometryTarget ?? role.target,
    )
    const referenceResult = role.reference
      ? resolve(referenceNodes, reference, role.reference)
      : { node: null }
    if (targetResult.error || geometryResult.error || referenceResult.error) {
      report.invalidContract.push({ role: role.id, reason: targetResult.error ?? geometryResult.error ?? referenceResult.error })
      report.roleResults.push(result)
      continue
    }
    const target = targetResult.node
    const ref = referenceResult.node
    const geometryTarget = geometryResult.node
    roles.set(role.id, { role, target, geometryTarget, reference: ref })
    nodeById.set(target.id, role.id)
    result.targetId = target.id
    result.referenceId = ref?.id ?? null

    if (role.type && target.type !== role.type) {
      report.treeIssues.push({ role: role.id, id: target.id, expected: role.type, actual: target.type, reason: 'tipo do papel diverge do contrato' })
    }
    if (role.source === 'ids-instance' && target.type !== 'INSTANCE') {
      report.idsIssues.push({ role: role.id, id: target.id, reason: 'papel IDS precisa ser INSTANCE' })
    }
    if (role.source === 'local-component' && !role.localException) {
      report.idsIssues.push({ role: role.id, id: target.id, reason: 'componente local sem excecao aprovada' })
    }
    if (role.source !== 'local-component' && target.id !== candidate.id && target.type === 'COMPONENT' && !role.localException) {
      report.idsIssues.push({ role: role.id, id: target.id, reason: 'componente local nao declarado no contrato' })
    }
    if (target.detachedInfo) {
      report.idsIssues.push({ role: role.id, id: target.id, reason: 'instancia destacada encontrada' })
    }

    const isAbsolute = target.layoutPositioning === 'ABSOLUTE'
    if (role.overlay === true && !isAbsolute) {
      report.treeIssues.push({ role: role.id, id: target.id, reason: 'sobreposicao aprovada precisa usar posicionamento absoluto' })
    }
    if (role.overlay !== true && isAbsolute) {
      report.treeIssues.push({ role: role.id, id: target.id, reason: 'sobreposicao absoluta sem declaracao no contrato' })
    }

    if (role.layout) {
      if (role.layout.mode && target.layoutMode !== role.layout.mode) {
        report.treeIssues.push({ role: role.id, id: target.id, expected: role.layout.mode, actual: target.layoutMode, reason: 'Auto Layout diverge do contrato' })
      }
      if (Array.isArray(role.layout.padding)) {
        const actualPadding = [target.paddingTop, target.paddingRight, target.paddingBottom, target.paddingLeft]
        if (!valuesEqual(actualPadding, role.layout.padding)) {
          report.geometryIssues.push({ role: role.id, id: target.id, expected: role.layout.padding, actual: actualPadding, reason: 'padding diverge do contrato' })
        }
      }
      if (Number.isFinite(role.layout.gap) && target.itemSpacing !== role.layout.gap) {
        report.geometryIssues.push({ role: role.id, id: target.id, expected: role.layout.gap, actual: target.itemSpacing, reason: 'gap diverge do contrato' })
      }
    }

    if (role.ids) {
      if (target.type !== 'INSTANCE') {
        report.idsIssues.push({ role: role.id, id: target.id, reason: 'mapa IDS exige instancia remota' })
      } else {
        const actualKey = target.mainComponent?.key ?? null
        if (!actualKey) {
          report.idsIssues.push({ role: role.id, id: target.id, reason: 'instancia nao resolve mainComponent.key' })
        } else if (role.ids.componentKey && actualKey !== role.ids.componentKey) {
          report.idsIssues.push({ role: role.id, id: target.id, expected: role.ids.componentKey, actual: actualKey, reason: 'key do componente IDS diverge do mapa aprovado' })
        }
        const propertyKeys = Object.keys(target.componentProperties ?? {})
        for (const expectedProperty of role.ids.properties ?? []) {
          if (!propertyKeys.some((key) => normalizeProperty(key) === expectedProperty)) {
            report.idsIssues.push({ role: role.id, id: target.id, property: expectedProperty, reason: 'property publica IDS ausente' })
          }
        }
      }
    }

    for (const token of role.tokens ?? []) {
      if (!token?.field) {
        report.invalidContract.push({ role: role.id, reason: 'token sem field' })
        continue
      }
      const bound = target.boundVariables?.[token.field]
      if (token.variable) {
        const expectedId = variableIdByName.get(token.variable)
        if (!expectedId) {
          report.invalidContract.push({ role: role.id, token: token.field, reason: `variavel "${token.variable}" nao encontrada` })
        } else if (bound?.id !== expectedId) {
          report.idsIssues.push({ role: role.id, id: target.id, field: token.field, expectedVariable: token.variable, actualVariableId: bound?.id ?? null, reason: 'token IDS esperado nao esta bindado' })
        }
      } else if (token.approvedLiteral === true) {
        if (!valuesEqual(target[token.field], token.literal)) {
          report.idsIssues.push({ role: role.id, id: target.id, field: token.field, expected: token.literal, actual: target[token.field], reason: 'literal aprovado diverge do contrato' })
        }
      } else {
        report.invalidContract.push({ role: role.id, token: token.field, reason: 'token precisa de variavel ou literal aprovado' })
      }
    }

    if (ref) {
      const targetBox = relativeBox(geometryTarget, geometryCandidate)
      const referenceBox = relativeBox(ref, reference)
      if (!targetBox || !referenceBox) {
        report.geometryIssues.push({ role: role.id, id: target.id, reason: 'caixa geometrica ausente no rascunho ou referencia' })
      } else {
        for (const field of ['x', 'y', 'width', 'height']) {
          if (!closeEnough(targetBox[field], referenceBox[field])) {
            report.geometryIssues.push({ role: role.id, id: target.id, field, expected: referenceBox[field], actual: targetBox[field], tolerance: report.tolerance, reason: 'geometria relativa diverge da referencia' })
          }
        }
      }
    }
    result.passed = true
    report.roleResults.push(result)
  }

  for (const { role, target } of roles.values()) {
    if (role.parent) {
      const parent = roles.get(role.parent)
      if (!parent) {
        report.invalidContract.push({ role: role.id, reason: `pai "${role.parent}" nao declarado` })
      } else if (target.parent?.id !== parent.target.id) {
        report.treeIssues.push({ role: role.id, id: target.id, expectedParent: parent.target.id, actualParent: target.parent?.id ?? null, reason: 'pai diverge da arvore-alvo' })
      } else if (Number.isInteger(role.order) && parent.target.children?.[role.order] !== target) {
        report.treeIssues.push({ role: role.id, id: target.id, expectedOrder: role.order, reason: 'ordem entre irmaos diverge da arvore-alvo' })
      }
    }
  }

  report.passed =
    report.invalidContract.length === 0 &&
    report.treeIssues.length === 0 &&
    report.geometryIssues.length === 0 &&
    report.idsIssues.length === 0
    && report.viewportIssues.length === 0
    && report.prototypeIssues.length === 0
  return report
}
