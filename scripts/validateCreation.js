/**
 * validateCreation
 *
 * Validação ESTRUTURAL pós-construção: os nós que o agente diz ter
 * criado existem mesmo, com o tipo certo e a forma esperada? Roda ANTES
 * do validateLayout — não adianta medir geometria de um nó que não é o
 * que se pensa que é.
 *
 * Existe porque a Plugin API falha em silêncio com frequência: um
 * `setProperties` com key errada, um `appendChild` num pai errado ou um
 * `createComponentFromNode` que devolveu outra coisa não levantam erro
 * visível, e a tela "parece" pronta. Esta função confronta o que foi
 * pedido contra o que está no arquivo.
 *
 * Faz duas coisas:
 *
 * A) CONFERÊNCIA CONTRA A ESPECIFICAÇÃO (`expected`): para cada nó
 *    declarado, checa existência, tipo, nome, contagem de filhos,
 *    presença de auto layout e de bindings. A checagem detalhada de
 *    conteúdo por papel vive em validateContentContract.js.
 *
 * B) CONVENÇÕES DO PROJETO (automáticas, sem precisar declarar):
 *    1. `ref-` é referência crua, `_rascunho-` é material de montagem
 *       e `tpl-` é CONQUISTADO: só pode nomear um COMPONENT aprovado
 *       para promoção, com binding e carimbo. FRAME chamado `tpl-` ou
 *       COMPONENT chamado `ref-` misturam estados distintos — ver
 *       "O prefixo tpl- é CONQUISTADO" em docs/estrutura-lib.md.
 *    2. Prefixo `_` bloqueia publicação. Um `_secoes/x` é intencional;
 *       um `_` no meio do caminho de um template publicável não é.
 *    3. Auto layout precisa dos DOIS eixos de sizing definidos
 *       explicitamente, senão o frame trava em 100x100 (regra 44 de
 *       figma-plugin-api/SKILL.md).
 *    4. Cluster nunca entra no nome do componente (cluster é mode).
 *    5. Todo template declara no carimbo se é padrão ou especialização.
 *
 * Uso via use_figma (a skill figma-use DEVE estar carregada):
 *   cole a função e chame
 *   `return await validateCreation([{ id: '1:2', type: 'COMPONENT', children: 3 }])`
 *
 * @param {Array<{
 *   id: string,
 *   type?: string,            // tipo esperado, ex: 'COMPONENT'
 *   name?: string|RegExp,     // nome exato ou padrão
 *   children?: number|{min?: number, max?: number},
 *   autoLayout?: boolean,     // exige layoutMode !== 'NONE'
 *   bound?: string[],         // propriedades que devem ter variável bindada
 *   description?: boolean     // exige description não vazia (carimbo)
 * }>} expected - nós declarados como criados/mutados.
 * @param {object} [opts]
 * @param {string[]} [opts.clusterIds=[]] - ids de cluster (ex: ['c1-mg'])
 *   para a checagem 4. Sem isso ela é pulada.
 * @param {string} [opts.contentCollectionId] - collection que contém o
 *   conteúdo variável por cluster. Quando informada, o script exige ao menos
 *   um binding real dessa collection e proíbe mode explícito no
 *   template-mestre. Use validateContentContract para conferir cada papel
 *   aprovado e sua variável específica.
 * @returns {Promise<{
 *   checked: number,
 *   missing: Array<{id: string}>,
 *   wrongType: Array<{id: string, expected: string, actual: string}>,
 *   wrongName: Array<{id: string, expected: string, actual: string}>,
 *   wrongChildCount: Array<{id: string, name: string, expected: string, actual: number}>,
 *   missingAutoLayout: Array<{id: string, name: string}>,
 *   missingBindings: Array<{id: string, name: string, prop: string}>,
 *   missingContentBindings: Array<{id: string, name: string, collectionId: string}>,
 *   missingDescription: Array<{id: string, name: string}>,
 *   pinnedContentModes: Array<{id: string, name: string, collectionId: string, modeId: string}>,
 *   conventionViolations: Array<{id: string, name: string, rule: string, detail: string}>,
 *   passed: boolean
 * }>}
 */
async function validateCreation(expected, opts = {}) {
  const clusterIds = opts.clusterIds ?? []
  const contentCollectionId = opts.contentCollectionId

  const report = {
    checked: 0,
    missing: [],
    wrongType: [],
    wrongName: [],
    wrongChildCount: [],
    missingAutoLayout: [],
    missingBindings: [],
    missingContentBindings: [],
    missingDescription: [],
    pinnedContentModes: [],
    conventionViolations: [],
    passed: true,
  }

  const hasAnyBinding = (node) => {
    if (node.boundVariables && Object.keys(node.boundVariables).length > 0) return true
    if ('children' in node) {
      for (const c of node.children) if (hasAnyBinding(c)) return true
    }
    return false
  }

  // O binding de conteúdo pode viver em property do componente ou da
  // instância. Tokens visuais aninhados do IDS não provam que o template
  // troca conteúdo por cluster, portanto só contam aliases da collection
  // de conteúdo informada pelo Validador.
  const contentVariableIds = new Set()
  if (contentCollectionId) {
    const variables = await figma.variables.getLocalVariablesAsync()
    for (const variable of variables) {
      if (variable.variableCollectionId === contentCollectionId) {
        contentVariableIds.add(variable.id)
      }
    }
  }

  const variableIdsIn = (value, ids = new Set()) => {
    if (!value || typeof value !== 'object') return ids
    if (value.type === 'VARIABLE_ALIAS' && typeof value.id === 'string') {
      ids.add(value.id)
      return ids
    }
    for (const child of Object.values(value)) variableIdsIn(child, ids)
    return ids
  }

  const hasContentAlias = (value) =>
    [...variableIdsIn(value)].some((id) => contentVariableIds.has(id))

  const hasContentBinding = (node, insideInstance = false) => {
    if ('componentPropertyDefinitions' in node && hasContentAlias(node.componentPropertyDefinitions)) {
      return true
    }
    if ('componentProperties' in node && hasContentAlias(node.componentProperties)) {
      return true
    }
    if (!insideInstance && hasContentAlias(node.boundVariables)) return true
    if ('children' in node) {
      for (const child of node.children) {
        if (hasContentBinding(child, insideInstance || node.type === 'INSTANCE')) return true
      }
    }
    return false
  }

  const pinnedContentModes = (node) => {
    if (!contentCollectionId) return []
    const candidates = [node, ...('children' in node ? node.findAll(() => true) : [])]
    return candidates.flatMap((candidate) => {
      const modeId = candidate.explicitVariableModes?.[contentCollectionId]
      return modeId
        ? [{ id: candidate.id, name: candidate.name, collectionId: contentCollectionId, modeId }]
        : []
    })
  }

  for (const spec of expected) {
    const node = await figma.getNodeByIdAsync(spec.id)
    if (!node) {
      report.missing.push({ id: spec.id })
      continue
    }
    report.checked++

    // --- A) conferência contra a especificação ---

    if (spec.type && node.type !== spec.type) {
      report.wrongType.push({ id: node.id, expected: spec.type, actual: node.type })
    }

    if (spec.name) {
      const ok =
        spec.name instanceof RegExp ? spec.name.test(node.name) : node.name === spec.name
      if (!ok) {
        report.wrongName.push({
          id: node.id,
          expected: String(spec.name),
          actual: node.name,
        })
      }
    }

    if (spec.children != null && 'children' in node) {
      const n = node.children.length
      const c = spec.children
      const min = typeof c === 'number' ? c : c.min ?? -Infinity
      const max = typeof c === 'number' ? c : c.max ?? Infinity
      if (n < min || n > max) {
        report.wrongChildCount.push({
          id: node.id,
          name: node.name,
          expected: typeof c === 'number' ? String(c) : `${c.min ?? '-'}..${c.max ?? '-'}`,
          actual: n,
        })
      }
    }

    if (spec.autoLayout && (!('layoutMode' in node) || node.layoutMode === 'NONE')) {
      report.missingAutoLayout.push({ id: node.id, name: node.name })
    }

    for (const prop of spec.bound ?? []) {
      if (!node.boundVariables || !node.boundVariables[prop]) {
        report.missingBindings.push({ id: node.id, name: node.name, prop })
      }
    }

    if (spec.description && !(node.description && node.description.trim())) {
      report.missingDescription.push({ id: node.id, name: node.name })
    }

    // --- B) convenções do projeto ---

    const base = node.name.split('/').pop()

    if (contentCollectionId) {
      if (!hasContentBinding(node)) {
        report.missingContentBindings.push({
          id: node.id,
          name: node.name,
          collectionId: contentCollectionId,
        })
      }
      report.pinnedContentModes.push(...pinnedContentModes(node))
    }

    // 1. Estados de montagem e publicação
    if (base.startsWith('ref-') && (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET')) {
      report.conventionViolations.push({
        id: node.id,
        name: node.name,
        rule: 'referencia-crua',
        detail: 'ref- e referencia humana, nao COMPONENT. Preserve a referencia e use _rascunho- para a copia de montagem',
      })
    }

    if (base.startsWith('_rascunho-') && node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET') {
      report.conventionViolations.push({
        id: node.id,
        name: node.name,
        rule: 'rascunho-componentizado',
        detail: '_rascunho- precisa ser COMPONENT ou COMPONENT_SET para seguir para validacao',
      })
    }

    // tpl- é conquistado: COMPONENT + binding + carimbo
    if (base.startsWith('tpl-')) {
      if (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET') {
        report.conventionViolations.push({
          id: node.id,
          name: node.name,
          rule: 'tpl-conquistado',
          detail: `nomeado tpl- mas é ${node.type}, não COMPONENT. Renomear para _rascunho-<etapa>-<nome> ou componentizar de verdade`,
        })
      } else {
        const hasRequiredBinding = contentCollectionId
          ? hasContentBinding(node)
          : hasAnyBinding(node)
        if (!hasRequiredBinding) {
          report.conventionViolations.push({
            id: node.id,
            name: node.name,
            rule: 'tpl-conquistado',
            detail: contentCollectionId
              ? 'nomeado tpl- mas não tem binding da collection de conteúdo: ainda não adapta por cluster'
              : 'nomeado tpl- mas não tem nenhum binding: ainda é rascunho de montagem',
          })
        }
        if (!(node.description && node.description.trim())) {
          report.conventionViolations.push({
            id: node.id,
            name: node.name,
            rule: 'tpl-conquistado',
            detail: 'nomeado tpl- mas sem carimbo (description vazia)',
          })
        }
        if (node.description && node.description.trim() && !node.description.includes('[Especializacao]')) {
          report.conventionViolations.push({
            id: node.id,
            name: node.name,
            rule: 'carimbo-especializacao',
            detail: 'template sem [Especializacao] no carimbo: declare padrao ou o ID funcional aprovado',
          })
        }
      }
    }

    // 2. prefixo _ bloqueia publicação
    if (base.startsWith('_') && base.includes('tpl-')) {
      report.conventionViolations.push({
        id: node.id,
        name: node.name,
        rule: 'prefixo-underscore',
        detail: 'template com prefixo _ nunca será publicado; _ é só para seções internas',
      })
    }

    // 3. auto layout exige os DOIS eixos de sizing (regra 44)
    if ('layoutMode' in node && node.layoutMode !== 'NONE') {
      for (const axis of ['primaryAxisSizingMode', 'counterAxisSizingMode']) {
        if (!(axis in node) || node[axis] == null) {
          report.conventionViolations.push({
            id: node.id,
            name: node.name,
            rule: 'sizing-explicito',
            detail: `${axis} não definido: o frame pode travar em 100x100`,
          })
        }
      }
    }

    // 4. cluster não entra no nome do componente (cluster é mode)
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      for (const cid of clusterIds) {
        if (node.name.includes(cid)) {
          report.conventionViolations.push({
            id: node.id,
            name: node.name,
            rule: 'cluster-e-mode',
            detail: `nome contém o cluster "${cid}": cluster é mode, nunca entra no nome do componente`,
          })
        }
      }
    }
  }

  report.passed =
    report.missing.length === 0 &&
    report.wrongType.length === 0 &&
    report.wrongName.length === 0 &&
    report.wrongChildCount.length === 0 &&
    report.missingAutoLayout.length === 0 &&
    report.missingBindings.length === 0 &&
    report.missingContentBindings.length === 0 &&
    report.missingDescription.length === 0 &&
    report.pinnedContentModes.length === 0 &&
    report.conventionViolations.length === 0

  return report
}
