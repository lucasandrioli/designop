/*
 * Validador portatil do rascunho de contexto. Pode ser colado com o objeto
 * `contexto` em use_figma somente de leitura, sem Node ou terminal:
 * const failures = validateContextDraftData(contexto);
 * return { passed: failures.length === 0, failures };
 */
function validateContextDraftData(contexto) {
  const failures = [];
  const required = ['schemaVersion', 'id', 'status', 'modalidade', 'etapa', 'contextos', 'afirmacoes'];
  for (const field of required) if (!(field in (contexto ?? {}))) failures.push('campo ausente: ' + field);
  if (contexto?.schemaVersion !== 1) failures.push('schemaVersion precisa ser 1');
  if (!['RASCUNHO', 'AGUARDANDO_DESIGNER', 'PRONTO_PARA_APROVACAO', 'APROVADO_PARA_REGISTRO'].includes(contexto?.status)) failures.push('status invalido');
  if (!contexto?.id || !contexto?.modalidade || !contexto?.etapa) failures.push('id, modalidade e etapa sao obrigatorios');
  if (!Array.isArray(contexto?.contextos) || contexto.contextos.length === 0) failures.push('contextos ausentes');
  if (!Array.isArray(contexto?.afirmacoes) || contexto.afirmacoes.length === 0) failures.push('afirmacoes ausentes');

  const contextIds = new Set();
  for (const [index, item] of (contexto?.contextos ?? []).entries()) {
    if (!/^ctx-[a-z0-9-]+$/.test(item?.id ?? '')) failures.push('contextos[' + index + '] sem contexto-id valido');
    if (contextIds.has(item?.id)) failures.push('contextos possui id duplicado: ' + item.id);
    contextIds.add(item?.id);
  }

  const ids = new Set();
  const businessCategories = new Set(['REGRA_NEGOCIO', 'PRESENCA_COMPOSICAO', 'RETORNO_APP', 'ROTEIRO_ORIENTACAO']);
  const controlledValues = new Set(['DIRETO', 'ACAO_NO_APP', 'DIRETA', 'DIRETA_COM_TUTORIAL_OPCIONAL', 'PRESENTE_OBRIGATORIA', 'AUSENTE_OBRIGATORIA']);
  for (const [index, item] of (contexto?.afirmacoes ?? []).entries()) {
    const label = 'afirmacoes[' + index + ']';
    if (!item?.id || !item?.escopo || !item?.categoria || !item?.classificacao || !item?.texto || typeof item?.bloqueante !== 'boolean') {
      failures.push(label + ' incompleta');
      continue;
    }
    if (ids.has(item.id)) failures.push('afirmacoes possui id duplicado: ' + item.id);
    ids.add(item.id);
    if (!['GLOBAL', 'MODALIDADE', 'ETAPA', 'CONTEXTO'].includes(item.escopo)) failures.push(label + ' sem escopo valido');
    if (item.escopo === 'CONTEXTO' && !contextIds.has(item.contextoId)) failures.push(label + ' aponta para contexto inexistente');
    if (item.escopo !== 'CONTEXTO' && item.contextoId) failures.push(label + ' nao pode ter contextoId fora do escopo CONTEXTO');
    if (!['TOPOLOGIA_OBSERVADA', 'INTERACAO_OBSERVADA', 'SINAL_TECNICO', 'REGRA_NEGOCIO', 'PRESENCA_COMPOSICAO', 'RETORNO_APP', 'ROTEIRO_ORIENTACAO', 'OUTRA'].includes(item.categoria)) failures.push(label + ' sem categoria valida');
    if (!['FATO_OBSERVADO', 'REGRA_DOCUMENTADA', 'REGRA_CONFIRMADA', 'CONFIRMAR'].includes(item.classificacao)) failures.push(label + ' sem classificacao valida');

    const source = item.fonte;
    if (!source || !['FIGMA', 'DOCUMENTO', 'DESIGNER', 'AUSENTE'].includes(source.tipo)) {
      failures.push(label + ' sem fonte valida');
      continue;
    }
    if (item.classificacao === 'FATO_OBSERVADO') {
      if (source.tipo !== 'FIGMA') failures.push(label + ' FATO_OBSERVADO precisa de fonte FIGMA');
      if (!Array.isArray(source.referencias) || source.referencias.length === 0 || source.referencias.some((reference) => !reference?.section)) failures.push(label + ' FATO_OBSERVADO sem referencia Figma');
      if (businessCategories.has(item.categoria) || controlledValues.has(item.valorControlado)) failures.push(label + ' nao pode transformar fato Figma em regra de negocio');
    }
    if (item.classificacao === 'REGRA_DOCUMENTADA') {
      if (source.tipo !== 'DOCUMENTO' || !source.documento) failures.push(label + ' REGRA_DOCUMENTADA precisa de documento identificado');
    }
    if (item.classificacao === 'REGRA_CONFIRMADA') {
      if (source.tipo !== 'DESIGNER' || !source.registroHumano) failures.push(label + ' REGRA_CONFIRMADA precisa de registro humano');
    }
    if (item.classificacao === 'CONFIRMAR') {
      if (source.tipo !== 'AUSENTE' || !source.motivo) failures.push(label + ' CONFIRMAR precisa registrar fonte AUSENTE e motivo');
    }
    if (businessCategories.has(item.categoria) && !['REGRA_DOCUMENTADA', 'REGRA_CONFIRMADA', 'CONFIRMAR'].includes(item.classificacao)) {
      failures.push(label + ' exige regra documentada, regra confirmada ou CONFIRMAR');
    }
    if (controlledValues.has(item.valorControlado) && !['REGRA_DOCUMENTADA', 'REGRA_CONFIRMADA', 'CONFIRMAR'].includes(item.classificacao)) {
      failures.push(label + ' possui valor controlado sem fonte de negocio');
    }
  }

  const blockingConfirmations = (contexto?.afirmacoes ?? []).filter((item) => item?.classificacao === 'CONFIRMAR' && item?.bloqueante);
  if (contexto?.status === 'PRONTO_PARA_APROVACAO' && blockingConfirmations.length > 0) failures.push('rascunho pronto para aprovacao possui CONFIRMAR bloqueante');
  if (contexto?.status === 'APROVADO_PARA_REGISTRO') {
    if (!contexto?.aprovacaoHumana?.registro) failures.push('contexto aprovado para registro sem aprovacao humana');
    if (blockingConfirmations.length > 0) failures.push('contexto aprovado para registro possui CONFIRMAR bloqueante');
  }
  return failures;
}

if (typeof module !== 'undefined') module.exports = { validateContextDraftData };
