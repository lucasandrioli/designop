/*
 * Reconciliacao operacional para executar DENTRO de use_figma, depois de
 * carregar validateReferenceScopeCore.js, validateAnalysisManifestCore.js e
 * ler analise.json e referencias.json recem-gravados.
 *
 * Uso:
 * const report = await reconcileAnalysisManifestFigma(manifest, referenceScope);
 * return report;
 *
 * Nao altera o arquivo Figma. Ela compara o manifesto com a pagina e as
 * Sections que existem agora; nao e uma prova de ordem dos passos do chat.
 */
async function reconcileAnalysisManifestFigma(manifest, referenceScope) {
  const failures = [];
  if (typeof validateAnalysisManifestData !== 'function') {
    return {
      passed: false,
      failures: ['validateAnalysisManifestData ausente; carregue validateAnalysisManifestCore.js antes da reconciliacao'],
      secoes: [],
    };
  }

  failures.push(...validateAnalysisManifestData(manifest, referenceScope));
  const pageId = manifest?.fontes?.figma?.descoberta?.paginaNodeId ?? manifest?.fontes?.figma?.pagina;
  const page = figma.root.children.find((candidate) => candidate.id === pageId);
  if (!page) {
    return { passed: false, failures: [...failures, 'pagina do manifesto nao existe no Figma atual: ' + pageId], secoes: [] };
  }

  const expectedItems = (total, pageSize) => {
    const totalParts = Math.max(1, Math.ceil(total / pageSize));
    return Array.from({ length: totalParts }, (_, index) => Math.max(0, Math.min(pageSize, total - index * pageSize)));
  };
  const targetFromAction = (action) => {
    if (action?.type === 'NODE' || action?.destinationId) return { kind: 'NODE', id: action.destinationId ?? null };
    if (action?.type === 'URL' || action?.url) return { kind: 'URL', url: action.url ?? null };
    if (action?.type === 'BACK') return { kind: 'BACK' };
    if (action?.type === 'CLOSE') return { kind: 'CLOSE' };
    return { kind: 'UNKNOWN' };
  };
  const manifestTargetMatches = (entry, expected) => {
    if (entry?.target?.kind !== expected.kind) return false;
    if (expected.kind === 'NODE') return entry.target?.node?.id === expected.id;
    if (expected.kind === 'URL') return entry.target?.url === expected.url;
    return true;
  };
  const triggerType = (trigger) => typeof trigger === 'string' ? trigger : trigger?.type;
  const sections = [];

  for (const reference of manifest?.fontes?.figma?.secoesReferencia ?? []) {
    const section = page.findOne((node) => node.id === reference.nodeId);
    if (!section || section.type !== 'SECTION') {
      failures.push('Section de referencia nao existe no Figma atual: ' + reference.nodeId);
      continue;
    }
    if (section.name !== reference.nome) {
      failures.push('Section de referencia mudou de nome no Figma atual: ' + reference.nodeId);
      continue;
    }

    const nodes = [section, ...section.findAll(() => true)];
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const parentById = new Map(nodes.map((node) => [node.id, node.parent?.id ?? null]));
    const isInside = (nodeId, ancestorId) => {
      let current = parentById.get(nodeId);
      while (current) {
        if (current === ancestorId) return true;
        current = parentById.get(current);
      }
      return false;
    };
    const nodesWithReactions = nodes.filter((node) => 'reactions' in node && Array.isArray(node.reactions) && node.reactions.length > 0);
    const reactionCoverage = (manifest?.coberturaReacoes ?? []).find((coverage) => coverage.nodeId === section.id);
    const structureCoverage = (manifest?.coberturaEstrutura ?? []).find((coverage) => coverage.nodeId === section.id);

    if (!reactionCoverage) {
      failures.push('manifesto sem cobertura de reacoes para Section atual: ' + section.id);
    } else {
      const items = expectedItems(nodesWithReactions.length, reactionCoverage.pageSize);
      if (reactionCoverage.nodesInspecionados !== nodes.length) failures.push('cobertura de reacoes com nodesInspecionados divergente: ' + section.id);
      if (reactionCoverage.nodesComReacao !== nodesWithReactions.length) failures.push('cobertura de reacoes com nodesComReacao divergente: ' + section.id);
      if (reactionCoverage.totalItens !== nodesWithReactions.length) failures.push('cobertura de reacoes com totalItens divergente: ' + section.id);
      if (reactionCoverage.totalPartes !== items.length || JSON.stringify(reactionCoverage.itensPorParte) !== JSON.stringify(items)) failures.push('paginacao de reacoes divergente no Figma atual: ' + section.id);
    }
    if (!structureCoverage) {
      failures.push('manifesto sem cobertura estrutural para Section atual: ' + section.id);
    } else {
      const items = expectedItems(nodes.length, structureCoverage.pageSize);
      if (structureCoverage.nodesInspecionados !== nodes.length) failures.push('cobertura estrutural com nodesInspecionados divergente: ' + section.id);
      if (structureCoverage.totalItens !== nodes.length) failures.push('cobertura estrutural com totalItens divergente: ' + section.id);
      if (structureCoverage.totalPartes !== items.length || JSON.stringify(structureCoverage.itensPorParte) !== JSON.stringify(items)) failures.push('paginacao estrutural divergente no Figma atual: ' + section.id);
    }

    for (const node of nodesWithReactions) {
      for (const reaction of node.reactions) {
        for (const action of reaction.actions ?? []) {
          const target = targetFromAction(action);
          const observed = (manifest?.reacoes ?? []).some((entry) =>
            entry?.status === 'OBSERVADA' &&
            entry?.fonte === 'FIGMA' &&
            entry?.origem?.nodeId === node.id &&
            triggerType(entry?.gatilho) === triggerType(reaction.trigger) &&
            manifestTargetMatches(entry, target),
          );
          if (!observed) failures.push('reacao atual ausente ou divergente no manifesto: ' + node.id);
        }
      }
    }

    const evidence = (manifest?.evidenciasEstruturais ?? []).filter((item) => item?.sectionId === section.id);
    const evidenceByNodeId = new Map(evidence.map((item) => [item.nodeId, item]));
    const remoteInstances = nodes.filter((node) => node.type === 'INSTANCE' && node.mainComponent?.remote === true);
    const localExisting = nodes.filter((node) =>
      (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') ||
      (node.type === 'INSTANCE' && node.mainComponent?.id && node.mainComponent?.remote !== true),
    );
    const detached = nodes.filter((node) => Boolean(node.detachedInfo));
    for (const node of remoteInstances) {
      const item = evidenceByNodeId.get(node.id);
      if (!item || item.tipoEncontrado !== 'INSTANCIA_IDS') failures.push('instancia IDS atual sem evidencia estrutural: ' + node.id);
      else if (!item.componentKey || item.componentKey !== node.mainComponent?.key) failures.push('instancia IDS com key divergente no manifesto: ' + node.id);
    }
    for (const node of localExisting) {
      const nestedIds = remoteInstances.filter((instance) => isInside(instance.id, node.id));
      const item = evidenceByNodeId.get(node.id);
      const expectedKind = nestedIds.length > 0 ? 'COMPONENTE_LOCAL_COM_IDS' : 'COMPONENTE_LOCAL_EXISTENTE';
      if (!item || item.tipoEncontrado !== expectedKind) failures.push('ativo local atual sem classificacao estrutural correta: ' + node.id);
      if (expectedKind === 'COMPONENTE_LOCAL_COM_IDS' && item) {
        const declared = new Map((item.instanciasIDSDescendentes ?? []).map((entry) => [entry.nodeId, entry.componentKey]));
        for (const instance of nestedIds) {
          if (declared.get(instance.id) !== instance.mainComponent?.key) failures.push('IDS descendente de componente local divergente: ' + instance.id);
        }
      }
    }
    for (const node of detached) {
      const item = evidenceByNodeId.get(node.id);
      if (!item || item.tipoEncontrado !== 'INSTANCIA_DESTACADA') failures.push('instancia destacada atual sem evidencia estrutural: ' + node.id);
    }
    for (const item of evidence) {
      if (!nodeById.has(item.nodeId)) failures.push('evidencia estrutural nao existe na Section atual: ' + item.nodeId);
    }

    sections.push({
      nome: section.name,
      nodeId: section.id,
      nodesInspecionados: nodes.length,
      nodesComReacao: nodesWithReactions.length,
    });
  }

  return { passed: failures.length === 0, failures, secoes: sections };
}

if (typeof module !== 'undefined') module.exports = { reconcileAnalysisManifestFigma };
