/*
 * Validador portatil do recorte de referencias de uma rodada.
 * Pode ser colado em use_figma sem fs, Node ou escrita no arquivo.
 */
function validateReferenceScopeData(scope) {
  const failures = [];
  if (!scope || ![1, 2].includes(scope.schemaVersion)) failures.push('recorte de referencias precisa ter schemaVersion 1 ou 2');
  if (!scope?.id || !scope?.rodada) failures.push('recorte de referencias sem id ou rodada');
  if (!scope?.figma?.pageId || !scope?.figma?.pageName) failures.push('recorte de referencias sem pagina Figma');
  if (!Array.isArray(scope?.figma?.secoes) || scope.figma.secoes.length === 0) {
    failures.push('recorte de referencias sem Sections selecionadas');
  }
  const ids = new Set();
  const names = new Set();
  for (const [index, section] of (scope?.figma?.secoes ?? []).entries()) {
    if (!section?.nome || !section?.sectionId || !section?.contextoId) failures.push('recorte.figma.secoes[' + index + '] incompleta');
    if (scope.schemaVersion === 2 && (!section?.modalidade || !Array.isArray(section?.superficies) || section.superficies.length === 0)) failures.push('recorte.figma.secoes[' + index + '] sem modalidade ou superficies declaradas');
    if (!String(section?.nome ?? '').startsWith('ref-')) failures.push('recorte.figma.secoes[' + index + '] precisa usar referencia ref-*');
    if (ids.has(section?.sectionId)) failures.push('recorte possui sectionId duplicado: ' + section.sectionId);
    if (names.has(section?.nome)) failures.push('recorte possui nome de Section duplicado: ' + section.nome);
    ids.add(section?.sectionId);
    names.add(section?.nome);
  }
  if (scope?.schemaVersion === 2) {
    if (!scope?.escopoMomento?.caminho || !/^[a-f0-9]{64}$/.test(scope?.escopoMomento?.sha256 ?? '')) failures.push('recorte sem escopo de momento hashado');
  }
  if (scope?.ativosForaDoRecorte !== 'IGNORAR') failures.push('ativos fora do recorte precisam permanecer IGNORAR');
  if (scope?.ativosExistentes?.politica !== 'EVIDENCIA_APENAS' || scope?.ativosExistentes?.adocaoAutomatica !== false) {
    failures.push('ativos existentes precisam ser EVIDENCIA_APENAS sem adocao automatica');
  }
  return failures;
}

if (typeof module !== 'undefined') module.exports = { validateReferenceScopeData };
