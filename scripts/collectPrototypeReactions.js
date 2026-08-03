/*
 * Coletor para ser executado DENTRO de use_figma pelo Analista.
 *
 * Este arquivo nao roda o MCP sozinho. O Analista deve ler e colar o corpo
 * abaixo e chamar:
 * `return await collectPrototypeReactions('<node-id-da-pagina>', '<node-id-da-secao>')`.
 * Uma secao por chamada evita que uma leitura completa seja truncada pelo
 * cliente. A pagina e carregada explicitamente, pois o contexto de pagina
 * reinicia a cada chamada do MCP.
 */

async function collectPrototypeReactions(pageId, sectionId) {
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

  const actionSummary = (action) => ({
    type: action.type,
    navigation: action.navigation ?? null,
    destinationId: action.destinationId ?? null,
    destination: action.destinationId ? nodesById.get(action.destinationId) ?? null : null,
    transition: action.transition ?? null,
  });

  return {
    cobertura: {
      secao: section.name,
      nodeId: section.id,
      nodesInspecionados: allNodes.length,
      nodesComReacao: withReactions.length,
      coletor: 'scripts/collectPrototypeReactions.js',
    },
    reacoes: withReactions.map((node) => ({
      origem: nodesById.get(node.id),
      reactions: node.reactions.map((reaction) => ({
        gatilho: reaction.trigger,
        acoes: reaction.actions.map(actionSummary),
      })),
    })),
  };
}
