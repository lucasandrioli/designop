/*
 * Coletor para ser executado DENTRO de use_figma pelo Analista.
 *
 * Este arquivo nao roda o MCP sozinho. O Analista deve ler e colar o corpo
 * abaixo e chamar:
 * `return await collectPrototypeReactions('<node-id-da-pagina>', '<node-id-da-secao>', { part: 1, pageSize: 10 })`.
 * Uma secao por chamada evita que uma leitura completa seja truncada pelo
 * cliente. Se houver mais de uma parte, leia todas. A pagina e carregada
 * explicitamente, pois o contexto de pagina reinicia a cada chamada do MCP.
 */

async function collectPrototypeReactions(pageId, sectionId, opts = {}) {
  const page = figma.root.children.find((candidate) => candidate.id === pageId);
  if (!page) throw new Error(`Pagina da etapa invalida: ${pageId}`);
  await figma.setCurrentPageAsync(page);

  const section = page.findOne((node) => node.id === sectionId);
  if (!section || section.type !== 'SECTION') {
    throw new Error(`Secao de referencia invalida: ${sectionId}`);
  }

  const nodesById = new Map();
  const visit = (node, path) => {
    nodesById.set(node.id, { id: node.id, name: node.name, path });
    if ('children' in node) {
      for (const child of node.children) visit(child, `${path}/${child.name}`);
    }
  };

  visit(section, section.name);
  const allNodes = [section, ...section.findAll(() => true)];
  const withReactions = allNodes.filter(
    (node) => 'reactions' in node && Array.isArray(node.reactions) && node.reactions.length > 0,
  );
  const requestedPart = Number.isInteger(opts.part) ? opts.part : 1
  const pageSize = Number.isInteger(opts.pageSize) ? Math.min(Math.max(opts.pageSize, 1), 10) : 10
  const totalParts = Math.max(1, Math.ceil(withReactions.length / pageSize))
  if (requestedPart < 1 || requestedPart > totalParts) {
    throw new Error(`Parte de reacoes invalida: ${requestedPart}/${totalParts}`)
  }
  const start = (requestedPart - 1) * pageSize
  const reactionsThisPart = withReactions.slice(start, start + pageSize)

  const nodeTarget = async (nodeId) => {
    if (!nodeId) return null
    const local = nodesById.get(nodeId)
    if (local) return { ...local, scope: 'SECTION' }
    const node = await figma.getNodeByIdAsync(nodeId)
    return node
      ? { id: node.id, name: node.name, path: null, scope: 'FORA_DA_SECTION' }
      : { id: nodeId, name: null, path: null, scope: 'NAO_RESOLVIDO' }
  }
  const actionSummary = async (action) => {
    const actionType = action.type ?? null
    if (actionType === 'NODE' || action.destinationId) {
      const nodeId = action.destinationId ?? null
      return {
        actionType,
        navigation: action.navigation ?? null,
        target: { kind: 'NODE', node: await nodeTarget(nodeId) },
        transition: action.transition ?? null,
      }
    }
    if (actionType === 'URL' || action.url) {
      return {
        actionType,
        navigation: action.navigation ?? null,
        target: { kind: 'URL', url: action.url ?? null },
        transition: action.transition ?? null,
      }
    }
    if (actionType === 'BACK') {
      return { actionType, navigation: action.navigation ?? null, target: { kind: 'BACK' }, transition: action.transition ?? null }
    }
    if (actionType === 'CLOSE') {
      return { actionType, navigation: action.navigation ?? null, target: { kind: 'CLOSE' }, transition: action.transition ?? null }
    }
    return { actionType, navigation: action.navigation ?? null, target: { kind: 'UNKNOWN' }, transition: action.transition ?? null }
  }

  return {
    paginacao: {
      parteAtual: requestedPart,
      totalPartes: totalParts,
      pageSize,
      totalItens: withReactions.length,
      itensNestaParte: reactionsThisPart.length,
    },
    cobertura: {
      secao: section.name,
      nodeId: section.id,
      nodesInspecionados: allNodes.length,
      nodesComReacao: withReactions.length,
      coletor: 'scripts/collectPrototypeReactions.js',
      status: totalParts === 1 ? 'COBERTA' : 'PARCIAL',
    },
    reacoes: await Promise.all(reactionsThisPart.map(async (node) => ({
      origem: nodesById.get(node.id),
      reactions: await Promise.all(node.reactions.map(async (reaction) => ({
        gatilho: reaction.trigger,
        acoes: await Promise.all((reaction.actions ?? []).map(actionSummary)),
      }))),
    }))),
  };
}
