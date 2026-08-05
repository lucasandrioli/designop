/* Validador portatil do cartao operacional do Analista. */
function validateAnalystStateData(state) {
  const failures = []
  const required = ['schemaVersion', 'rodada', 'status', 'entrada', 'progresso', 'achados', 'confrontos', 'decisoes', 'problemas', 'proposta']
  for (const field of required) if (!(field in (state ?? {}))) failures.push('campo ausente: ' + field)
  if (state?.schemaVersion !== 1) failures.push('schemaVersion precisa ser 1')
  if (!state?.rodada) failures.push('rodada ausente')
  if (!['PREPARANDO', 'LENDO_REFERENCIAS', 'ORGANIZANDO_ACHADOS', 'AGUARDANDO_DECISAO_DO_DESIGNER', 'PRONTO_PARA_REVISAO', 'BLOQUEADO_TECNICAMENTE'].includes(state?.status)) failures.push('status invalido')
  if (!state?.entrada?.figmaUrl || !Array.isArray(state?.entrada?.sections) || state.entrada.sections.length === 0) failures.push('entrada sem Figma ou Sections')
  const sections = new Set()
  for (const [index, name] of (state?.entrada?.sections ?? []).entries()) {
    if (!String(name ?? '').trim()) failures.push('entrada.sections[' + index + '] vazia')
    if (sections.has(name)) failures.push('entrada possui Section duplicada: ' + name)
    sections.add(name)
  }
  if (!Array.isArray(state?.progresso?.sections) || state.progresso.sections.length !== sections.size) failures.push('progresso sem uma entrada por Section')
  for (const [index, item] of (state?.progresso?.sections ?? []).entries()) {
    if (!sections.has(item?.nome)) failures.push('progresso.sections[' + index + '] aponta para Section fora da entrada')
    if (!['PENDENTE', 'LENDO', 'CONCLUIDA', 'NAO_ENCONTRADA', 'FALHOU'].includes(item?.status)) failures.push('progresso.sections[' + index + '] sem status valido')
  }
  if (!Array.isArray(state?.achados)) failures.push('achados precisa ser lista')
  for (const [index, item] of (state?.achados ?? []).entries()) {
    if (!['FATO', 'HIPOTESE', 'RISCO'].includes(item?.tipo) || !item?.titulo || !item?.descricao) failures.push('achados[' + index + '] incompleto')
  }
  if (!Array.isArray(state?.confrontos)) failures.push('confrontos precisa ser lista')
  for (const [index, item] of (state?.confrontos ?? []).entries()) {
    if (!item?.id || !item?.topico || !item?.observacao || !['DOCUMENTADO', 'DIVERGENTE', 'SEM_BASE'].includes(item?.situacaoBase) || !Array.isArray(item?.fontesBase) || !item?.conclusao) failures.push('confrontos[' + index + '] incompleto')
  }
  if (!Array.isArray(state?.decisoes) || state.decisoes.length > 3) failures.push('decisoes precisa ter no maximo tres itens')
  for (const [index, item] of (state?.decisoes ?? []).entries()) {
    if (!item?.id || !item?.pergunta || !item?.impacto || !item?.recomendacao || !['PENDENTE', 'RESPONDIDA'].includes(item?.status)) failures.push('decisoes[' + index + '] incompleta')
  }
  if (!Array.isArray(state?.problemas)) failures.push('problemas precisa ser lista')
  for (const [index, item] of (state?.problemas ?? []).entries()) {
    if (!item?.codigo || !item?.mensagemHumana || !['ANALISTA', 'DESIGNER', 'FERRAMENTA'].includes(item?.responsavel) || !item?.proximaAcao || typeof item?.bloqueia !== 'boolean') failures.push('problemas[' + index + '] incompleto')
  }
  if (!state?.proposta || !['NAO_INICIADA', 'EM_PREPARACAO', 'PRONTA'].includes(state.proposta.status) || !Array.isArray(state.proposta.entregaveis)) failures.push('proposta invalida')
  if (state?.status === 'BLOQUEADO_TECNICAMENTE' && !(state.problemas ?? []).some((item) => item?.bloqueia)) failures.push('bloqueio tecnico sem problema bloqueante')
  if (state?.status === 'AGUARDANDO_DECISAO_DO_DESIGNER' && !(state.decisoes ?? []).some((item) => item?.status === 'PENDENTE')) failures.push('aguardando decisao sem pergunta pendente')
  return failures
}
if (typeof module !== 'undefined') module.exports = { validateAnalystStateData }
