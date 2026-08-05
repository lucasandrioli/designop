/* Validador portatil da trilha de auditoria local da Kora. */
const EVENT_TYPES = new Set([
  'SESSAO_INICIADA',
  'FERRAMENTA_INICIADA',
  'FERRAMENTA_CONCLUIDA',
  'SUBAGENTE_INICIADO',
  'SUBAGENTE_CONCLUIDO',
  'SESSAO_ENCERRADA',
  'RODADA_INICIADA',
  'PAPEL_ACIONADO',
  'PAPEL_CONCLUIDO',
  'ESTADO_ALTERADO',
  'RECUPERACAO_REGISTRADA',
  'APROVACAO_REGISTRADA',
  'BLOQUEIO_REGISTRADO',
  'RODADA_INTERROMPIDA',
  'INCIDENTE_OPERACAO_ABERTO',
  'INCIDENTE_OPERACAO_RETOMADO',
  'RODADA_ENCERRADA',
  'OUTRO',
])
const RESULTS = new Set(['INICIADO', 'CONCLUIDO', 'ENCERRADO', 'NAO_INFORMADO'])
const SCOPE_TYPES = new Set(['RODADA', 'SESSAO'])
const FIGMA_URL = /https?:\/\/(?:www\.)?figma\.com\/[^\s"'<>]+/gi
const FIGMA_NODE_QUERY = /([?&](?:node-id|nodeId)=)[^&\s"']+/gi
const NODE_KEY = /(figma.*url|url.*figma|node[_-]?id|nodeid|file[_-]?id|fileid|transcript[_-]?path)/i

function hasForbiddenFigmaData(value) {
  if (typeof value !== 'string') return false
  FIGMA_URL.lastIndex = 0
  FIGMA_NODE_QUERY.lastIndex = 0
  const found = FIGMA_URL.test(value) || FIGMA_NODE_QUERY.test(value)
  FIGMA_URL.lastIndex = 0
  FIGMA_NODE_QUERY.lastIndex = 0
  return found
}

function validateKoraAuditEventData(event) {
  const failures = []
  const required = ['schemaVersion', 'eventoId', 'ocorridoEm', 'tipo', 'origem', 'detalhes']
  for (const field of required) if (!(field in (event ?? {}))) failures.push('campo ausente: ' + field)
  for (const field of Object.keys(event ?? {})) if (!required.includes(field)) failures.push('campo nao permitido: ' + field)
  if (event?.schemaVersion !== 1) failures.push('schemaVersion precisa ser 1')
  if (!String(event?.eventoId ?? '').trim()) failures.push('eventoId ausente')
  if (!String(event?.ocorridoEm ?? '').trim() || Number.isNaN(Date.parse(event.ocorridoEm))) failures.push('ocorridoEm invalido')
  if (!EVENT_TYPES.has(event?.tipo)) failures.push('tipo invalido')
  for (const field of Object.keys(event?.origem ?? {})) if (!['eventoHook', 'escopo', 'sessao', 'rodada'].includes(field)) failures.push('origem.' + field + ' nao permitido')
  for (const field of Object.keys(event?.detalhes ?? {})) if (!['ferramenta', 'chavesEntrada', 'chavesSaida', 'agente', 'resultado', 'mensagem'].includes(field)) failures.push('detalhes.' + field + ' nao permitido')
  if (!String(event?.origem?.eventoHook ?? '').trim()) failures.push('origem.eventoHook ausente')
  if (!SCOPE_TYPES.has(event?.origem?.escopo?.tipo) || !String(event?.origem?.escopo?.id ?? '').trim()) failures.push('origem.escopo invalido')
  if (event?.origem?.sessao !== undefined && !String(event.origem.sessao).trim()) failures.push('origem.sessao invalida')
  if (event?.origem?.rodada !== undefined && !String(event.origem.rodada).trim()) failures.push('origem.rodada invalida')
  if (!RESULTS.has(event?.detalhes?.resultado)) failures.push('detalhes.resultado invalido')
  for (const field of ['ferramenta', 'agente', 'mensagem']) {
    if (event?.detalhes?.[field] !== undefined && !String(event.detalhes[field]).trim()) failures.push('detalhes.' + field + ' invalido')
  }
  for (const field of ['chavesEntrada', 'chavesSaida']) {
    if (event?.detalhes?.[field] !== undefined && (!Array.isArray(event.detalhes[field]) || event.detalhes[field].some((item) => !String(item ?? '').trim()))) failures.push('detalhes.' + field + ' invalido')
  }
  const serialized = JSON.stringify(event ?? {})
  if (hasForbiddenFigmaData(serialized)) failures.push('evento contem URL Figma ou node ID')
  return failures
}

function sanitiseAuditText(value) {
  return String(value ?? '')
    .replace(FIGMA_URL, '[URL_FIGMA_REMOVIDA]')
    .replace(FIGMA_NODE_QUERY, '$1[NODE_ID_REMOVIDO]')
    .replace(/\b\d{1,8}[:-]\d{1,8}\b/g, '[NODE_ID_REMOVIDO]')
    .slice(0, 240)
}

function sanitiseAuditValue(value, key = '') {
  if (NODE_KEY.test(key)) return '[DADO_RESTRITO_REMOVIDO]'
  if (typeof value === 'string') return sanitiseAuditText(value)
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitiseAuditValue(item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).slice(0, 30).map(([entryKey, entryValue]) => [entryKey, sanitiseAuditValue(entryValue, entryKey)]))
  }
  return value
}

if (typeof module !== 'undefined') module.exports = { EVENT_TYPES, RESULTS, SCOPE_TYPES, sanitiseAuditText, sanitiseAuditValue, validateKoraAuditEventData }
