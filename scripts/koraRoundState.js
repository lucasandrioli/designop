const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { validateKoraStateData } = require('./validateKoraStateCore')
const { validatePromotionPackageData } = require('./validatePromotionPackageCore')

function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null }
}

/*
 * A composicao nao pode receber apenas o nome de uma rodada passada. Antes de
 * existir, ela fixa o recibo de promocao comprovado de cada momento escolhido.
 * Assim uma mudanca posterior naquele recibo tambem invalida a composicao.
 */
function promotedMomentReference(repositoryRoot, sourceRound, modalidade) {
  const failures = []
  const directory = path.join(repositoryRoot, '.designops', 'runs', sourceRound)
  const promotionFile = path.join(directory, 'pacote-promocao.json')
  const state = readJson(path.join(directory, 'kora.json'))
  const promotion = readJson(promotionFile)
  if (!state || state.schemaVersion !== 2 || state.tipoRodada !== 'MOMENTO' || state.status !== 'CONCLUIDA') failures.push(`momento ${sourceRound} nao esta concluido pela Kora`)
  if (!state?.entrada?.modalidades?.includes(modalidade)) failures.push(`momento ${sourceRound} nao contem a modalidade ${modalidade}`)
  if (!promotion || promotion.schemaVersion !== 2) failures.push(`momento ${sourceRound} nao possui promocao por momento comprovada`)
  if (promotion) failures.push(...validatePromotionPackageData(promotion, { round: sourceRound, repositoryRoot }))
  const packageReceipt = state?.pacotes?.promocao
  if (!packageReceipt || packageReceipt.arquivo !== `.designops/runs/${sourceRound}/pacote-promocao.json` || packageReceipt.sha256 !== (fs.existsSync(promotionFile) ? sha256(promotionFile) : null) || packageReceipt.estado !== 'CONCLUIDA') failures.push(`momento ${sourceRound} nao possui recibo Kora de promocao integro`)
  const modalityReceipt = state?.pacotesPorModalidade?.[modalidade]?.promocao
  if (!modalityReceipt || modalityReceipt.sha256 !== packageReceipt?.sha256) failures.push(`momento ${sourceRound} nao possui promocao comprovada para ${modalidade}`)
  if (!(promotion?.ativosPublicados ?? []).some((asset) => asset?.modalidade === modalidade && asset?.resultado === 'FAVORAVEL')) failures.push(`momento ${sourceRound} nao publicou ativo da modalidade ${modalidade}`)
  return { failures, reference: failures.length ? null : { rodada: sourceRound, promocao: { caminho: `.designops/runs/${sourceRound}/pacote-promocao.json`, sha256: sha256(promotionFile) } } }
}

function createInitialState(round, figmaUrl, sections, contextoCurto, scope = null) {
  if (!scope) return {
    // Compatibilidade de leitura e de fixtures de rodadas historicas.
    schemaVersion: 1,
    rodada: round,
    status: 'PREPARANDO',
    entrada: { figmaUrl, sections, contextoCurto: contextoCurto || null },
    checkpoints: {
      analise: { status: 'PENDENTE', gatePreProposta: false, reconciliada: false },
      contrato: { status: 'PENDENTE' },
      montagem: { status: 'PENDENTE' },
      validacao: { status: 'PENDENTE' },
      promocao: { status: 'PENDENTE' },
    },
    aprovacoes: { contrato: null, promocao: null }, tentativas: [], recibos: [], artefatos: [],
    pacotes: { analista: null, montagem: null, veredito: null, promocao: null }, autorizacaoPendente: null,
    decisoes: [], bloqueios: [], motivoInterrupcao: null, historico: [],
  }
}

function createMomentState(round, figmaUrl, scope, scopeHash) {
  return {
    schemaVersion: 2,
    rodada: round,
    tipoRodada: 'MOMENTO',
    status: 'PREPARANDO',
    entrada: {
      figmaUrl,
      sections: scope.sections,
      contextoCurto: scope.contextoCurto,
      etapa: scope.etapa,
      momento: scope.momento,
      modalidades: scope.modalidades,
      telas: scope.telas,
    },
    escopo: { arquivo: `.designops/runs/${round}/escopo-momento.json`, sha256: scopeHash },
    checkpoints: {
      analise: { status: 'PENDENTE', gatePreProposta: false, reconciliada: false },
      contrato: { status: 'PENDENTE' },
      montagem: { status: 'PENDENTE' },
      validacao: { status: 'PENDENTE' },
      promocao: { status: 'PENDENTE' },
    },
    aprovacoes: { contrato: null, promocao: null },
    tentativas: [],
    recibos: [],
    artefatos: [],
    pacotes: { analista: null, montagem: null, veredito: null, promocao: null },
    pacotesPorModalidade: Object.fromEntries(scope.modalidades.map((modalidade) => [modalidade, { analista: null, montagem: null, veredito: null, promocao: null }])),
    autorizacaoPendente: null,
    decisoes: [],
    bloqueios: [],
    motivoInterrupcao: null,
    historico: [],
  }
}

function createStageCompositionState(round, figmaUrl, scope, scopeHash) {
  return {
    schemaVersion: 2, rodada: round, tipoRodada: 'COMPOSICAO_ETAPA', status: 'PREPARANDO',
    entrada: { figmaUrl, sections: [], contextoCurto: null, etapa: scope.etapa, momento: 'composicao-etapa', modalidades: [scope.modalidade], telas: [] },
    escopo: { arquivo: `.designops/runs/${round}/escopo-composicao-etapa.json`, sha256: scopeHash },
    checkpoints: { analise: { status: 'PENDENTE', gatePreProposta: false, reconciliada: false }, contrato: { status: 'PENDENTE' }, montagem: { status: 'PENDENTE' }, validacao: { status: 'PENDENTE' }, promocao: { status: 'PENDENTE' } },
    aprovacoes: { contrato: null, promocao: null }, tentativas: [], recibos: [], artefatos: [],
    pacotes: { analista: null, montagem: null, veredito: null, promocao: null },
    pacotesPorModalidade: { [scope.modalidade]: { analista: null, montagem: null, veredito: null, promocao: null } },
    autorizacaoPendente: null, decisoes: [], bloqueios: [], motivoInterrupcao: null, historico: [],
  }
}

function createKoraRound({ repositoryRoot, round, figmaUrl, sections, contextoCurto, etapa, momento, modalidades, telas }) {
  const directory = path.join(repositoryRoot, '.designops', 'runs', round)
  const file = path.join(directory, 'kora.json')
  if (fs.existsSync(file)) return { passed: false, round, failures: ['ja existe uma rodada Kora com este identificador'] }
  const hasMomentScope = Boolean(String(etapa ?? '').trim() && String(momento ?? '').trim() && Array.isArray(modalidades) && modalidades.length && Array.isArray(telas) && telas.length)
  if (!hasMomentScope) {
    // Interface de linha de comando anterior, preservada apenas para ler e
    // testar rodadas historicas. O hook humano da Kora exige o novo recorte.
    const legacy = createInitialState(round, figmaUrl, sections, contextoCurto)
    const legacyFailures = validateKoraStateData(legacy, { round, repositoryRoot })
    if (legacyFailures.length) return { passed: false, round, failures: legacyFailures }
    fs.mkdirSync(directory, { recursive: true })
    fs.writeFileSync(file, JSON.stringify(legacy, null, 2) + '\n')
    return { passed: true, round, status: legacy.status, stateFile: path.relative(repositoryRoot, file), nextAction: 'Kora pode iniciar a analise das referencias.' }
  }
  fs.mkdirSync(directory, { recursive: true })
  const scope = {
    schemaVersion: 1, id: `escopo-${round}`, rodada: round, tipoRodada: 'MOMENTO',
    etapa: String(etapa ?? '').trim(), momento: String(momento ?? '').trim(),
    modalidades: Array.isArray(modalidades) ? modalidades : [], telas: Array.isArray(telas) ? telas : [],
    sections: Array.isArray(sections) ? sections : [], contextoCurto: contextoCurto || null,
  }
  const scopeFile = path.join(directory, 'escopo-momento.json')
  fs.writeFileSync(scopeFile, JSON.stringify(scope, null, 2) + '\n')
  const state = createMomentState(round, figmaUrl, scope, sha256(scopeFile))
  const failures = validateKoraStateData(state, { round, repositoryRoot })
  if (failures.length) return { passed: false, round, failures }
  fs.writeFileSync(file, JSON.stringify(state, null, 2) + '\n')
  return {
    passed: true,
    round,
    status: state.status,
    stateFile: path.relative(repositoryRoot, file),
    nextAction: 'Kora pode iniciar a analise das referencias.',
  }
}

function createStageCompositionRound({ repositoryRoot, round, figmaUrl, etapa, modalidade, momentos }) {
  const directory = path.join(repositoryRoot, '.designops', 'runs', round)
  const file = path.join(directory, 'kora.json')
  if (fs.existsSync(file)) return { passed: false, round, failures: ['ja existe uma rodada Kora com este identificador'] }
  const requestedMoments = Array.isArray(momentos) ? momentos.map((item) => String(item).trim()).filter(Boolean) : []
  if (!String(etapa ?? '').trim() || !String(modalidade ?? '').trim() || !requestedMoments.length || requestedMoments.some((item) => !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(item)) || new Set(requestedMoments).size !== requestedMoments.length || requestedMoments.includes(round)) return { passed: false, round, failures: ['composicao exige momentos promovidos distintos, etapa e modalidade'] }
  const references = requestedMoments.map((sourceRound) => promotedMomentReference(repositoryRoot, sourceRound, String(modalidade).trim()))
  const sourceFailures = references.flatMap((item) => item.failures)
  if (sourceFailures.length) return { passed: false, round, failures: sourceFailures }
  const scope = { schemaVersion: 1, id: `escopo-${round}`, rodada: round, tipoRodada: 'COMPOSICAO_ETAPA', etapa: String(etapa ?? '').trim(), modalidade: String(modalidade ?? '').trim(), momentos: references.map((item) => item.reference) }
  fs.mkdirSync(directory, { recursive: true })
  const scopeFile = path.join(directory, 'escopo-composicao-etapa.json')
  fs.writeFileSync(scopeFile, JSON.stringify(scope, null, 2) + '\n')
  const state = createStageCompositionState(round, figmaUrl, scope, sha256(scopeFile))
  const failures = validateKoraStateData(state, { round, repositoryRoot })
  if (failures.length) return { passed: false, round, failures }
  fs.writeFileSync(file, JSON.stringify(state, null, 2) + '\n')
  return { passed: true, round, status: state.status, stateFile: path.relative(repositoryRoot, file), nextAction: 'Kora pode preparar a composicao da etapa.' }
}

module.exports = { createInitialState, createKoraRound, createStageCompositionRound }
