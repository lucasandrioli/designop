/*
 * Validador sem dependencias de Node ou Figma. Pode ser colado, junto do
 * objeto `manifest`, em uma chamada use_figma somente de leitura:
 * const failures = validateAnalysisManifestData(manifest);
 * return { passed: failures.length === 0, failures };
 */
function validateAnalysisManifestData(manifest, referenceScope = null) {
  const failures = [];
  const required = ['schemaVersion', 'id', 'rodada', 'etapa', 'status', 'fontes', 'inventario', 'execucoesColeta', 'coberturaReacoes', 'coberturaEstrutura', 'reacoes', 'diferencas', 'lacunas', 'evidenciasEstruturais'];
  for (const field of required) if (!(field in (manifest ?? {}))) failures.push('campo ausente: ' + field);
  if (manifest?.schemaVersion !== 3) failures.push('schemaVersion precisa ser 3');
  if (!manifest?.rodada) failures.push('rodada ausente');
  if (!['PRECISA_CONTEXTO', 'ANALISE_INCOMPLETA', 'NAO_VERIFICAVEL', 'PROPOSTA_PARA_APROVACAO'].includes(manifest?.status)) failures.push('status invalido');
  if (!manifest?.fontes?.figma?.pagina) failures.push('fonte Figma ausente');
  if (manifest?.fontes?.figma?.descoberta?.metodo !== 'figma-get_metadata' || !manifest?.fontes?.figma?.descoberta?.paginaNodeId) {
    failures.push('descoberta atual das referencias via figma-get_metadata ausente');
  }
  if (!Array.isArray(manifest?.fontes?.figma?.secoesReferencia) || manifest.fontes.figma.secoesReferencia.length === 0) failures.push('secoes de referencia ausentes');
  if (!Array.isArray(manifest?.fontes?.documentos?.manuaisContexto)) failures.push('manuais de contexto ausentes');

  const referenceSections = manifest?.fontes?.figma?.secoesReferencia ?? [];
  const referenceByNodeId = new Map();
  const validatePagination = (coverage, label, index, requireAllParts) => {
    if (!Number.isInteger(coverage?.totalPartes) || coverage.totalPartes < 1) {
      failures.push(`${label}[${index}] sem totalPartes valido`);
      return;
    }
    if (!Array.isArray(coverage?.partesLidas)) {
      failures.push(`${label}[${index}] sem partesLidas`);
      return;
    }
    if (!Number.isInteger(coverage?.pageSize) || coverage.pageSize < 1) failures.push(`${label}[${index}] sem pageSize valido`);
    if (!Number.isInteger(coverage?.totalItens) || coverage.totalItens < 0) failures.push(`${label}[${index}] sem totalItens valido`);
    if (!Array.isArray(coverage?.itensPorParte)) {
      failures.push(`${label}[${index}] sem itensPorParte`);
    } else if (Number.isInteger(coverage?.pageSize) && Number.isInteger(coverage?.totalItens)) {
      const expectedParts = Math.max(1, Math.ceil(coverage.totalItens / coverage.pageSize));
      const expectedItems = Array.from({ length: expectedParts }, (_, part) => Math.max(0, Math.min(coverage.pageSize, coverage.totalItens - part * coverage.pageSize)));
      if (coverage.totalPartes !== expectedParts || coverage.itensPorParte.length !== expectedItems.length || coverage.itensPorParte.some((value, part) => value !== expectedItems[part])) {
        failures.push(`${label}[${index}] possui distribuicao de partes invalida`);
      }
    }
    const parts = [...new Set(coverage.partesLidas)];
    const expected = Array.from({ length: coverage.totalPartes }, (_, part) => part + 1);
    const partsInvalid = parts.length !== coverage.partesLidas.length
      || parts.some((part, position) => part !== coverage.partesLidas[position])
      || parts.some((part, position) => position > 0 && part <= parts[position - 1])
      || parts.some((part) => !expected.includes(part));
    if (partsInvalid || (requireAllParts && (parts.length !== expected.length || parts.some((part, position) => part !== expected[position])))) {
      failures.push(`${label}[${index}] nao comprova leitura de todas as partes`);
    }
  };

  for (const [index, section] of referenceSections.entries()) {
    if (!section?.nome || !section?.nodeId || !section?.contextoId) failures.push('secoesReferencia[' + index + '] incompleta');
    if (referenceByNodeId.has(section?.nodeId)) failures.push('secoesReferencia possui nodeId duplicado: ' + section.nodeId);
    referenceByNodeId.set(section?.nodeId, section);
  }

  if (!referenceScope) {
    failures.push('recorte de referencias ausente; carregue referencias.json da rodada');
  } else {
    if (referenceScope.schemaVersion !== 1 || !referenceScope.id || !referenceScope.rodada) failures.push('recorte de referencias invalido');
    if (!referenceScope?.figma?.pageId || !referenceScope?.figma?.pageName) failures.push('recorte de referencias sem pagina Figma');
    if (referenceScope?.ativosForaDoRecorte !== 'IGNORAR') failures.push('recorte precisa ignorar ativos fora das Sections selecionadas');
    if (referenceScope?.ativosExistentes?.politica !== 'EVIDENCIA_APENAS' || referenceScope?.ativosExistentes?.adocaoAutomatica !== false) {
      failures.push('recorte precisa tratar ativos existentes como evidencia sem adocao automatica');
    }
    const scopedSections = referenceScope?.figma?.secoes ?? [];
    if (!Array.isArray(scopedSections) || scopedSections.length === 0) failures.push('recorte de referencias sem Sections selecionadas');
    const scopedById = new Map();
    for (const [index, section] of scopedSections.entries()) {
      if (!section?.nome || !section?.sectionId || !section?.contextoId) failures.push('recorte.figma.secoes[' + index + '] incompleta');
      if (!String(section?.nome ?? '').startsWith('ref-')) failures.push('recorte.figma.secoes[' + index + '] precisa usar referencia ref-*');
      if (scopedById.has(section?.sectionId)) failures.push('recorte possui Section duplicada: ' + section.sectionId);
      scopedById.set(section?.sectionId, section);
    }
    if (referenceScope?.figma?.pageId !== manifest?.fontes?.figma?.descoberta?.paginaNodeId) failures.push('recorte aponta para pagina diferente da descoberta do manifesto');
    if (scopedById.size !== referenceByNodeId.size) failures.push('recorte e manifesto possuem quantidade diferente de Sections');
    for (const section of referenceSections) {
      const scoped = scopedById.get(section.nodeId);
      if (!scoped || scoped.nome !== section.nome || scoped.contextoId !== section.contextoId) failures.push('Section do manifesto nao corresponde ao recorte: ' + section.nodeId);
    }
  }
  for (const [index, item] of (manifest?.inventario ?? []).entries()) {
    if (!item.tela || !item.modalidade || !item.contextoId || !item.frame?.nome || !item.frame?.nodeId) failures.push('inventario[' + index + '] sem tela, modalidade, contextoId ou frame');
  }

  const observedKinds = new Set([
    'INSTANCIA_IDS',
    'COMPONENTE_LOCAL_EXISTENTE',
    'COMPONENTE_LOCAL_COM_IDS',
    'INSTANCIA_DESTACADA',
    'LOCAL_LAYOUT',
    'VALOR_MANUAL',
    'BINDING_EXISTENTE',
    'TEMPLATE_EXISTENTE',
  ]);
  const decisions = new Set(['EVIDENCIA_APENAS', 'CANDIDATO_IDS', 'CANDIDATO_COMPONENTE_LOCAL', 'LOCAL_LAYOUT', 'CONFIRMAR']);
  const structuralEvidenceByNodeId = new Map();
  if (!Array.isArray(manifest?.evidenciasEstruturais)) failures.push('evidenciasEstruturais precisa ser uma lista');
  for (const [index, evidence] of (manifest?.evidenciasEstruturais ?? []).entries()) {
    if (!evidence?.nodeId || !evidence?.sectionId || !evidence?.nome) failures.push('evidenciasEstruturais[' + index + '] sem nodeId, Section ou nome');
    if (!observedKinds.has(evidence?.tipoEncontrado)) failures.push('evidenciasEstruturais[' + index + '] sem tipoEncontrado valido');
    if (!decisions.has(evidence?.decisao)) failures.push('evidenciasEstruturais[' + index + '] sem decisao valida');
    if (!referenceByNodeId.has(evidence?.sectionId)) failures.push('evidenciasEstruturais[' + index + '] aponta para Section fora do recorte');
    if (structuralEvidenceByNodeId.has(evidence?.nodeId)) failures.push('evidenciasEstruturais possui nodeId duplicado: ' + evidence.nodeId);
    structuralEvidenceByNodeId.set(evidence?.nodeId, evidence);
    if (['COMPONENTE_LOCAL_EXISTENTE', 'COMPONENTE_LOCAL_COM_IDS', 'INSTANCIA_DESTACADA', 'TEMPLATE_EXISTENTE'].includes(evidence?.tipoEncontrado) && !['EVIDENCIA_APENAS', 'CONFIRMAR'].includes(evidence?.decisao)) {
      failures.push('ativo pre-existente nao pode ser adotado automaticamente: ' + evidence.nodeId);
    }
    if (evidence?.tipoEncontrado === 'COMPONENTE_LOCAL_COM_IDS') {
      if (!Array.isArray(evidence?.instanciasIDSDescendentes) || evidence.instanciasIDSDescendentes.length === 0 || evidence.instanciasIDSDescendentes.some((item) => !item?.nodeId || !item?.componentKey)) {
        failures.push('componente local com IDS precisa registrar instancias IDS descendentes: ' + evidence.nodeId);
      }
    }
  }

  const coverageByNodeId = new Map();
  for (const [index, coverage] of (manifest?.coberturaReacoes ?? []).entries()) {
    if (!coverage?.secao || !coverage?.nodeId || !Number.isInteger(coverage?.nodesInspecionados) || coverage.nodesInspecionados < 1 || !Number.isInteger(coverage?.nodesComReacao) || coverage.nodesComReacao < 0) {
      failures.push('coberturaReacoes[' + index + '] incompleta');
      continue;
    }
    if (coverage.coletor !== 'scripts/collectPrototypeReactions.js') failures.push('coberturaReacoes[' + index + '] precisa usar scripts/collectPrototypeReactions.js');
    if (!['COBERTA', 'PARCIAL', 'FALHOU'].includes(coverage.status)) failures.push('coberturaReacoes[' + index + '] possui status invalido');
    const requiresAllParts = manifest?.status === 'PROPOSTA_PARA_APROVACAO' || coverage.status === 'COBERTA';
    validatePagination(coverage, 'coberturaReacoes', index, requiresAllParts);
    const referencedSection = referenceByNodeId.get(coverage.nodeId);
    if (!referencedSection) failures.push('coberturaReacoes[' + index + '] aponta para Section que nao e referencia');
    else if (referencedSection.nome !== coverage.secao) failures.push('coberturaReacoes[' + index + '] nao corresponde ao nome da Section de referencia');
    if (coverage.nodesComReacao > coverage.nodesInspecionados) failures.push('coberturaReacoes[' + index + '] possui contagem de reacoes invalida');
    if (coverageByNodeId.has(coverage.nodeId)) failures.push('coberturaReacoes possui nodeId duplicado: ' + coverage.nodeId);
    coverageByNodeId.set(coverage.nodeId, coverage);
  }

  const structureByNodeId = new Map();
  for (const [index, coverage] of (manifest?.coberturaEstrutura ?? []).entries()) {
    if (!coverage?.secao || !coverage?.nodeId || !Number.isInteger(coverage?.nodesInspecionados) || coverage.nodesInspecionados < 1) {
      failures.push('coberturaEstrutura[' + index + '] incompleta');
      continue;
    }
    if (coverage.coletor !== 'scripts/collectReferenceStructure.js') failures.push('coberturaEstrutura[' + index + '] precisa usar scripts/collectReferenceStructure.js');
    if (!['COBERTA', 'PARCIAL', 'FALHOU'].includes(coverage.status)) failures.push('coberturaEstrutura[' + index + '] possui status invalido');
    const requiresAllParts = manifest?.status === 'PROPOSTA_PARA_APROVACAO' || coverage.status === 'COBERTA';
    validatePagination(coverage, 'coberturaEstrutura', index, requiresAllParts);
    const referencedSection = referenceByNodeId.get(coverage.nodeId);
    if (!referencedSection) failures.push('coberturaEstrutura[' + index + '] aponta para Section que nao e referencia');
    else if (referencedSection.nome !== coverage.secao) failures.push('coberturaEstrutura[' + index + '] nao corresponde ao nome da Section de referencia');
    if (structureByNodeId.has(coverage.nodeId)) failures.push('coberturaEstrutura possui nodeId duplicado: ' + coverage.nodeId);
    structureByNodeId.set(coverage.nodeId, coverage);
  }

  for (const section of referenceSections) {
    const coverage = coverageByNodeId.get(section.nodeId);
    if (!coverage && manifest?.status === 'PROPOSTA_PARA_APROVACAO') failures.push('secao de referencia sem cobertura de reacoes: ' + section.nodeId);
    else if (coverage && coverage.status !== 'COBERTA' && manifest?.status === 'PROPOSTA_PARA_APROVACAO') failures.push('varredura de reacoes falhou para a secao: ' + section.nodeId);
    const structure = structureByNodeId.get(section.nodeId);
    if (!structure && manifest?.status === 'PROPOSTA_PARA_APROVACAO') failures.push('secao de referencia sem cobertura estrutural: ' + section.nodeId);
    else if (structure && structure.status !== 'COBERTA' && manifest?.status === 'PROPOSTA_PARA_APROVACAO') failures.push('varredura estrutural falhou para a secao: ' + section.nodeId);
  }

  const allowedCollectors = new Set(['scripts/collectPrototypeReactions.js', 'scripts/collectReferenceStructure.js']);
  const coverageEntries = [...(manifest?.coberturaReacoes ?? []), ...(manifest?.coberturaEstrutura ?? [])];
  const expectedExecutions = new Set();
  for (const coverage of coverageEntries) {
    if (!coverage?.coletor || !coverage?.nodeId || !Number.isInteger(coverage?.totalPartes)) continue;
    for (let part = 1; part <= coverage.totalPartes; part += 1) expectedExecutions.add(`${coverage.coletor}\u0000${coverage.nodeId}\u0000${part}`);
  }
  const observedExecutions = new Set();
  for (const [index, execution] of (manifest?.execucoesColeta ?? []).entries()) {
    if (!allowedCollectors.has(execution?.coletor) || !execution?.secao || !execution?.nodeId || !Number.isInteger(execution?.parte) || execution.parte < 1) {
      failures.push('execucoesColeta[' + index + '] incompleta');
      continue;
    }
    const section = referenceByNodeId.get(execution.nodeId);
    if (!section || section.nome !== execution.secao) {
      failures.push('execucoesColeta[' + index + '] nao corresponde a uma Section de referencia');
      continue;
    }
    const executionKey = `${execution.coletor}\u0000${execution.nodeId}\u0000${execution.parte}`;
    if (observedExecutions.has(executionKey)) failures.push('execucoesColeta possui duplicidade de coletor, Section e parte: ' + executionKey);
    observedExecutions.add(executionKey);
    if (!expectedExecutions.has(executionKey)) failures.push('execucoesColeta[' + index + '] nao corresponde a uma parte esperada da cobertura');
  }
  if (manifest?.status === 'PROPOSTA_PARA_APROVACAO') {
    for (const executionKey of expectedExecutions) if (!observedExecutions.has(executionKey)) failures.push('coleta unitaria ausente para ' + executionKey);
  }

  for (const [index, verification] of (manifest?.verificacoesTecnicas ?? []).entries()) {
    if (!verification?.regraId || !Array.isArray(verification?.aplicacao?.secoesReferencia) || verification.aplicacao.secoesReferencia.length === 0) {
      failures.push('verificacoesTecnicas[' + index + '] sem regra ou escopo explicito');
      continue;
    }
    if (!['ATENDIDA', 'VIOLADA', 'NAO_APLICAVEL', 'NAO_VERIFICAVEL'].includes(verification.status)) failures.push('verificacoesTecnicas[' + index + '] sem status valido');
    for (const sectionName of verification.aplicacao.secoesReferencia) {
      if (![...referenceByNodeId.values()].some((section) => section.nome === sectionName)) failures.push('verificacoesTecnicas[' + index + '] aponta para Section fora da rodada: ' + sectionName);
    }
  }

  for (const [index, reaction] of (manifest?.reacoes ?? []).entries()) {
    const origin = reaction?.origem;
    if (!origin?.nodeId || !origin?.nome) failures.push('reacoes[' + index + '] sem origem Figma');
    if (reaction?.gatilho === undefined || reaction?.gatilho === null || reaction?.gatilho === '') failures.push('reacoes[' + index + '] sem gatilho');
    if (!['PRINCIPAL', 'OPCIONAL', 'RETORNO', 'EXCECAO', 'REENCONTRO'].includes(reaction?.tipo)) failures.push('reacoes[' + index + '] sem tipo valido');
    if (!['FIGMA', 'DESIGNER', 'NAO_EXPOSTA'].includes(reaction?.fonte)) failures.push('reacoes[' + index + '] sem fonte valida');
    if (!['OBSERVADA', 'SEM_REACAO_OBSERVADA', 'NAO_VERIFICADA_NESTA_RODADA'].includes(reaction?.status)) failures.push('reacoes[' + index + '] sem status valido');
    if (reaction?.status === 'OBSERVADA') {
      if (reaction.fonte !== 'FIGMA') failures.push('reacoes[' + index + '] observada precisa ter fonte FIGMA');
      const target = reaction.target;
      if (!target?.kind || !['NODE', 'URL', 'BACK', 'CLOSE'].includes(target.kind)) failures.push('reacoes[' + index + '] observada sem target valido');
      else if (target.kind === 'NODE' && (!target.node?.id || !target.node?.name)) failures.push('reacoes[' + index + '] NODE sem destino Figma');
      else if (target.kind === 'URL' && !/^https:\/\//i.test(target.url ?? '')) failures.push('reacoes[' + index + '] URL sem destino HTTPS');
    }
  }
  for (const [index, gap] of (manifest?.lacunas ?? []).entries()) {
    if (!gap?.id || typeof gap?.bloqueante !== 'boolean' || !gap?.motivo) failures.push('lacunas[' + index + '] precisa ter id, bloqueante e motivo');
  }
  for (const [index, difference] of (manifest?.diferencas ?? []).entries()) {
    if (!difference.tela || !difference.tipo || !Array.isArray(difference.contextoIds)) failures.push('diferencas[' + index + '] incompleta');
    if (!['global', 'convenio', '[CONFIRMAR]'].includes(difference.origemRegra)) failures.push('diferencas[' + index + '] sem origem da regra valida');
    if (!difference.regraDocumentada && difference.confirmar !== true) failures.push('diferencas[' + index + '] sem regra documental ou [CONFIRMAR]');
  }
  if (manifest?.status === 'PROPOSTA_PARA_APROVACAO') {
    if ((manifest.inventario ?? []).length === 0) failures.push('proposta possui inventario vazio');
    if ((manifest.coberturaReacoes ?? []).length === 0) failures.push('proposta possui cobertura de reacoes vazia');
    if ((manifest.coberturaEstrutura ?? []).length === 0) failures.push('proposta possui cobertura estrutural vazia');
    if ((manifest.reacoes ?? []).length === 0) failures.push('proposta possui reacoes vazias; registre tambem ausencia observada quando aplicavel');
    if ((manifest.lacunas ?? []).some((gap) => gap.bloqueante)) failures.push('proposta possui lacuna bloqueante');
    const reconciliation = manifest?.reconciliacaoMcp;
    if (!reconciliation || reconciliation.roundId !== manifest.rodada || reconciliation.status !== 'APROVADA' || reconciliation.report?.passed !== true || !reconciliation.readAt) {
      failures.push('proposta sem reconciliacao MCP favoravel da rodada atual');
    }
  } else if (['PRECISA_CONTEXTO', 'ANALISE_INCOMPLETA', 'NAO_VERIFICAVEL'].includes(manifest?.status) && !(manifest.lacunas ?? []).some((gap) => gap.bloqueante)) {
    failures.push('status nao conclusivo exige lacuna bloqueante');
  }
  return failures;
}

if (typeof module !== 'undefined') module.exports = { validateAnalysisManifestData };
