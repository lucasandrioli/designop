/* Valida o recorte humano imutavel de uma rodada por momento. */
const ID = /^[a-z0-9][a-z0-9-]*$/

function validateMomentScopeData(scope, options = {}) {
  const failures = []
  if (!scope || scope.schemaVersion !== 1) failures.push('escopo de momento precisa ter schemaVersion 1')
  if (!scope?.id || !scope?.rodada || !scope?.etapa || !scope?.momento) failures.push('escopo de momento sem identificacao completa')
  if (options.round && scope?.rodada !== options.round) failures.push('escopo de momento pertence a outra rodada')
  if (scope?.tipoRodada !== 'MOMENTO') failures.push('escopo precisa declarar tipoRodada MOMENTO')

  const modalities = scope?.modalidades
  if (!Array.isArray(modalities) || modalities.length === 0) failures.push('escopo de momento sem modalidades')
  const seenModalities = new Set()
  for (const [index, modalidade] of (modalities ?? []).entries()) {
    if (!ID.test(String(modalidade ?? ''))) failures.push(`modalidades[${index}] invalida`)
    if (seenModalities.has(modalidade)) failures.push('modalidade duplicada no escopo: ' + modalidade)
    seenModalities.add(modalidade)
  }

  const surfaces = scope?.telas
  if (!Array.isArray(surfaces) || surfaces.length === 0) failures.push('escopo de momento sem telas declaradas')
  const ids = new Set()
  for (const [index, surface] of (surfaces ?? []).entries()) {
    if (!ID.test(String(surface?.id ?? '')) || !String(surface?.nome ?? '').trim() || !['PRINCIPAL', 'DETALHE', 'AUXILIAR'].includes(surface?.papel)) {
      failures.push(`telas[${index}] invalida`)
      continue
    }
    if (ids.has(surface.id)) failures.push('tela duplicada no escopo: ' + surface.id)
    ids.add(surface.id)
    if (surface.abertaPor !== null && surface.abertaPor !== undefined && !ID.test(String(surface.abertaPor))) failures.push(`telas[${index}].abertaPor invalida`)
  }
  for (const surface of (surfaces ?? [])) {
    if (surface?.abertaPor && !ids.has(surface.abertaPor)) failures.push(`tela ${surface.id} referencia origem declarada ausente`)
    if (surface?.papel === 'PRINCIPAL' && surface?.abertaPor) failures.push(`tela principal ${surface.id} nao pode ser aberta por outra tela`)
    if (surface?.papel !== 'PRINCIPAL' && !surface?.abertaPor) failures.push(`tela auxiliar ${surface?.id ?? '?'} precisa declarar abertaPor`)
  }

  const sections = scope?.sections
  if (!Array.isArray(sections) || sections.length === 0) failures.push('escopo de momento sem Sections')
  const seenSections = new Set()
  for (const [index, section] of (sections ?? []).entries()) {
    if (!String(section ?? '').startsWith('ref-')) failures.push(`sections[${index}] precisa ser ref-*`)
    if (seenSections.has(section)) failures.push('Section duplicada no escopo: ' + section)
    seenSections.add(section)
  }
  if (scope?.contextoCurto !== null && scope?.contextoCurto !== undefined && typeof scope.contextoCurto !== 'string') failures.push('contexto curto invalido')
  return failures
}

if (typeof module !== 'undefined') module.exports = { validateMomentScopeData }
