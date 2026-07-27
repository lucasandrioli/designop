/**
 * validateModeBehavior
 *
 * Prova o COMPORTAMENTO de previews já construídos. Não valida a estrutura do
 * template nem descobre quais conteúdos devem variar: recebe apenas os
 * papéis já aprovados no contrato da etapa e compara o resultado efetivo do
 * preview com sua referência crua por cluster.
 *
 * Antes de chamar, cole também validateLayout e passe a função por opts. O
 * layout é avaliado no preview já resolvido no mode daquele cluster.
 *
 * A única exceção de override é a renomeação direta da instância de preview:
 * `{ id: instance.id, overriddenFields: ['name'] }`. O repositório permite
 * nomear instâncias pelo papel que exercem. Qualquer outro campo, inclusive
 * `name` em nó ou instância filha, reprova.
 *
 * Uso via use_figma:
 *
 * return await validateModeBehavior([
 *   {
 *     cluster: 'cluster-exemplo',
 *     wrapperId: '10:1',
 *     modeId: '10:0',
 *     instanceId: '10:2',
 *     templateId: '10:3',
 *     referenceId: '10:4',
 *     layoutRootId: '10:1',
 *     roles: [
 *       { id: 'titulo', type: 'text', preview: { nodeName: 'Titulo' }, reference: { nodeName: 'Titulo' } },
 *       { id: 'cta-visivel', type: 'visible', preview: { nodeName: 'CTA' }, reference: { nodeName: 'CTA' } },
 *     ],
 *   },
 * ], {
 *   contentCollectionId: 'VariableCollectionId:conteudo',
 *   expectedRoles: [
 *     { id: 'titulo', type: 'text' },
 *     { id: 'cta-visivel', type: 'visible' },
 *   ],
 *   validateLayout,
 * })
 *
 * Para uma execução pontual, seletores podem usar nodeId. Para a interface
 * versionada, prefira nodeName único em cada preview e referência.
 *
 * @param {Array<{
 *   cluster: string,
 *   wrapperId: string,
 *   modeId: string,
 *   instanceId: string,
 *   templateId: string,
 *   referenceId: string,
 *   layoutRootId: string,
 *   roles: Array<{
 *     id: string,
 *     type: 'text'|'visible',
 *     preview: {nodeId?: string, nodeName?: string},
 *     reference: {nodeId?: string, nodeName?: string}
 *   }>
 * }>} previews
 * @param {{
 *   contentCollectionId: string,
 *   expectedRoles: Array<{id: string, type: 'text'|'visible'}>,
 *   validateLayout?: (nodeId: string) => Promise<{passed: boolean}>
 * }} opts
 * @returns {Promise<{
 *   invalidPreviews: Array<{cluster?: string, reason: string}>,
 *   previewResults: Array<object>,
 *   passed: boolean
 * }>}
 */
async function validateModeBehavior(previews, opts = {}) {
  if (!Array.isArray(previews) || previews.length === 0) {
    throw new Error('previews precisa conter ao menos uma prova por cluster')
  }
  if (typeof opts.contentCollectionId !== 'string' || !opts.contentCollectionId) {
    throw new Error('opts.contentCollectionId é obrigatório')
  }
  if (!Array.isArray(opts.expectedRoles) || opts.expectedRoles.length === 0) {
    throw new Error('opts.expectedRoles precisa declarar os papéis aprovados')
  }
  const expectedRoles = new Map()
  for (const role of opts.expectedRoles) {
    if (!role || typeof role.id !== 'string' || !role.id ||
        (role.type !== 'text' && role.type !== 'visible') || expectedRoles.has(role.id)) {
      throw new Error('opts.expectedRoles precisa conter id único e type text ou visible')
    }
    expectedRoles.set(role.id, role.type)
  }

  const invalidPreviews = []
  const previewResults = []

  const descendantsOf = (root) => [root, ...('children' in root ? root.findAll(() => true) : [])]
  const resolveTarget = async (root, selector) => {
    if (!selector || typeof selector !== 'object') return { error: 'seletor ausente' }
    const candidates = descendantsOf(root)
    if (selector.nodeId) {
      const node = await figma.getNodeByIdAsync(selector.nodeId)
      if (!node) return { error: `alvo ${selector.nodeId} não encontrado` }
      if (!candidates.some((candidate) => candidate.id === node.id)) {
        return { error: `alvo ${selector.nodeId} não pertence ao escopo` }
      }
      return { node }
    }
    if (typeof selector.nodeName !== 'string' || !selector.nodeName) {
      return { error: 'seletor precisa de nodeId ou nodeName' }
    }
    const matches = candidates.filter((node) => node.name === selector.nodeName)
    if (matches.length === 0) return { error: `alvo "${selector.nodeName}" não encontrado` }
    if (matches.length > 1) return { error: `alvo "${selector.nodeName}" é ambíguo (${matches.length} nós)` }
    return { node: matches[0] }
  }

  const valueOf = (node, type) => {
    if (type === 'text') {
      return node.type === 'TEXT'
        ? { value: node.characters }
        : { error: `${node.name} não é TEXT para o papel de texto` }
    }
    if (type === 'visible') return { value: node.visible !== false }
    return { error: 'type deve ser text ou visible' }
  }

  for (const preview of previews) {
    const cluster = preview?.cluster
    const result = {
      cluster: cluster ?? '',
      wrapperMode: null,
      modeIssues: [],
      descendantModeIssues: [],
      overrideIssues: [],
      ignoredOverrides: [],
      templateIssues: [],
      roleSetIssues: [],
      roleResults: [],
      layout: null,
      passed: false,
    }

    if (!cluster || !preview.wrapperId || !preview.modeId || !preview.instanceId || !preview.templateId ||
        !preview.referenceId || !preview.layoutRootId || !Array.isArray(preview.roles)) {
      invalidPreviews.push({ cluster, reason: 'preview sem campos obrigatórios' })
      previewResults.push(result)
      continue
    }

    const wrapper = await figma.getNodeByIdAsync(preview.wrapperId)
    const instance = await figma.getNodeByIdAsync(preview.instanceId)
    const reference = await figma.getNodeByIdAsync(preview.referenceId)
    const layoutRoot = await figma.getNodeByIdAsync(preview.layoutRootId)
    if (!wrapper || !instance || !reference || !layoutRoot) {
      invalidPreviews.push({ cluster, reason: 'wrapper, instância, referência ou raiz de layout não encontrada' })
      previewResults.push(result)
      continue
    }
    if (instance.type !== 'INSTANCE') {
      result.templateIssues.push({ id: instance.id, reason: 'preview não aponta para INSTANCE' })
    }
    const wrapperNodes = descendantsOf(wrapper)
    if (!wrapperNodes.some((candidate) => candidate.id === instance.id)) {
      result.modeIssues.push({ id: instance.id, reason: 'instância não pertence ao wrapper de preview' })
    }
    if (!wrapperNodes.some((candidate) => candidate.id === layoutRoot.id)) {
      result.modeIssues.push({ id: layoutRoot.id, reason: 'raiz de layout não pertence ao wrapper de preview' })
    }

    result.wrapperMode = wrapper.explicitVariableModes?.[opts.contentCollectionId] ?? null
    if (result.wrapperMode !== preview.modeId) {
      result.modeIssues.push({
        id: wrapper.id,
        expectedModeId: preview.modeId,
        actualModeId: result.wrapperMode,
        reason: 'mode do cluster não está aplicado no wrapper de preview',
      })
    }
    for (const candidate of wrapperNodes) {
      if (candidate.id === wrapper.id) continue
      const modeId = candidate.explicitVariableModes?.[opts.contentCollectionId]
      if (modeId) {
        result.descendantModeIssues.push({
          id: candidate.id,
          name: candidate.name,
          modeId,
          reason: 'mode explícito de conteúdo abaixo do wrapper de preview',
        })
      }
    }

    if (instance.type === 'INSTANCE') {
      if (instance.mainComponent?.id !== preview.templateId) {
        result.templateIssues.push({
          id: instance.id,
          expectedTemplateId: preview.templateId,
          actualTemplateId: instance.mainComponent?.id ?? null,
          reason: 'instância não resolve para o template selecionado',
        })
      }
      if (!Array.isArray(instance.overrides)) {
        result.overrideIssues.push({ id: instance.id, reason: 'API não expôs overrides; prova não verificável' })
      } else {
        for (const override of instance.overrides) {
          const fields = [...(override.overriddenFields ?? [])]
          const isDirectPreviewRename =
            override.id === instance.id &&
            fields.length > 0 &&
            fields.every((field) => field === 'name')
          if (isDirectPreviewRename) {
            result.ignoredOverrides.push({
              id: override.id,
              fields,
              reason: 'renomeação direta da instância de preview permitida pela convenção do papel',
            })
          } else if (fields.length) {
            result.overrideIssues.push({
              id: override.id,
              fields,
              reason: 'preview possui override manual em relação ao master',
            })
          }
        }
      }
    }

    const seenRoles = new Set()
    if (preview.roles.length === 0) {
      result.roleSetIssues.push({ reason: 'preview não declarou papéis para provar comportamento' })
    }
    for (const role of preview.roles) {
      const roleResult = { role: role?.id ?? '', status: 'failed' }
      if (!role?.id || seenRoles.has(role.id)) {
        roleResult.reason = !role?.id ? 'papel sem id' : 'papel duplicado no preview'
        result.roleResults.push(roleResult)
        continue
      }
      seenRoles.add(role.id)
      const expectedType = expectedRoles.get(role.id)
      if (!expectedType) {
        result.roleSetIssues.push({ role: role.id, reason: 'papel não existe no contrato aprovado' })
      } else if (role.type !== expectedType) {
        result.roleSetIssues.push({
          role: role.id,
          expectedType,
          actualType: role.type ?? null,
          reason: 'type do papel diverge do contrato aprovado',
        })
      }
      const previewTarget = await resolveTarget(instance, role.preview)
      const referenceTarget = await resolveTarget(reference, role.reference)
      if (previewTarget.error || referenceTarget.error) {
        roleResult.reason = previewTarget.error ?? referenceTarget.error
        result.roleResults.push(roleResult)
        continue
      }
      const previewValue = valueOf(previewTarget.node, role.type)
      const referenceValue = valueOf(referenceTarget.node, role.type)
      if (previewValue.error || referenceValue.error) {
        roleResult.reason = previewValue.error ?? referenceValue.error
        result.roleResults.push(roleResult)
        continue
      }
      if (previewValue.value !== referenceValue.value) {
        result.roleResults.push({
          ...roleResult,
          previewValue: previewValue.value,
          referenceValue: referenceValue.value,
          reason: 'conteúdo efetivo do preview diverge da referência do cluster',
        })
      } else {
        result.roleResults.push({ ...roleResult, status: 'passed', value: previewValue.value })
      }
    }
    for (const expectedRoleId of expectedRoles.keys()) {
      if (!seenRoles.has(expectedRoleId)) {
        result.roleSetIssues.push({ role: expectedRoleId, reason: 'papel aprovado ausente no preview' })
      }
    }

    if (typeof opts.validateLayout !== 'function') {
      result.layout = { passed: false, reason: 'validateLayout não foi fornecido' }
    } else {
      try {
        result.layout = await opts.validateLayout(preview.layoutRootId)
      } catch (error) {
        result.layout = { passed: false, reason: String(error) }
      }
    }

    result.passed =
      result.modeIssues.length === 0 &&
      result.descendantModeIssues.length === 0 &&
      result.overrideIssues.length === 0 &&
      result.templateIssues.length === 0 &&
      result.roleSetIssues.length === 0 &&
      result.roleResults.length === expectedRoles.size &&
      result.roleResults.every((role) => role.status === 'passed') &&
      result.layout?.passed === true
    previewResults.push(result)
  }

  return {
    invalidPreviews,
    previewResults,
    passed: invalidPreviews.length === 0 && previewResults.every((preview) => preview.passed),
  }
}
