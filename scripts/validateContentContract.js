/**
 * validateContentContract
 *
 * Valida o contrato APROVADO de conteúdo de um template. Diferentemente de
 * validateCreation, este script não pergunta apenas se existe algum alias na
 * collection: ele confere, papel a papel, se o alvo declarado está ligado à
 * variável declarada.
 *
 * O contrato vem de docs/etapas/<etapa>.md depois da aprovação humana. Não
 * descubra papéis pelo nome dos nós e não trate tokens visuais do IDS como
 * conteúdo. O Montador só informa como localizar o alvo no template.
 *
 * Uso via use_figma (cole a função inteira):
 *
 * return await validateContentContract('123:456', {
 *   collectionId: 'VariableCollectionId:conteudo',
 *   roles: [
 *     {
 *       id: 'titulo',
 *       variable: '<tela>/titulo',
 *       type: 'text',
 *       binding: {
 *         kind: 'component-property',
 *         target: { scope: 'template' },
 *         property: 'Titulo',
 *       },
 *     },
 *     {
 *       id: 'cta',
 *       variable: '<tela>/cta',
 *       type: 'text',
 *       binding: {
 *         kind: 'node',
 *         target: { scope: 'node', nodeName: 'CTA sair' },
 *         field: 'characters',
 *       },
 *     },
 *   ],
 * })
 *
 * `target: { scope: 'template' }` declara property exposta no COMPONENT ou
 * COMPONENT_SET raiz. Para property de instância aninhada ou binding interno,
 * use `scope: 'node'`. `nodeId` pode ser usado durante uma execução pontual;
 * prefira `nodeName` único no contrato documentado.
 *
 * @param {string} templateId
 * @param {{collectionId: string, roles: Array<{
 *   id: string,
 *   variable: string,
 *   type: 'text'|'visible',
 *   binding: {
 *     kind: 'component-property'|'node',
 *     target: {scope: 'template'}|{scope: 'node', nodeId?: string, nodeName?: string},
 *     property?: string,
 *     field?: string
 *   }
 * }>}} contract
 * @returns {Promise<{
 *   templateId: string,
 *   templateName: string,
 *   invalidContract: Array<{role?: string, reason: string}>,
 *   roleResults: Array<{
 *     role: string, variable: string, status: 'passed'|'failed',
 *     reason?: string, expectedVariableId?: string,
 *     foundVariableIds?: string[]
 *   }>,
 *   passed: boolean
 * }>}
 */
async function validateContentContract(templateId, contract) {
  const invalidContract = []
  const roleResults = []
  const template = await figma.getNodeByIdAsync(templateId)

  if (!template) throw new Error(`Template ${templateId} não encontrado`)
  if (!contract || typeof contract.collectionId !== 'string' || !contract.collectionId) {
    throw new Error('contract.collectionId é obrigatório')
  }
  if (!Array.isArray(contract.roles) || contract.roles.length === 0) {
    throw new Error('contract.roles precisa declarar ao menos um papel aprovado')
  }

  const allNodes = [template, ...('children' in template ? template.findAll(() => true) : [])]
  const variables = await figma.variables.getLocalVariablesAsync()
  const variablesByName = new Map()
  for (const variable of variables) {
    if (variable.variableCollectionId !== contract.collectionId) continue
    const sameName = variablesByName.get(variable.name) ?? []
    sameName.push(variable)
    variablesByName.set(variable.name, sameName)
  }

  const aliasesIn = (value, result = new Set()) => {
    if (!value || typeof value !== 'object') return result
    if (value.type === 'VARIABLE_ALIAS' && typeof value.id === 'string') {
      result.add(value.id)
      return result
    }
    for (const child of Object.values(value)) aliasesIn(child, result)
    return result
  }

  // Variantes nao expõem definitions no filho COMPONENT. A API exige que a
  // leitura ocorra no COMPONENT_SET pai; componentes independentes continuam
  // expondo as definitions no proprio no.
  const componentPropertyDefinitionsOf = (node) => {
    if (node?.type === 'COMPONENT_SET') return node.componentPropertyDefinitions
    if (node?.type === 'COMPONENT' && node.parent?.type !== 'COMPONENT_SET') {
      return node.componentPropertyDefinitions
    }
    if (node?.type === 'COMPONENT' && node.parent?.type === 'COMPONENT_SET') {
      return node.parent.componentPropertyDefinitions
    }
    return null
  }

  const resolveTarget = async (target) => {
    if (!target || typeof target !== 'object') return { error: 'binding.target ausente' }
    if (target.scope === 'template') {
      if (template.type !== 'COMPONENT' && template.type !== 'COMPONENT_SET') {
        return { error: 'target template exige COMPONENT ou COMPONENT_SET na raiz' }
      }
      return { node: template }
    }
    if (target.scope !== 'node') {
      return { error: "binding.target.scope deve ser 'template' ou 'node'" }
    }
    if (target.nodeId) {
      const node = await figma.getNodeByIdAsync(target.nodeId)
      if (!node) return { error: `alvo ${target.nodeId} não encontrado` }
      if (!allNodes.some((candidate) => candidate.id === node.id)) {
        return { error: `alvo ${target.nodeId} não pertence ao template` }
      }
      return { node }
    }
    if (typeof target.nodeName !== 'string' || !target.nodeName) {
      return { error: 'target com scope node precisa de nodeId ou nodeName' }
    }
    const matches = allNodes.filter((node) => node.name === target.nodeName)
    if (matches.length === 0) return { error: `alvo "${target.nodeName}" não encontrado` }
    if (matches.length > 1) {
      return { error: `alvo "${target.nodeName}" é ambíguo (${matches.length} nós)` }
    }
    return { node: matches[0] }
  }

  const componentPropertyValue = (node, property) => {
    if (typeof property !== 'string' || !property) {
      return { error: 'binding.property é obrigatório para component-property' }
    }
    const entries = []
    if (node.componentProperties) entries.push(...Object.entries(node.componentProperties))
    const definitions = componentPropertyDefinitionsOf(node)
    if (definitions) {
      entries.push(...Object.entries(definitions))
    }
    const matches = entries.filter(([key]) => key === property || key.split('#')[0] === property)
    if (matches.length === 0) {
      return { error: `property "${property}" não encontrada em ${node.name}` }
    }
    return {
      aliases: [...aliasesIn(Object.fromEntries(matches))],
      propertyTypes: [...new Set(matches.map(([, definition]) => definition?.type).filter(Boolean))],
    }
  }

  const seenRoles = new Set()
  for (const role of contract.roles) {
    const id = role?.id
    const variableName = role?.variable
    const type = role?.type
    const result = { role: id ?? '', variable: variableName ?? '', type: type ?? '', status: 'failed' }

    if (typeof id !== 'string' || !id) {
      invalidContract.push({ reason: 'papel sem id' })
      roleResults.push({ ...result, reason: 'papel sem id' })
      continue
    }
    if (seenRoles.has(id)) {
      invalidContract.push({ role: id, reason: 'papel duplicado no contrato' })
      roleResults.push({ ...result, reason: 'papel duplicado no contrato' })
      continue
    }
    seenRoles.add(id)
    if (typeof variableName !== 'string' || !variableName) {
      invalidContract.push({ role: id, reason: 'variável esperada ausente' })
      roleResults.push({ ...result, reason: 'variável esperada ausente' })
      continue
    }
    const expectedResolvedType = type === 'text' ? 'STRING' : type === 'visible' ? 'BOOLEAN' : null
    if (!expectedResolvedType) {
      invalidContract.push({ role: id, reason: "type deve ser 'text' ou 'visible'" })
      roleResults.push({ ...result, reason: 'type de papel inválido' })
      continue
    }

    const expectedVariables = variablesByName.get(variableName) ?? []
    if (expectedVariables.length !== 1) {
      const reason = expectedVariables.length === 0
        ? `variável "${variableName}" não existe na collection declarada`
        : `variável "${variableName}" é ambígua na collection declarada`
      roleResults.push({ ...result, reason })
      continue
    }
    const expectedVariable = expectedVariables[0]
    if (expectedVariable.resolvedType !== expectedResolvedType) {
      roleResults.push({
        ...result,
        expectedVariableId: expectedVariable.id,
        expectedResolvedType,
        actualResolvedType: expectedVariable.resolvedType,
        reason: `variável incompatível: papel ${type} exige ${expectedResolvedType}`,
      })
      continue
    }

    const binding = role.binding
    const target = await resolveTarget(binding?.target)
    if (target.error) {
      roleResults.push({ ...result, expectedVariableId: expectedVariable.id, reason: target.error })
      continue
    }

    let aliases = []
    if (binding?.kind === 'component-property') {
      const property = componentPropertyValue(target.node, binding.property)
      if (property.error) {
        roleResults.push({ ...result, expectedVariableId: expectedVariable.id, reason: property.error })
        continue
      }
      const expectedPropertyType = type === 'text' ? 'TEXT' : 'BOOLEAN'
      if (property.propertyTypes.length > 0 && property.propertyTypes.some((actual) => actual !== expectedPropertyType)) {
        roleResults.push({
          ...result,
          expectedVariableId: expectedVariable.id,
          expectedPropertyType,
          actualPropertyTypes: property.propertyTypes,
          reason: `property incompatível: papel ${type} exige ${expectedPropertyType}`,
        })
        continue
      }
      aliases = property.aliases
    } else if (binding?.kind === 'node') {
      const expectedField = type === 'text' ? 'characters' : 'visible'
      if (binding.field !== expectedField) {
        roleResults.push({
          ...result,
          expectedVariableId: expectedVariable.id,
          expectedField,
          actualField: binding.field ?? null,
          reason: `campo incompatível: papel ${type} exige ${expectedField}`,
        })
        continue
      }
      aliases = [...aliasesIn(target.node.boundVariables?.[expectedField])]
    } else {
      invalidContract.push({ role: id, reason: 'binding.kind deve ser component-property ou node' })
      roleResults.push({ ...result, expectedVariableId: expectedVariable.id, reason: 'binding.kind inválido' })
      continue
    }

    const expectedVariableId = expectedVariable.id
    if (aliases.includes(expectedVariableId)) {
      roleResults.push({ ...result, status: 'passed', expectedVariableId, foundVariableIds: aliases })
    } else {
      const reason = aliases.length === 0
        ? 'binding de conteúdo ausente no alvo declarado'
        : 'alvo ligado a variável diferente da declarada para este papel'
      roleResults.push({
        ...result,
        expectedVariableId,
        foundVariableIds: aliases,
        reason,
      })
    }
  }

  return {
    templateId: template.id,
    templateName: template.name,
    invalidContract,
    roleResults,
    passed: invalidContract.length === 0 && roleResults.every((result) => result.status === 'passed'),
  }
}
