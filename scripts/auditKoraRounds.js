#!/usr/bin/env node
/* Consulta a memoria auditavel local e, quando indicada, a branch audit/kora. */
const fs = require('fs')
const path = require('path')

function args(argv) {
  const input = {}
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) continue
    input[argv[index].slice(2)] = argv[index + 1]
    index += 1
  }
  return input
}
function localRound(root, id) {
  const directory = path.join(root, '.designops', 'audit', 'rodada-' + id)
  const eventsFile = path.join(directory, 'eventos.jsonl')
  if (!fs.existsSync(eventsFile)) return null
  const events = fs.readFileSync(eventsFile, 'utf8').split('\n').filter(Boolean).flatMap((line) => { try { return [JSON.parse(line)] } catch { return [] } })
  const stateFile = path.join(root, '.designops', 'runs', id, 'kora.json')
  let state = null
  try { state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : null } catch {}
  const last = events.at(-1)
  const recoveries = events.filter((event) => event.tipo === 'RECUPERACAO_REGISTRADA').length
  const incidentsDirectory = path.join(directory, 'incidentes')
  const incidents = fs.existsSync(incidentsDirectory) ? fs.readdirSync(incidentsDirectory, { withFileTypes: true }).filter((entry) => entry.isDirectory()).flatMap((entry) => {
    try {
      const incident = JSON.parse(fs.readFileSync(path.join(incidentsDirectory, entry.name, 'incidente.json'), 'utf8'))
      const resolved = fs.readdirSync(path.join(incidentsDirectory, entry.name)).some((name) => /^retomada-[A-Za-z0-9.-]+\.json$/.test(name))
      const status = resolved ? 'RETOMADO' : incident.status
      return [{ id: incident.id, status, fase: incident.fase, proximaAcao: status === 'ABERTO' ? 'Encaminhar o pedido de manutencao ao Codex.' : 'A rodada foi devolvida ao ponto seguro e precisa repetir a verificacao.' }]
    } catch { return [] }
  }) : []
  return {
    rodada: id,
    fonte: 'LOCAL',
    estado: state?.status ?? 'SEM_ESTADO_LOCAL',
    fatosRegistrados: events.length,
    ultimoFato: last?.tipo ?? 'SEM_FATO',
    tentativasRegistradas: recoveries,
    evidencia: fs.existsSync(path.join(directory, 'manifesto-auditoria.json')) ? 'COMPLETA' : 'LIMITADA',
    incidentes: incidents,
    proximaAcao: incidents.some((incident) => incident.status === 'ABERTO') ? 'A rodada aguarda correcao da operacao, sem decisao de negocio.' : state?.status === 'BLOQUEADA' ? 'Remover o impedimento registrado antes de retomar.' : state?.status === 'AGUARDANDO_DECISAO_DO_DESIGNER' ? 'Responder a decisao apresentada pela Kora.' : 'Retomar pelo estado registrado da rodada.',
  }
}
function archiveRound(archiveRoot, id) {
  const file = path.join(archiveRoot, 'relatos', id, 'relato-kora.md')
  if (!fs.existsSync(file)) return null
  const text = fs.readFileSync(file, 'utf8')
  const state = text.match(/Estado atual da rodada: ([A-Z_]+)/)?.[1] ?? 'ESTADO_PUBLICADO_NAO_INFORMADO'
  const events = Number(text.match(/Eventos registrados: (\d+)/)?.[1] ?? 0)
  const incidentsDirectory = path.join(archiveRoot, 'relatos', id, 'incidentes')
  const incidents = fs.existsSync(incidentsDirectory) ? fs.readdirSync(incidentsDirectory, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => ({ id: entry.name, status: fs.readdirSync(path.join(incidentsDirectory, entry.name)).some((name) => /^retomada-[A-Za-z0-9.-]+\.json$/.test(name)) ? 'RETOMADO' : 'ABERTO', fase: null, proximaAcao: 'Encaminhar o pedido de manutencao ao Codex.' })) : []
  const open = incidents.some((incident) => incident.status === 'ABERTO')
  return { rodada: id, fonte: 'AUDIT_KORA', estado: state, fatosRegistrados: events, ultimoFato: 'RELATO_PUBLICADO', tentativasRegistradas: null, evidencia: 'COMPLETA', incidentes: incidents, proximaAcao: open ? 'Ha um incidente publicado para manutencao.' : incidents.length ? 'A correcao foi registrada; a rodada deve repetir a verificacao do ponto seguro.' : 'Consultar ou retomar a evidencia local associada a esta rodada.' }
}

const input = args(process.argv.slice(2))
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const archiveRoot = input['archive-root'] ? path.resolve(input['archive-root']) : null
const localIds = fs.existsSync(path.join(root, '.designops', 'audit'))
  ? fs.readdirSync(path.join(root, '.designops', 'audit')).filter((name) => name.startsWith('rodada-')).map((name) => name.slice('rodada-'.length))
  : []
const archiveIds = archiveRoot && fs.existsSync(path.join(archiveRoot, 'relatos'))
  ? fs.readdirSync(path.join(archiveRoot, 'relatos'), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
  : []
const ids = input.round ? [input.round] : [...new Set([...localIds, ...archiveIds])]
const reports = ids.flatMap((id) => [localRound(root, id) ?? (archiveRoot ? archiveRound(archiveRoot, id) : null)].filter(Boolean))
process.stdout.write(JSON.stringify({
  passed: reports.length > 0,
  resumoHumano: reports.length ? 'A auditoria encontrou ' + reports.length + ' rodada(s) com evidencia registrada.' : 'Nao ha evidencia auditavel suficiente para afirmar o que ocorreu.',
  rodadas: reports,
}, null, 2) + '\n')
process.exit(reports.length ? 0 : 1)
