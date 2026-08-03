/**
 * validateInteractionContract
 *
 * Confere somente as acoes de prototipo declaradas pelo contrato de uma
 * tela. Nao conhece elementos de layout, modalidade ou etapa: estrutura e
 * geometria pertencem a validateReconstructionContract.
 *
 * Uso via use_figma:
 *
 * return await validateInteractionContract('123:456', {
 *   motionProfiles: {
 *     'saida-padrao': {
 *       trigger: { type: 'ON_CLICK' },
 *       transition: {
 *         type: 'DISSOLVE',
 *         duration: 0.2,
 *         easing: { type: 'CUSTOM_CUBIC_BEZIER', cubicBezier: { x1: 0.2, y1: 0, x2: 0, y2: 1 } },
 *       },
 *     },
 *   },
 *   reactions: [
 *     { name: 'acao-editar', expected: 'destination', destinationName: 'tela-edicao', motionProfile: 'saida-padrao' },
 *     { name: 'acao-voltar', expected: 'back' },
 *     {
 *       name: 'carregando',
 *       expected: 'destination',
 *       destinationName: 'resultado',
 *       trigger: { type: 'AFTER_TIMEOUT', timeout: 1200 },
 *       transition: {
 *         type: 'DISSOLVE',
 *         duration: 0.2,
 *         easing: { type: 'CUSTOM_CUBIC_BEZIER', cubicBezier: { x1: 0.2, y1: 0, x2: 0, y2: 1 } },
 *       },
 *     },
 *     { name: 'acao-opcional', optional: true, expected: 'destination' },
 *   ],
 * })
 *
 * @param {string} rootNodeId frame da tela
 * @param {{
 *   motionProfiles?: Record<string, {
 *     trigger?: { type: string, timeout?: number },
 *     transition?: {
 *       type?: string,
 *       duration?: number,
 *       easing?: {
 *         type?: string,
 *         cubicBezier?: { x1: number, y1: number, x2: number, y2: number }
 *       }
 *     }
 *   }>,
 *   reactions?: Array<{
 *     name: string,
 *     optional?: boolean,
 *     expected?: 'destination'|'back'|'any',
 *     destinationName?: string,
 *     motionProfile?: string,
 *     trigger?: { type: string, timeout?: number },
 *     transition?: {
 *       type?: string,
 *       duration?: number,
 *       easing?: {
 *         type?: string,
 *         cubicBezier?: { x1: number, y1: number, x2: number, y2: number }
 *       }
 *     },
 *     tolerance?: number
 *   }>
 * }} contract
 */
async function validateInteractionContract(rootNodeId, contract = {}) {
  const root = await figma.getNodeByIdAsync(rootNodeId)
  if (!root) throw new Error(`Node ${rootNodeId} nao encontrado`)

  const report = {
    rootId: root.id,
    rootName: root.name,
    contractIssues: [],
    reactionIssues: [],
    passed: false,
  }
  const nodes = [root, ...('children' in root ? root.findAll(() => true) : [])]
  const byName = (name) => nodes.filter((node) => node.name === name)
  const nearlyEqual = (actual, expected, tolerance) =>
    typeof actual === 'number' && Math.abs(actual - expected) <= tolerance

  for (const rule of contract.reactions ?? []) {
    if (!rule || !rule.name) {
      report.contractIssues.push({ reason: 'regra de reacao sem name' })
      continue
    }
    const expected = rule.expected ?? 'any'
    if (!['destination', 'back', 'any'].includes(expected)) {
      report.contractIssues.push({ name: rule.name, reason: 'expected precisa ser destination, back ou any' })
      continue
    }
    const profile = rule.motionProfile ? contract.motionProfiles?.[rule.motionProfile] : null
    if (rule.motionProfile && !profile) {
      report.contractIssues.push({ name: rule.name, profile: rule.motionProfile, reason: 'perfil de movimento inexistente' })
      continue
    }
    if (profile && (rule.trigger || rule.transition)) {
      report.contractIssues.push({ name: rule.name, reason: 'perfil de movimento nao pode ser combinado com trigger ou transition locais' })
      continue
    }
    const triggerRule = profile?.trigger ?? rule.trigger
    const transitionRule = profile?.transition ?? rule.transition
    const matches = byName(rule.name)
    if (matches.length === 0) {
      if (!rule.optional) report.reactionIssues.push({ name: rule.name, reason: 'acao obrigatoria ausente' })
      continue
    }
    if (matches.length > 1) {
      report.reactionIssues.push({ name: rule.name, count: matches.length, reason: 'acao ambigua' })
      continue
    }
    const reactions = matches[0].reactions ?? []
    if (reactions.length === 0) {
      report.reactionIssues.push({ name: rule.name, reason: 'acao sem reacao de prototipo' })
      continue
    }
    const tolerance = rule.tolerance ?? 0.0001
    let contractReactions = reactions

    if (triggerRule) {
      if (!triggerRule.type) {
        report.contractIssues.push({ name: rule.name, reason: 'trigger sem type' })
        continue
      }
      contractReactions = reactions.filter((reaction) => reaction.trigger?.type === triggerRule.type)
      if (contractReactions.length === 0) {
        report.reactionIssues.push({
          name: rule.name,
          expectedTrigger: triggerRule.type,
          actualTriggers: reactions.map((reaction) => reaction.trigger?.type ?? null),
          reason: 'gatilho de prototipo diverge do contrato',
        })
        continue
      }
      if (typeof triggerRule.timeout === 'number') {
        const hasExpectedTimeout = contractReactions.some((reaction) =>
          nearlyEqual(reaction.trigger?.timeout, triggerRule.timeout, tolerance),
        )
        if (!hasExpectedTimeout) {
          report.reactionIssues.push({
            name: rule.name,
            expectedTimeout: triggerRule.timeout,
            actualTimeouts: contractReactions.map((reaction) => reaction.trigger?.timeout ?? null),
            reason: 'atraso do gatilho diverge do contrato',
          })
          continue
        }
      }
    }

    if (transitionRule) {
      const transitions = []
      for (const reaction of contractReactions) {
        for (const action of reaction.actions ?? []) {
          if (action.type === 'NODE' && action.transition) transitions.push(action.transition)
        }
      }
      if (transitions.length === 0) {
        report.reactionIssues.push({ name: rule.name, reason: 'acao sem transicao de navegacao' })
        continue
      }
      const hasExpectedTransition = transitions.some((transition) => {
        if (transitionRule.type && transition.type !== transitionRule.type) return false
        if (typeof transitionRule.duration === 'number' && !nearlyEqual(transition.duration, transitionRule.duration, tolerance)) return false
        if (transitionRule.easing?.type && transition.easing?.type !== transitionRule.easing.type) return false
        const expectedBezier = transitionRule.easing?.cubicBezier
        if (expectedBezier) {
          const actualBezier = transition.easing?.easingFunctionCubicBezier
          if (!actualBezier || !Object.entries(expectedBezier).every(([key, value]) => nearlyEqual(actualBezier[key], value, tolerance))) return false
        }
        return true
      })
      if (!hasExpectedTransition) {
        report.reactionIssues.push({
          name: rule.name,
          expectedTransition: transitionRule,
          actualTransitions: transitions,
          reason: 'transicao de prototipo diverge do contrato',
        })
        continue
      }
    }
    if (expected === 'destination') {
      const destinations = []
      for (const reaction of contractReactions) {
        for (const action of reaction.actions ?? []) {
          if (action.type === 'NODE' && action.destinationId) {
            const target = await figma.getNodeByIdAsync(action.destinationId)
            destinations.push({ id: action.destinationId, name: target?.name ?? null })
          }
        }
      }
      if (destinations.length === 0) {
        report.reactionIssues.push({ name: rule.name, reason: 'acao sem destino de navegacao' })
      } else if (rule.destinationName && !destinations.some((target) => target.name === rule.destinationName)) {
        report.reactionIssues.push({
          name: rule.name,
          expectedDestination: rule.destinationName,
          actualDestinations: destinations,
          reason: 'destino de navegacao diverge do contrato',
        })
      }
    }
    if (expected === 'back') {
      const hasBack = contractReactions.some((reaction) =>
        (reaction.actions ?? []).some((action) => action.type === 'BACK'),
      )
      if (!hasBack) report.reactionIssues.push({ name: rule.name, reason: 'acao sem retorno de prototipo' })
    }
  }

  report.passed = report.contractIssues.length === 0 && report.reactionIssues.length === 0
  return report
}
