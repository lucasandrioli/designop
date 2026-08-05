#!/usr/bin/env node
/*
 * Testes de regressao da base documental. Cada fixture nasce em diretorio
 * temporario e e removida ao fim: nenhum estado de rodada entra na master.
 */
const assert = require('assert')
const childProcess = require('child_process')
const crypto = require('crypto')
const fs = require('fs')
const os = require('os')
const path = require('path')
const vm = require('vm')

const root = path.resolve(__dirname, '..')
const temporaryDirectories = []

function temporaryDirectory(prefix) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix))
  temporaryDirectories.push(directory)
  return directory
}
function copy(relative, destinationRoot) {
  const source = path.join(root, relative)
  const destination = path.join(destinationRoot, relative)
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.copyFileSync(source, destination)
}
function runNode(script, args = [], cwd = root) {
  return childProcess.spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: 'utf8',
  })
}
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
function expectFailure(result, description) {
  assert.notStrictEqual(result.status, 0, description + ' deveria reprovar')
}
function expectSuccess(result, description) {
  assert.strictEqual(result.status, 0, description + ': ' + (result.stderr || result.stdout))
}
function loadFigmaFunction(relative, name, figma, globals = {}) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8') + '\nmodule.exports = ' + name
  const sandbox = { module: { exports: null }, exports: {}, figma, console, ...globals }
  vm.runInNewContext(source, sandbox, { filename: relative })
  return sandbox.module.exports
}
function createSquadFixture() {
  const fixture = temporaryDirectory('designops-squad-')
  fs.cpSync(path.join(root, '.github/agents'), path.join(fixture, '.github/agents'), { recursive: true })
  copy('scripts/validatePilotSquad.js', fixture)
  copy('docs/operacao-squad.md', fixture)
  copy('.vscode/settings.json', fixture)
  copy('.gitignore', fixture)
  return fixture
}
function createKoraFixture() {
  const fixture = temporaryDirectory('designops-kora-')
  ;[
    'scripts/startKoraRound.js',
    'scripts/validateKoraRound.js',
    'scripts/validateKoraStateCore.js',
    'scripts/authorizeKoraAction.js',
    'scripts/resumeKoraDecision.js',
    'scripts/recordKoraAuditEvent.js',
    'scripts/koraAuditHook.js',
    'scripts/generateKoraAuditReport.js',
    'scripts/validateKoraAuditTrail.js',
    'scripts/validateKoraAuditEventCore.js',
    'scripts/auditKoraRounds.js',
    'scripts/publishKoraAuditSummary.js',
    'scripts/diagnoseKoraFailure.js',
    'scripts/openKoraOperationIncident.js',
    'scripts/interruptKoraForIncident.js',
    'scripts/resumeKoraIncident.js',
    'scripts/recordKoraIncidentResolution.js',
    'scripts/validateAnalysisRound.js',
    'scripts/validateReferenceScopeCore.js',
    'scripts/validateAnalysisManifestCore.js',
    'scripts/validateContextDraftCore.js',
  ].forEach((file) => copy(file, fixture))
  return fixture
}
function testKoraRoundAndAudit() {
  const fixture = createKoraFixture()
  const round = 'kora-regressao'
  expectSuccess(runNode(path.join(fixture, 'scripts/startKoraRound.js'), ['--round', round, '--figma-url', 'https://www.figma.com/design/nao-publicar', '--sections', 'ref-a,ref-b', '--root', fixture]), 'Kora inicia com Figma e Sections sem exigir IDs')
  expectSuccess(runNode(path.join(fixture, 'scripts/validateKoraRound.js'), ['--round', round, '--root', fixture]), 'Estado inicial Kora valido')
  expectSuccess(runNode(path.join(fixture, 'scripts/authorizeKoraAction.js'), ['--round', round, '--role', 'ANALISTA', '--action', 'ANALISAR', '--root', fixture]), 'Kora libera somente a analise no inicio')
  expectFailure(runNode(path.join(fixture, 'scripts/authorizeKoraAction.js'), ['--round', round, '--role', 'MONTADOR', '--action', 'MONTAR', '--root', fixture]), 'Kora bloqueia montagem antes da aprovacao')

  const decisionStateFile = path.join(fixture, '.designops/runs', round, 'kora.json')
  const decisionState = JSON.parse(fs.readFileSync(decisionStateFile, 'utf8'))
  decisionState.status = 'AGUARDANDO_DECISAO_DO_DESIGNER'
  decisionState.checkpoints.analise.status = 'EM_ANDAMENTO'
  decisionState.decisoes = [{ id: 'regra-pendente', pergunta: 'MCP indisponivel: devo retomar a leitura?', status: 'PENDENTE', resposta: null, respondidaEm: null }]
  decisionState.historico = [
    { de: 'PREPARANDO', para: 'ANALISANDO', ocorreuEm: '2026-08-05T09:58:00.000Z', motivo: null },
    { de: 'ANALISANDO', para: 'AGUARDANDO_DECISAO_DO_DESIGNER', ocorreuEm: '2026-08-05T09:59:00.000Z', motivo: 'MCP indisponivel' },
  ]
  fs.writeFileSync(decisionStateFile, JSON.stringify(decisionState, null, 2))
  expectSuccess(runNode(path.join(fixture, 'scripts/resumeKoraDecision.js'), ['--round', round, '--decision', 'regra-pendente', '--answer', 'Sim, retome a leitura.', '--resume', 'ANALISANDO', '--root', fixture]), 'Kora registra resposta humana e devolve a orientacao ao Analista')

  const stateFile = path.join(fixture, '.designops/runs', round, 'kora.json')
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'))
  state.status = 'ANALISANDO'
  state.checkpoints.analise.status = 'EM_ANDAMENTO'
  state.historico = [{ de: 'PREPARANDO', para: 'ANALISANDO', ocorreuEm: '2026-08-05T10:00:00.000Z', motivo: null }]
  state.tentativas = [1, 2, 3].map((attempt) => ({ agente: 'ANALISTA', causa: 'MCP indisponivel', acao: 'Ler Section', evidencia: 'metadados da pagina', resultado: 'FALHOU', ocorreuEm: `2026-08-05T10:0${attempt}:00.000Z` }))
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
  expectFailure(runNode(path.join(fixture, 'scripts/validateKoraRound.js'), ['--round', round, '--root', fixture]), 'Kora bloqueia terceira repeticao da mesma causa')
  state.status = 'BLOQUEADA'
  state.bloqueios = [{ codigo: 'MCP_REPETIDO', mensagem: 'MCP indisponivel apos duas recuperacoes.', proximaAcao: 'Decidir como retomar a leitura.' }]
  state.historico.push({ de: 'ANALISANDO', para: 'BLOQUEADA', ocorreuEm: '2026-08-05T10:04:00.000Z', motivo: 'MCP indisponivel' })
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
  expectSuccess(runNode(path.join(fixture, 'scripts/validateKoraRound.js'), ['--round', round, '--root', fixture]), 'Kora conserva a terceira ocorrencia somente como bloqueio consolidado')

  state.tentativas = []
  state.artefatos = [{ id: 'vazamento', caminho: '.designops/runs/outra-rodada/analise.json', sha256: '0'.repeat(64) }]
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
  expectFailure(runNode(path.join(fixture, 'scripts/validateKoraRound.js'), ['--round', round, '--root', fixture]), 'Kora isola artefatos da rodada atual')

  state.artefatos = []
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
  expectSuccess(runNode(path.join(fixture, 'scripts/recordKoraAuditEvent.js'), ['--round', round, '--type', 'RODADA_INICIADA', '--result', 'INICIADO', '--message', 'Figma https://www.figma.com/design/segredo?node-id=10-20', '--root', fixture]), 'Auditoria registra fato sanitizado')
  expectSuccess(runNode(path.join(fixture, 'scripts/generateKoraAuditReport.js'), ['--round', round, '--root', fixture]), 'Relato sanitizado da Kora')
  expectSuccess(runNode(path.join(fixture, 'scripts/validateKoraAuditTrail.js'), ['--round', round, '--root', fixture]), 'Trilha da Kora com hashes integros')
  expectSuccess(runNode(path.join(fixture, 'scripts/auditKoraRounds.js'), ['--round', round, '--root', fixture]), 'Auditoria explica rodada sem receber print ou transcricao')
  const archiveFixture = temporaryDirectory('designops-kora-audit-branch-')
  const archiveReport = path.join(archiveFixture, 'relatos', round)
  fs.mkdirSync(archiveReport, { recursive: true })
  fs.copyFileSync(path.join(fixture, '.designops/audit/rodada-' + round, 'relato-kora.md'), path.join(archiveReport, 'relato-kora.md'))
  const emptyWorkspace = temporaryDirectory('designops-kora-audit-query-')
  const archiveQuery = runNode(path.join(fixture, 'scripts/auditKoraRounds.js'), ['--round', round, '--root', emptyWorkspace, '--archive-root', archiveFixture])
  expectSuccess(archiveQuery, 'Auditoria consulta relato publicado sem evidencia local')
  assert(archiveQuery.stdout.includes('AUDIT_KORA'), 'Auditoria precisa identificar relato vindo da branch dedicada')
  const auditBranch = temporaryDirectory('designops-kora-audit-publish-')
  childProcess.execFileSync('git', ['init', '-q'], { cwd: auditBranch })
  childProcess.execFileSync('git', ['config', 'user.email', 'kora@example.test'], { cwd: auditBranch })
  childProcess.execFileSync('git', ['config', 'user.name', 'Kora Audit'], { cwd: auditBranch })
  fs.writeFileSync(path.join(auditBranch, '.gitkeep'), '')
  childProcess.execFileSync('git', ['add', '.gitkeep'], { cwd: auditBranch })
  childProcess.execFileSync('git', ['commit', '-qm', 'audit: iniciar trilha'], { cwd: auditBranch })
  childProcess.execFileSync('git', ['checkout', '-qb', 'audit/kora'], { cwd: auditBranch })
  expectSuccess(runNode(path.join(fixture, 'scripts/publishKoraAuditSummary.js'), ['--round', round, '--root', fixture, '--archive-root', auditBranch]), 'Registrador publica somente relato sanitizado na branch de auditoria')
  expectFailure(runNode(path.join(fixture, 'scripts/publishKoraAuditSummary.js'), ['--round', round, '--root', fixture, '--archive-root', auditBranch]), 'Branch de auditoria rejeita sobrescrita de relato')
  const audit = fs.readFileSync(path.join(fixture, '.designops/audit/rodada-' + round, 'eventos.jsonl'), 'utf8')
  assert(!audit.includes('figma.com') && !audit.includes('node-id') && !audit.includes('10-20'), 'Auditoria nao pode reter URL ou node ID Figma')

  const completeFixture = createKoraFixture()
  const completeRound = 'kora-completa'
  writeAnalysisRoundFixture(completeFixture, completeRound)
  expectSuccess(runNode(path.join(completeFixture, 'scripts/startKoraRound.js'), ['--round', completeRound, '--figma-url', 'https://www.figma.com/design/nao-publicar', '--sections', 'ref-modalidade-tela-ctx-a,ref-modalidade-tela-ctx-b,ref-modalidade-tela-ctx-c', '--root', completeFixture]), 'Kora inicia a rodada com tres Sections')
  const completeStateFile = path.join(completeFixture, '.designops/runs', completeRound, 'kora.json')
  const completeState = JSON.parse(fs.readFileSync(completeStateFile, 'utf8'))
  const now = '2026-08-05T11:00:00.000Z'
  completeState.status = 'AGUARDANDO_APROVACAO_CONTRATO'
  completeState.checkpoints.analise = { status: 'APROVADA', gatePreProposta: true, reconciliada: true }
  completeState.checkpoints.contrato.status = 'AGUARDANDO_APROVACAO'
  completeState.recibos = [{ papel: 'ANALISTA', checkpoint: 'ANALISE', resultado: 'FAVORAVEL', evidencia: 'gate e reconciliacao favoraveis', ocorreuEm: now }]
  completeState.artefatos = ['referencias.json', 'analise.json', 'contexto.json', 'componentes-locais.json', 'resolvido.json'].map((name) => {
    const file = path.join(completeFixture, '.designops/runs', completeRound, name)
    return { id: name, caminho: '.designops/runs/' + completeRound + '/' + name, sha256: sha256(file) }
  })
  completeState.historico = [
    { de: 'PREPARANDO', para: 'ANALISANDO', ocorreuEm: now, motivo: null },
    { de: 'ANALISANDO', para: 'AGUARDANDO_APROVACAO_CONTRATO', ocorreuEm: now, motivo: null },
  ]
  fs.writeFileSync(completeStateFile, JSON.stringify(completeState, null, 2))
  expectSuccess(runNode(path.join(completeFixture, 'scripts/validateKoraRound.js'), ['--round', completeRound, '--root', completeFixture]), 'Kora exige gate completo antes de apresentar proposta')

  completeState.status = 'MONTANDO'
  completeState.checkpoints.contrato.status = 'APROVADO'
  completeState.checkpoints.montagem.status = 'EM_ANDAMENTO'
  completeState.aprovacoes.contrato = { tipo: 'CONTRATO', decisao: 'APROVADA', confirmadoPor: 'DESIGNER', ocorreuEm: now }
  completeState.historico.push({ de: 'AGUARDANDO_APROVACAO_CONTRATO', para: 'MONTANDO', ocorreuEm: now, motivo: null })
  fs.writeFileSync(completeStateFile, JSON.stringify(completeState, null, 2))
  expectSuccess(runNode(path.join(completeFixture, 'scripts/authorizeKoraAction.js'), ['--round', completeRound, '--role', 'MONTADOR', '--action', 'MONTAR', '--root', completeFixture]), 'Montador so inicia apos aprovacao explicita')

  completeState.status = 'VALIDANDO'
  completeState.checkpoints.montagem.status = 'CONCLUIDA'
  completeState.checkpoints.validacao.status = 'EM_ANDAMENTO'
  completeState.recibos.push({ papel: 'MONTADOR', checkpoint: 'MONTAGEM', resultado: 'FAVORAVEL', evidencia: 'montagem registrada', ocorreuEm: now })
  completeState.historico.push({ de: 'MONTANDO', para: 'VALIDANDO', ocorreuEm: now, motivo: null })
  fs.writeFileSync(completeStateFile, JSON.stringify(completeState, null, 2))
  expectSuccess(runNode(path.join(completeFixture, 'scripts/authorizeKoraAction.js'), ['--round', completeRound, '--role', 'VALIDADOR', '--action', 'VALIDAR', '--root', completeFixture]), 'Validador so inicia depois da montagem')

  completeState.status = 'AGUARDANDO_APROVACAO_PROMOCAO'
  completeState.checkpoints.validacao.status = 'FAVORAVEL'
  completeState.checkpoints.promocao.status = 'AGUARDANDO_APROVACAO'
  completeState.recibos.push({ papel: 'VALIDADOR', checkpoint: 'VALIDACAO', resultado: 'FAVORAVEL', evidencia: 'veredito independente', ocorreuEm: now })
  completeState.historico.push({ de: 'VALIDANDO', para: 'AGUARDANDO_APROVACAO_PROMOCAO', ocorreuEm: now, motivo: null })
  fs.writeFileSync(completeStateFile, JSON.stringify(completeState, null, 2))
  expectSuccess(runNode(path.join(completeFixture, 'scripts/validateKoraRound.js'), ['--round', completeRound, '--root', completeFixture]), 'Kora apresenta promocao somente com veredito favoravel')

  completeState.status = 'CONCLUIDA'
  completeState.checkpoints.promocao.status = 'CONCLUIDA'
  completeState.aprovacoes.promocao = { tipo: 'PROMOCAO', decisao: 'APROVADA', confirmadoPor: 'DESIGNER', ocorreuEm: now }
  completeState.historico.push({ de: 'AGUARDANDO_APROVACAO_PROMOCAO', para: 'CONCLUIDA', ocorreuEm: now, motivo: null })
  fs.writeFileSync(completeStateFile, JSON.stringify(completeState, null, 2))
  expectSuccess(runNode(path.join(completeFixture, 'scripts/validateKoraRound.js'), ['--round', completeRound, '--root', completeFixture]), 'Rodada completa so encerra depois da aprovacao de promocao')
}
function testKoraOperationIncidentRoute() {
  const fixture = createKoraFixture()
  const round = 'kora-incidente'
  expectSuccess(runNode(path.join(fixture, 'scripts/startKoraRound.js'), ['--round', round, '--figma-url', 'https://www.figma.com/design/nao-publicar', '--sections', 'ref-a', '--root', fixture]), 'Kora prepara a rodada antes de diagnosticar incidente')
  const business = runNode(path.join(fixture, 'scripts/diagnoseKoraFailure.js'), ['--round', round, '--role', 'ANALISTA', '--phase', 'ANALISE', '--expected', 'Aplicar regra conhecida', '--observed', 'Regra de elegibilidade nao esta documentada', '--root', fixture])
  expectSuccess(business, 'Regra de negocio vira decisao humana, nao incidente')
  assert.strictEqual(JSON.parse(business.stdout).classificacao, 'DECISAO_DE_NEGOCIO', 'Regra ausente precisa manter classificacao humana')
  const temporary = runNode(path.join(fixture, 'scripts/diagnoseKoraFailure.js'), ['--round', round, '--role', 'ANALISTA', '--phase', 'ANALISE', '--expected', 'Ler referencia', '--observed', 'Timeout temporario da leitura', '--root', fixture])
  expectSuccess(temporary, 'Falha temporaria pode ser recuperada sem incidente prematuro')
  assert.strictEqual(JSON.parse(temporary.stdout).classificacao, 'RECUPERAVEL', 'Timeout precisa seguir recuperacao limitada')
  const evidence = runNode(path.join(fixture, 'scripts/diagnoseKoraFailure.js'), ['--round', round, '--role', 'ANALISTA', '--phase', 'ANALISE', '--expected', 'Ler referencia', '--observed', 'Section de referencia nao encontrada no Figma', '--root', fixture])
  expectSuccess(evidence, 'Indisponibilidade de referencia fica como evidencia insuficiente')
  assert.strictEqual(JSON.parse(evidence.stdout).classificacao, 'EVIDENCIA_INSUFICIENTE', 'Figma indisponivel nao e defeito de codigo sem prova')
  const opened = runNode(path.join(fixture, 'scripts/openKoraOperationIncident.js'), ['--round', round, '--role', 'KORA', '--phase', 'ORQUESTRACAO', '--expected', 'Registrar a mudanca de estado', '--observed', 'TypeError: configuracao do hook invalida em https://www.figma.com/design/segredo?node-id=10-20', '--root', fixture])
  expectSuccess(opened, 'Falha de hook cria incidente de manutencao')
  const openData = JSON.parse(opened.stdout)
  const prompt = fs.readFileSync(path.join(fixture, openData.promptPath), 'utf8')
  assert(prompt.includes('# Encaminhar ao Codex'), 'Incidente precisa conter um unico handoff copiavel')
  assert(!/figma\.com|node-id|10-20/i.test(prompt), 'Pedido de manutencao nao pode vazar referencia Figma')
  expectSuccess(runNode(path.join(fixture, 'scripts/interruptKoraForIncident.js'), ['--round', round, '--incident', openData.incidentId, '--root', fixture]), 'Kora interrompe a rodada sem editar produto ou Figma')
  expectSuccess(runNode(path.join(fixture, 'scripts/recordKoraAuditEvent.js'), ['--round', round, '--type', 'INCIDENTE_OPERACAO_ABERTO', '--result', 'CONCLUIDO', '--message', 'Incidente de manutencao aberto', '--root', fixture]), 'Auditoria registra a abertura do incidente')
  expectSuccess(runNode(path.join(fixture, 'scripts/generateKoraAuditReport.js'), ['--round', round, '--root', fixture]), 'Relato inicial inclui incidente sanitizado')
  expectSuccess(runNode(path.join(fixture, 'scripts/validateKoraAuditTrail.js'), ['--round', round, '--root', fixture]), 'Pacote do incidente tem integridade antes da publicacao')
  const auditBranch = temporaryDirectory('designops-kora-incident-audit-')
  childProcess.execFileSync('git', ['init', '-q'], { cwd: auditBranch })
  childProcess.execFileSync('git', ['config', 'user.email', 'kora@example.test'], { cwd: auditBranch })
  childProcess.execFileSync('git', ['config', 'user.name', 'Kora Audit'], { cwd: auditBranch })
  fs.writeFileSync(path.join(auditBranch, '.gitkeep'), '')
  childProcess.execFileSync('git', ['add', '.gitkeep'], { cwd: auditBranch })
  childProcess.execFileSync('git', ['commit', '-qm', 'audit: iniciar trilha'], { cwd: auditBranch })
  childProcess.execFileSync('git', ['checkout', '-qb', 'audit/kora'], { cwd: auditBranch })
  expectSuccess(runNode(path.join(fixture, 'scripts/publishKoraAuditSummary.js'), ['--round', round, '--root', fixture, '--archive-root', auditBranch]), 'Incidente aberto entra na branch append-only')
  childProcess.execFileSync('git', ['init', '-q'], { cwd: fixture })
  childProcess.execFileSync('git', ['config', 'user.email', 'kora@example.test'], { cwd: fixture })
  childProcess.execFileSync('git', ['config', 'user.name', 'Kora Test'], { cwd: fixture })
  childProcess.execFileSync('git', ['add', '.'], { cwd: fixture })
  childProcess.execFileSync('git', ['commit', '-qm', 'test: estado interrompido'], { cwd: fixture })
  fs.writeFileSync(path.join(fixture, 'correcao-operacao.txt'), 'correcao integrada em fixture\n')
  childProcess.execFileSync('git', ['add', 'correcao-operacao.txt'], { cwd: fixture })
  childProcess.execFileSync('git', ['commit', '-qm', 'fix: corrigir mecanismo Kora'], { cwd: fixture })
  const correctionCommit = childProcess.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: fixture, encoding: 'utf8' }).trim()
  expectSuccess(runNode(path.join(fixture, 'scripts/resumeKoraIncident.js'), ['--round', round, '--incident', openData.incidentId, '--correction-commit', correctionCommit, '--root', fixture]), 'Correcao integrada retoma apenas a fase segura')
  expectSuccess(runNode(path.join(fixture, 'scripts/recordKoraIncidentResolution.js'), ['--round', round, '--incident', openData.incidentId, '--correction-commit', correctionCommit, '--root', fixture]), 'Retomada fica registrada como novo fato append-only')
  expectSuccess(runNode(path.join(fixture, 'scripts/recordKoraAuditEvent.js'), ['--round', round, '--type', 'INCIDENTE_OPERACAO_RETOMADO', '--result', 'CONCLUIDO', '--message', 'Retomada limitada registrada', '--root', fixture]), 'Auditoria registra retomada do incidente')
  expectSuccess(runNode(path.join(fixture, 'scripts/generateKoraAuditReport.js'), ['--round', round, '--root', fixture]), 'Relato atualizado reconhece retomada')
  expectSuccess(runNode(path.join(fixture, 'scripts/validateKoraAuditTrail.js'), ['--round', round, '--root', fixture]), 'Trilha continua valida depois da retomada')
  expectSuccess(runNode(path.join(fixture, 'scripts/publishKoraAuditSummary.js'), ['--round', round, '--root', fixture, '--archive-root', auditBranch]), 'Branch de auditoria recebe apenas a nova evidencia de retomada')
  const archived = runNode(path.join(fixture, 'scripts/auditKoraRounds.js'), ['--round', round, '--root', temporaryDirectory('designops-kora-no-local-'), '--archive-root', auditBranch])
  expectSuccess(archived, 'Auditoria publicada explica incidente sem evidencia local')
  assert.strictEqual(JSON.parse(archived.stdout).rodadas[0].incidentes[0].status, 'RETOMADO', 'Auditoria publicada precisa apontar a retomada segura')
  const resumed = JSON.parse(fs.readFileSync(path.join(fixture, '.designops/runs', round, 'kora.json'), 'utf8'))
  assert.strictEqual(resumed.status, 'ANALISANDO', 'Incidente de orquestracao retorna a analise')
  assert.strictEqual(resumed.aprovacoes.contrato, null, 'Retomada nao restaura aprovacao anterior')
}
function writeValidBaselineFixture(fixture) {
  const metadata = '# Documento\n\n## Status da base\n\n- Aprovado por: [CONFIRMAR]\n- Atualizado em: [CONFIRMAR]\n- Fonte inicial: Curadoria humana\n'
  const required = [
    'docs/manual-credito-consignado.md',
    'docs/modalidades/pcon.md',
    'docs/modalidades/refin.md',
    'docs/modalidades/portabilidade.md',
    'docs/etapas/consentimento.md',
    'docs/etapas/simular-e-revisar.md',
    'docs/etapas/formalizacao.md',
    'docs/contextos/indice.md',
  ]
  fs.mkdirSync(path.join(fixture, 'docs'), { recursive: true })
  fs.writeFileSync(path.join(fixture, 'docs/base-documental.md'), '# Governanca\n')
  required.forEach((relative) => {
    const file = path.join(fixture, relative)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, metadata)
  })
}
function validManifest() {
  return {
    schemaVersion: 3,
    id: 'manifesto-neutro',
    rodada: 'rodada-neutra',
    etapa: 'etapa-exemplo',
    status: 'PROPOSTA_PARA_APROVACAO',
    reconciliacaoMcp: {
      roundId: 'rodada-neutra',
      status: 'APROVADA',
      readAt: '2026-08-04T10:00:00.000Z',
      report: { passed: true },
    },
    fontes: {
      figma: {
        pagina: '1:1',
        descoberta: { metodo: 'figma-get_metadata', paginaNodeId: '1:1' },
        secoesReferencia: [{ nome: 'ref-modalidade-tela-ctx-a', nodeId: '1:2', contextoId: 'ctx-a' }],
      },
      documentos: { manualGlobal: null, mapa: null, manuaisContexto: [] },
    },
    inventario: [{
      tela: 'tela-exemplo',
      modalidade: 'modalidade-exemplo',
      contextoId: 'ctx-a',
      frame: { nome: 'ref-modalidade-tela-ctx-a', nodeId: '1:3' },
      evidencia: { screenshot: '1:3', designContext: '1:3' },
    }],
    execucoesColeta: [
      { coletor: 'scripts/collectPrototypeReactions.js', secao: 'ref-modalidade-tela-ctx-a', nodeId: '1:2', parte: 1 },
      { coletor: 'scripts/collectReferenceStructure.js', secao: 'ref-modalidade-tela-ctx-a', nodeId: '1:2', parte: 1 },
    ],
    coberturaReacoes: [{
      secao: 'ref-modalidade-tela-ctx-a',
      nodeId: '1:2',
      nodesInspecionados: 3,
      nodesComReacao: 1,
      coletor: 'scripts/collectPrototypeReactions.js',
      status: 'COBERTA',
      totalPartes: 1,
      pageSize: 10,
      totalItens: 1,
      itensPorParte: [1],
      partesLidas: [1],
    }],
    coberturaEstrutura: [{
      secao: 'ref-modalidade-tela-ctx-a',
      nodeId: '1:2',
      nodesInspecionados: 3,
      coletor: 'scripts/collectReferenceStructure.js',
      status: 'COBERTA',
      totalPartes: 1,
      pageSize: 20,
      totalItens: 3,
      itensPorParte: [3],
      partesLidas: [1],
    }],
    reacoes: [{
      origem: { nodeId: '1:3', nome: 'acao-principal' },
      gatilho: { type: 'ON_CLICK' },
      target: { kind: 'NODE', node: { id: '1:4', name: 'destino', scope: 'SECTION' } },
      tipo: 'PRINCIPAL',
      fonte: 'FIGMA',
      status: 'OBSERVADA',
    }],
    diferencas: [],
    lacunas: [],
    evidenciasEstruturais: [],
  }
}
function validReferenceScope() {
  return {
    schemaVersion: 1,
    id: 'referencias-neutras',
    rodada: 'rodada-neutra',
    figma: {
      pageId: '1:1',
      pageName: 'Pagina de referencia',
      secoes: [{ nome: 'ref-modalidade-tela-ctx-a', sectionId: '1:2', contextoId: 'ctx-a' }],
    },
    ativosForaDoRecorte: 'IGNORAR',
    ativosExistentes: { politica: 'EVIDENCIA_APENAS', adocaoAutomatica: false },
  }
}
function validContextDraft() {
  return {
    schemaVersion: 1,
    id: 'contexto-neutro',
    rodada: 'rodada-neutra',
    status: 'AGUARDANDO_DESIGNER',
    modalidade: 'modalidade-exemplo',
    etapa: 'etapa-exemplo',
    contextos: [{ id: 'ctx-a', rotulo: null }],
    afirmacoes: [
      {
        id: 'topologia-observada',
        escopo: 'CONTEXTO',
        contextoId: 'ctx-a',
        categoria: 'TOPOLOGIA_OBSERVADA',
        classificacao: 'FATO_OBSERVADO',
        texto: 'Caminho observado na referencia.',
        valorControlado: null,
        bloqueante: false,
        fonte: { tipo: 'FIGMA', referencias: [{ section: 'ref-modalidade-tela-ctx-a', nodeId: '1:2' }] },
      },
      {
        id: 'retorno-pendente',
        escopo: 'CONTEXTO',
        contextoId: 'ctx-a',
        categoria: 'RETORNO_APP',
        classificacao: 'CONFIRMAR',
        texto: 'Contrato de retorno ainda nao confirmado.',
        valorControlado: 'DIRETO',
        bloqueante: true,
        fonte: { tipo: 'AUSENTE', motivo: 'Sem documento ou confirmacao humana.' },
      },
    ],
    aprovacaoHumana: null,
  }
}
function validateManifest(manifest, referenceScope = validReferenceScope()) {
  const fixture = temporaryDirectory('designops-manifest-')
  const file = path.join(fixture, 'analise.json')
  const scopeFile = path.join(fixture, 'referencias.json')
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2))
  fs.writeFileSync(scopeFile, JSON.stringify(referenceScope, null, 2))
  return runNode(path.join(root, 'scripts/validateAnalysisManifest.js'), [file, scopeFile])
}

function addSectionsToAnalysisFixture(references, manifest) {
  for (const suffix of ['b', 'c']) {
    const sectionId = suffix === 'b' ? '1:5' : '1:8'
    const frameId = suffix === 'b' ? '1:6' : '1:9'
    const sectionName = `ref-modalidade-tela-ctx-${suffix}`
    const contextId = `ctx-${suffix}`
    references.figma.secoes.push({ nome: sectionName, sectionId, contextoId: contextId })
    manifest.fontes.figma.secoesReferencia.push({ nome: sectionName, nodeId: sectionId, contextoId: contextId })
    manifest.inventario.push({
      ...manifest.inventario[0],
      contextoId: contextId,
      frame: { nome: sectionName, nodeId: frameId },
      evidencia: { screenshot: frameId, designContext: frameId },
    })
    manifest.execucoesColeta.push(
      { coletor: 'scripts/collectPrototypeReactions.js', secao: sectionName, nodeId: sectionId, parte: 1 },
      { coletor: 'scripts/collectReferenceStructure.js', secao: sectionName, nodeId: sectionId, parte: 1 },
    )
    manifest.coberturaReacoes.push({ ...manifest.coberturaReacoes[0], secao: sectionName, nodeId: sectionId })
    manifest.coberturaEstrutura.push({ ...manifest.coberturaEstrutura[0], secao: sectionName, nodeId: sectionId })
  }
}

function writeAnalysisRoundFixture(fixture, round = 'rodada-neutra') {
  const roundDirectory = path.join(fixture, '.designops', 'runs', round)
  fs.mkdirSync(roundDirectory, { recursive: true })
  const references = validReferenceScope()
  references.rodada = round
  const manifest = validManifest()
  manifest.rodada = round
  manifest.reconciliacaoMcp.roundId = round
  addSectionsToAnalysisFixture(references, manifest)
  const context = validContextDraft()
  context.rodada = round
  const components = {
    schemaVersion: 1,
    id: 'componentes-neutros',
    rodada: round,
    contextosConhecidos: [
      { id: 'ctx-a', rotulo: 'Contexto A' },
      { id: 'ctx-b', rotulo: 'Contexto B' },
      { id: 'ctx-c', rotulo: 'Contexto C' },
    ],
    componentes: [],
  }
  const resolved = { schemaVersion: 1, rodada: round, telas: [], jornadas: [] }
  fs.writeFileSync(path.join(roundDirectory, 'referencias.json'), JSON.stringify(references))
  fs.writeFileSync(path.join(roundDirectory, 'analise.json'), JSON.stringify(manifest))
  fs.writeFileSync(path.join(roundDirectory, 'contexto.json'), JSON.stringify(context))
  fs.writeFileSync(path.join(roundDirectory, 'componentes-locais.json'), JSON.stringify(components))
  fs.writeFileSync(path.join(roundDirectory, 'resolvido.json'), JSON.stringify(resolved))
  return { roundDirectory, manifest, references }
}

function testAnalysisRoundGate() {
  const fixture = temporaryDirectory('designops-analysis-round-')
  const round = 'rodada-neutra'
  const { roundDirectory, manifest, references } = writeAnalysisRoundFixture(fixture, round)
  const script = path.join(root, 'scripts', 'validateAnalysisRound.js')
  const args = ['--round', round, '--root', fixture]
  expectSuccess(runNode(script, [...args, '--stage', 'pre-coleta']), 'Gate pre-coleta com recorte canonico')
  expectSuccess(runNode(script, [...args, '--stage', 'pre-proposta']), 'Gate pre-proposta com tres Sections e cobertura completa')

  fs.writeFileSync(path.join(fixture, '.designops', 'runs', 'referencias.json'), '{}')
  expectFailure(runNode(script, [...args, '--stage', 'pre-coleta']), 'Gate reprova artefato na raiz de runs')
  fs.rmSync(path.join(fixture, '.designops', 'runs', 'referencias.json'))

  fs.writeFileSync(path.join(roundDirectory, 'referencias.json'), '{}')
  expectFailure(runNode(script, [...args, '--stage', 'pre-coleta']), 'Gate reprova recorte sem schema vigente')
  fs.writeFileSync(path.join(roundDirectory, 'referencias.json'), JSON.stringify(references))

  const baseline = JSON.parse(JSON.stringify(manifest))
  const proposalWithoutReconciliation = JSON.parse(JSON.stringify(baseline))
  delete proposalWithoutReconciliation.reconciliacaoMcp
  expectFailure(validateManifest(proposalWithoutReconciliation, references), 'Proposta exige recibo favoravel da reconciliacao MCP')
  for (const status of ['PRECISA_CONTEXTO', 'NAO_VERIFICAVEL']) {
    const incomplete = JSON.parse(JSON.stringify(baseline))
    incomplete.status = status
    incomplete.lacunas = [{ id: `${status.toLowerCase()}-bloqueante`, bloqueante: true, motivo: 'Rodada sem condicao de propor.' }]
    expectSuccess(validateManifest(incomplete, references), `Manifesto aceita ${status} com lacuna bloqueante`)
  }
  const missingSection = manifest.fontes.figma.secoesReferencia[2]
  manifest.coberturaReacoes = manifest.coberturaReacoes.filter((coverage) => coverage.nodeId !== missingSection.nodeId)
  manifest.coberturaEstrutura = manifest.coberturaEstrutura.filter((coverage) => coverage.nodeId !== missingSection.nodeId)
  manifest.execucoesColeta = manifest.execucoesColeta.filter((execution) => execution.nodeId !== missingSection.nodeId)
  fs.writeFileSync(path.join(roundDirectory, 'analise.json'), JSON.stringify(manifest))
  expectFailure(runNode(script, [...args, '--stage', 'pre-proposta']), 'Gate reprova Section sem ambos os coletores')
  Object.assign(manifest, JSON.parse(JSON.stringify(baseline)))

  manifest.coberturaEstrutura[0] = {
    ...manifest.coberturaEstrutura[0], totalPartes: 2, totalItens: 3, pageSize: 2,
    itensPorParte: [2, 1], partesLidas: [1], status: 'PARCIAL',
  }
  manifest.status = 'ANALISE_INCOMPLETA'
  manifest.lacunas = [{ id: 'coleta-pendente', bloqueante: true, motivo: 'Parte estrutural pendente.' }]
  fs.writeFileSync(path.join(roundDirectory, 'analise.json'), JSON.stringify(manifest))
  expectSuccess(validateManifest(manifest, references), 'Manifesto incompleto com cobertura parcial e lacuna')
  expectFailure(runNode(script, [...args, '--stage', 'pre-proposta']), 'Gate bloqueia proposta com cobertura parcial')

  manifest.status = 'PROPOSTA_PARA_APROVACAO'
  manifest.lacunas = []
  fs.writeFileSync(path.join(roundDirectory, 'analise.json'), JSON.stringify(manifest))
  expectFailure(runNode(script, [...args, '--stage', 'pre-proposta']), 'Gate bloqueia parte estrutural nao lida')

  Object.assign(manifest, JSON.parse(JSON.stringify(baseline)))
  fs.writeFileSync(path.join(roundDirectory, 'analise.json'), JSON.stringify(manifest))
  fs.rmSync(path.join(roundDirectory, 'contexto.json'))
  expectFailure(runNode(script, [...args, '--stage', 'pre-proposta']), 'Gate exige contexto da rodada')
  fs.writeFileSync(path.join(roundDirectory, 'contexto.json'), JSON.stringify({ ...validContextDraft(), rodada: round }))
  fs.mkdirSync(path.join(fixture, 'docs', 'mapas'), { recursive: true })
  fs.writeFileSync(path.join(fixture, 'docs', 'mapas', 'pcon-formalizacao-rascunho.md'), '# Rascunho\n\nrodada: ' + round + '\n')
  expectFailure(runNode(script, [...args, '--stage', 'pre-proposta']), 'Gate bloqueia mapa rascunho anterior a validacao')

  fs.rmSync(path.join(fixture, 'docs', 'mapas', 'pcon-formalizacao-rascunho.md'))
  fs.rmSync(path.join(roundDirectory, 'resolvido.json'))
  expectSuccess(runNode(script, [...args, '--stage', 'pre-proposta']), 'Gate nao exige resolucao sem contrato dependente de IDs')
  manifest.requerResolucaoIds = true
  fs.writeFileSync(path.join(roundDirectory, 'analise.json'), JSON.stringify(manifest))
  expectFailure(runNode(script, [...args, '--stage', 'pre-proposta']), 'Gate exige resolucao quando a proposta depende de IDs')

  const gateOutput = JSON.parse(runNode(script, [...args, '--stage', 'pre-proposta']).stdout)
  assert.strictEqual(gateOutput.operator.status, 'PRECISA_DE_ACAO_INTERNA', 'Gate precisa devolver estado humano para o operador')
  assert(gateOutput.operator.problemas.every((problem) => problem.mensagemHumana && problem.proximaAcao), 'Gate precisa traduzir falhas para proxima acao humana')
}

function testAnalystOperation() {
  const fixture = temporaryDirectory('designops-analyst-operation-')
  const round = 'analise-operador'
  const start = path.join(root, 'scripts', 'startAnalystRun.js')
  const render = path.join(root, 'scripts', 'renderAnalystStatus.js')
  const validate = path.join(root, 'scripts', 'validateAnalystOperation.js')
  const common = ['--root', fixture, '--round', round]
  expectSuccess(runNode(start, [...common, '--figma-url', 'https://www.figma.com/design/abc/teste', '--sections', 'ref-pcon-formalizacao-ctx-a,ref-pcon-formalizacao-ctx-b', '--contexto', 'PCon, Formalizacao; duas variacoes observadas.']), 'Iniciador cria rodada a partir da entrada minima')
  const stateFile = path.join(fixture, '.designops', 'runs', round, 'estado-analista.json')
  expectSuccess(runNode(validate, [stateFile]), 'Estado inicial do Analista valido')
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'))
  assert.strictEqual(state.entrada.sections.length, 2, 'Cartao precisa registrar Sections informadas')
  assert.strictEqual(state.decisoes.length, 0, 'Cartao inicial nao pode criar pergunta desnecessaria')
  state.status = 'AGUARDANDO_DECISAO_DO_DESIGNER'
  state.progresso.sections.forEach((section) => { section.status = 'CONCLUIDA' })
  state.achados = [{ tipo: 'FATO', titulo: 'Duas variacoes observadas', descricao: 'As referencias possuem hierarquia semelhante.' }]
  state.confrontos = [
    { id: 'etapa', topico: 'Formalizacao', observacao: 'A referencia mostra a etapa final da jornada.', situacaoBase: 'DOCUMENTADO', fontesBase: ['docs/etapas/formalizacao.md'], conclusao: 'A base ja define Formalizacao como etapa canonica.' },
    { id: 'retorno', topico: 'Retorno ao app', observacao: 'A tela indica uma saida externa.', situacaoBase: 'SEM_BASE', fontesBase: [], conclusao: 'A regra de retorno precisa da sua decisao antes da montagem.' },
  ]
  state.decisoes = [{ id: 'contexto', pergunta: 'As duas variacoes representam contextos diferentes?', impacto: 'A resposta define a proposta de conteudo.', recomendacao: 'Tratar como contextos diferentes ate sua confirmacao.', status: 'PENDENTE' }]
  state.proposta = { status: 'PRONTA', resumo: 'Pacote pronto para revisao.', entregaveis: ['Mapa temporario', 'Plano de variaveis'] }
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
  const report = runNode(render, [...common, '--write'])
  expectSuccess(report, 'Resumo humano da rodada')
  assert(report.stdout.includes('Só preciso da sua decisão nestes pontos'), 'Resumo precisa apresentar decisao em linguagem humana')
  assert(report.stdout.includes('O que a base já estabelece') && report.stdout.includes('O que a referência traz para decidir'), 'Resumo precisa cruzar base e referencia para a pessoa operadora')
  assert(!report.stdout.includes('[CONFIRMAR]') && !report.stdout.includes('schema'), 'Resumo nao pode expor rotulos internos')
  assert(fs.existsSync(path.join(fixture, '.designops', 'runs', round, 'resumo-operador.md')), 'Resumo precisa ser gravado junto da rodada')
  assert(fs.existsSync(path.join(fixture, '.designops', 'runs', round, 'pacote-analista.md')), 'Pacote temporario precisa ser gravado junto da rodada')
}
function testFigmaApiContracts() {
  const screenSchema = JSON.parse(fs.readFileSync(path.join(root, 'docs/contratos/tela.schema.json'), 'utf8'))
  const overflowValues = screenSchema.properties.prototype.properties.overflowDirection.enum
  assert(overflowValues.includes('BOTH'), 'Contrato de tela precisa aceitar BOTH, enum real da Plugin API')
  assert(!overflowValues.includes('HORIZONTAL_AND_VERTICAL'), 'Contrato de tela nao pode aceitar enum inexistente')

  for (const relative of [
    'scripts/validateCreation.js',
    'scripts/validateContentContract.js',
    'scripts/validateJourneySection.js',
    'scripts/validatePromotion.js',
  ]) {
    const source = fs.readFileSync(path.join(root, relative), 'utf8')
    assert(source.includes('componentPropertyDefinitionsOf'), relative + ' precisa proteger leitura de variante')
  }

  const inspectSource = fs.readFileSync(path.join(root, 'scripts/inspectRemoteComponent.js'), 'utf8')
  assert(inspectSource.includes('importComponentByKeyAsync'), 'Preflight precisa importar COMPONENT pela API correta')
  assert(inspectSource.includes('importComponentSetByKeyAsync'), 'Preflight precisa importar COMPONENT_SET pela API correta')
  assert(inspectSource.includes('component.parent?.type === \'COMPONENT_SET\''), 'Preflight precisa ler definitions no set pai da variante')

  const structureSource = fs.readFileSync(path.join(root, 'scripts/collectReferenceStructure.js'), 'utf8')
  const reactionsSource = fs.readFileSync(path.join(root, 'scripts/collectPrototypeReactions.js'), 'utf8')
  const manifestCoreSource = fs.readFileSync(path.join(root, 'scripts/validateAnalysisManifestCore.js'), 'utf8')
  const referenceScopeCoreSource = fs.readFileSync(path.join(root, 'scripts/validateReferenceScopeCore.js'), 'utf8')
  const reconciliationSource = fs.readFileSync(path.join(root, 'scripts/reconcileAnalysisManifestFigma.js'), 'utf8')
  assert(structureSource.includes('totalPartes'), 'Coletor estrutural precisa expor a quantidade total de partes')
  assert(structureSource.includes('itensPorParte'), 'Coletor estrutural precisa expor a distribuicao da leitura')
  assert(reactionsSource.includes('totalParts'), 'Coletor de reacoes precisa paginar a leitura completa')
  assert(!manifestCoreSource.includes("require('fs')"), 'Validador MCP nao pode depender de fs')
  assert(!manifestCoreSource.includes('process.exit'), 'Validador MCP nao pode depender de process')
  assert(!referenceScopeCoreSource.includes("require('fs')"), 'Validador de recorte MCP nao pode depender de fs')
  assert(!referenceScopeCoreSource.includes('process.exit'), 'Validador de recorte MCP nao pode depender de process')
  assert(structureSource.includes('COMPONENTE_LOCAL_COM_IDS'), 'Coletor precisa distinguir componente local com IDS descendente')
  assert(structureSource.includes("child.type === 'SLOT'"), 'Coletor deve parar em instancia remota fora de Slot nativo')
  assert(!reconciliationSource.includes("require('fs')"), 'Reconciliacao MCP nao pode depender de fs')
  assert(!reconciliationSource.includes('process.exit'), 'Reconciliacao MCP nao pode depender de process')

  const analysisSkill = fs.readFileSync(path.join(root, '.github/skills/consignado-analise/SKILL.md'), 'utf8')
  assert(analysisSkill.includes('figma-get_figma_skill'), 'Analista precisa carregar a skill oficial antes de use_figma')
  assert(analysisSkill.includes('partesLidas'), 'Analista precisa registrar que leu todas as partes')
  assert(analysisSkill.includes('um coletor, uma Section e uma parte'), 'Analista precisa impedir coleta combinada')
  assert(analysisSkill.includes('Nunca use IDs de memoria'), 'Analista precisa redescobrir IDs no arquivo atual')
  assert(analysisSkill.includes('NAO_APLICAVEL'), 'Analista precisa distinguir regra sem escopo de violacao')
  assert(analysisSkill.includes('propriedadesVisuaisComValorSemBindingObservado'), 'Analista precisa preservar o nome do sinal estrutural retornado pelo coletor')
  assert(analysisSkill.includes('nunca o renomeie para\n`camposVisuaisSemBindingObservado`'), 'Analista precisa bloquear explicitamente o nome antigo do sinal estrutural')
  assert(analysisSkill.includes('validateAnalysisManifestCore.js'), 'Analista precisa validar o manifesto sem terminal')
  assert(analysisSkill.includes('validateAnalysisRound.js --round <rodada> --stage pre-coleta'), 'Analista precisa executar gate antes da coleta')
  assert(analysisSkill.includes('validateAnalysisRound.js --round <rodada> --stage pre-proposta'), 'Analista precisa executar gate antes da proposta')
  assert(analysisSkill.includes('reconcileAnalysisManifestFigma.js'), 'Analista precisa reconciliar o manifesto com Figma atual')
  assert(analysisSkill.includes('return await reconcileAnalysisManifestFigma(manifest, referenceScope);'), 'Analista precisa receber a chamada literal da reconciliacao MCP com recorte')
  assert(analysisSkill.includes('nunca chame\n`skill://index.json`'), 'Analista nao pode procurar skills locais no MCP do Figma')
  assert(analysisSkill.includes('.designops/runs/<outra-rodada>/'), 'Analista precisa isolar rodadas novas de artefatos anteriores')
  assert(analysisSkill.includes('## Escopo de skills'), 'Skill do Analista precisa diferenciar coleta tecnica isolada')
  assert(analysisSkill.includes('somente esta\nskill `consignado-analise`, `figma-plugin-api`'), 'Coleta tecnica isolada precisa carregar as duas skills locais minimas')
  assert(analysisSkill.includes('Em analise completa, leia tambem'), 'Analise completa precisa carregar o conjunto adicional de skills')
  assert(analysisSkill.includes('referencias.json'), 'Analista precisa fixar recorte de referencias')
  assert(analysisSkill.includes('COMPONENTE_LOCAL_COM_IDS'), 'Analista precisa registrar IDS dentro de composicao local')

  const analystAgent = fs.readFileSync(path.join(root, '.github/agents/analista.agent.md'), 'utf8')
  assert(analystAgent.includes('somente `consignado-analise` e\n`figma-plugin-api`'), 'Agente Analista precisa limitar skills em coleta tecnica isolada')
  assert(analystAgent.includes('Em analise completa, carregue'), 'Agente Analista precisa preservar as skills da analise completa')
  assert(analystAgent.includes('Em contexto guiado que inclui leitura de\nreferencias Figma'), 'Agente Analista precisa carregar o conjunto correto em contexto guiado com Figma')
  assert(analystAgent.includes('referencias.json'), 'Agente Analista precisa declarar recorte de referencias')
  assert(analystAgent.includes('validateAnalysisRound.js'), 'Agente Analista precisa declarar gate operacional')
  assert(analystAgent.includes('`FATO OBSERVADO`, `REGRA\nDOCUMENTADA`, `REGRA CONFIRMADA` ou `[CONFIRMAR]`'), 'Contexto guiado precisa separar fato de regra por origem')

  const contextSkill = fs.readFileSync(path.join(root, '.github/skills/consignado-contexto/SKILL.md'), 'utf8')
  assert(contextSkill.includes('## Contexto guiado com referencias Figma'), 'Skill de contexto precisa definir a leitura Figma')
  assert(contextSkill.includes('`consignado-contexto`, `consignado-analise` e `figma-plugin-api`'), 'Contexto guiado com Figma precisa carregar as skills locais minimas')
  assert(contextSkill.includes('Estrutura, reacao,\nsequencia, timeout e tela existente no Figma sao somente `FATO\nOBSERVADO`'), 'Skill de contexto precisa impedir que Figma vire regra de negocio')
  assert(contextSkill.includes('Nao liste diretorios inteiros'), 'Skill de contexto precisa bloquear descoberta ampla de documentos')
  assert(contextSkill.includes('validateContextDraftCore.js'), 'Skill de contexto precisa validar rascunho sem terminal')
  assert(contextSkill.includes('regra documentada nao e perguntada de novo'), 'Contexto precisa reutilizar regra da base')
  assert(contextSkill.includes('nao altere manual global, modalidade'), 'Contexto nao pode reescrever a base')

  const baseSkill = fs.readFileSync(path.join(root, '.github/skills/consignado-base/SKILL.md'), 'utf8')
  assert(baseSkill.includes('sem Figma'), 'Curadoria da base nao pode abrir Figma')
  assert(baseSkill.includes('aprovacao humana explicita'), 'Curadoria precisa de checkpoint humano')
  assert(baseSkill.includes('merge manual'), 'Curadoria precisa exigir promocao manual')

  const contextCoreSource = fs.readFileSync(path.join(root, 'scripts/validateContextDraftCore.js'), 'utf8')
  assert(!contextCoreSource.includes("require('fs')"), 'Validador de contexto MCP nao pode depender de fs')
  assert(!contextCoreSource.includes('process.exit'), 'Validador de contexto MCP nao pode depender de process')
}
function testManifestValidationWithoutTerminal() {
  const validateAnalysisManifestData = loadFigmaFunction(
    'scripts/validateAnalysisManifestCore.js',
    'validateAnalysisManifestData',
    {},
  )
  assert.strictEqual(
    validateAnalysisManifestData(validManifest(), validReferenceScope()).length,
    0,
    'Validador portatil precisa aprovar manifesto completo sem terminal',
  )
  const invalid = validManifest()
  invalid.fontes.figma.descoberta = null
  assert(
    validateAnalysisManifestData(invalid, validReferenceScope()).some((failure) => failure.includes('descoberta atual')),
    'Validador portatil precisa reprovar manifesto sem descoberta atual',
  )
}
function testReferenceScopeValidationWithoutTerminal() {
  const validateReferenceScopeData = loadFigmaFunction(
    'scripts/validateReferenceScopeCore.js',
    'validateReferenceScopeData',
    {},
  )
  assert.strictEqual(validateReferenceScopeData(validReferenceScope()).length, 0, 'Recorte valido precisa aprovar sem terminal')
  const invalid = validReferenceScope()
  invalid.ativosExistentes.adocaoAutomatica = true
  assert(
    validateReferenceScopeData(invalid).some((failure) => failure.includes('adocao automatica')),
    'Recorte nao pode permitir adocao automatica de ativo existente',
  )
  const manifest = validManifest()
  manifest.evidenciasEstruturais = [{
    nodeId: '1:8', sectionId: '1:2', nome: 'local-existente',
    tipoEncontrado: 'COMPONENTE_LOCAL_EXISTENTE', decisao: 'CANDIDATO_COMPONENTE_LOCAL',
  }]
  const validateAnalysisManifestData = loadFigmaFunction('scripts/validateAnalysisManifestCore.js', 'validateAnalysisManifestData', {})
  assert(
    validateAnalysisManifestData(manifest, validReferenceScope()).some((failure) => failure.includes('nao pode ser adotado automaticamente')),
    'Ativo local existente nao pode virar candidato automaticamente',
  )
}
function testContextDraftValidationWithoutTerminal() {
  const validateContextDraftData = loadFigmaFunction(
    'scripts/validateContextDraftCore.js',
    'validateContextDraftData',
    {},
  )
  assert.strictEqual(
    validateContextDraftData(validContextDraft()).length,
    0,
    'Rascunho de contexto deve aceitar fato Figma e regra pendente separados',
  )

  const inferredRule = validContextDraft()
  inferredRule.afirmacoes[1] = {
    ...inferredRule.afirmacoes[1],
    classificacao: 'FATO_OBSERVADO',
    fonte: { tipo: 'FIGMA', referencias: [{ section: 'ref-modalidade-tela-ctx-a' }] },
  }
  assert(
    validateContextDraftData(inferredRule).some((failure) => failure.includes('nao pode transformar fato Figma em regra de negocio')),
    'Rascunho precisa reprovar retorno inferido a partir do Figma',
  )

  const missingSource = validContextDraft()
  missingSource.afirmacoes[0].fonte = { tipo: 'DOCUMENTO' }
  assert(
    validateContextDraftData(missingSource).some((failure) => failure.includes('FATO_OBSERVADO precisa de fonte FIGMA')),
    'Fato observado sem fonte Figma precisa reprovar',
  )

  const unapproved = validContextDraft()
  unapproved.status = 'APROVADO_PARA_REGISTRO'
  assert(
    validateContextDraftData(unapproved).some((failure) => failure.includes('aprovacao humana')),
    'Contexto aprovado sem registro humano precisa reprovar',
  )
  assert(
    validateContextDraftData(unapproved).some((failure) => failure.includes('CONFIRMAR bloqueante')),
    'Contexto aprovado com lacuna bloqueante precisa reprovar',
  )
}
async function testManifestReconciliationWithoutTerminal() {
  const destination = { id: '1:4', name: 'destino', type: 'FRAME', children: [] }
  const action = {
    id: '1:3',
    name: 'acao-principal',
    type: 'FRAME',
    children: [],
    reactions: [{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', destinationId: '1:4' }] }],
  }
  const section = {
    id: '1:2',
    name: 'ref-modalidade-tela-ctx-a',
    type: 'SECTION',
    children: [action, destination],
    findAll: () => [action, destination],
  }
  const page = { id: '1:1', children: [section], findOne: (predicate) => predicate(section) ? section : null }
  const figma = { root: { children: [page] } }
  const validateAnalysisManifestData = loadFigmaFunction('scripts/validateAnalysisManifestCore.js', 'validateAnalysisManifestData', {})
  const reconcileAnalysisManifestFigma = loadFigmaFunction(
    'scripts/reconcileAnalysisManifestFigma.js',
    'reconcileAnalysisManifestFigma',
    figma,
    { validateAnalysisManifestData },
  )
  const approved = await reconcileAnalysisManifestFigma(validManifest(), validReferenceScope())
  assert.strictEqual(approved.passed, true, 'Reconciliacao MCP precisa aprovar manifesto que coincide com Figma atual')

  const stale = validManifest()
  stale.coberturaEstrutura[0].nodesInspecionados = 8
  stale.coberturaEstrutura[0].totalItens = 8
  stale.coberturaEstrutura[0].itensPorParte = [8]
  const rejected = await reconcileAnalysisManifestFigma(stale, validReferenceScope())
  assert.strictEqual(rejected.passed, false, 'Reconciliacao MCP precisa reprovar manifesto reaproveitado com estrutura divergente')
  assert(rejected.failures.some((failure) => failure.includes('cobertura estrutural')), 'Reconciliacao precisa explicar a divergencia estrutural')
}
async function testRemoteComponentPreflight() {
  let componentImports = 0
  let setImports = 0
  const createInstance = () => ({
    componentProperties: { 'Titulo#1:2': { type: 'TEXT', value: 'Exemplo' } },
    remove: () => {},
  })
  const component = {
    remote: true,
    name: 'Botao',
    parent: null,
    componentPropertyDefinitions: { 'Titulo#1:2': { type: 'TEXT', defaultValue: 'Continuar' } },
    createInstance,
  }
  const componentSet = {
    remote: true,
    name: 'Item',
    componentPropertyDefinitions: { 'Titulo#1:2': { type: 'TEXT', defaultValue: 'Titulo' } },
    defaultVariant: { createInstance },
  }
  const inspectRemoteComponent = loadFigmaFunction('scripts/inspectRemoteComponent.js', 'inspectRemoteComponent', {
    importComponentByKeyAsync: async () => { componentImports += 1; return component },
    importComponentSetByKeyAsync: async () => { setImports += 1; return componentSet },
  })
  let report = await inspectRemoteComponent({ key: 'component-key', assetType: 'component', libraryKey: 'library-a' })
  assert.strictEqual(report.passed, true, 'Preflight de COMPONENT deveria aprovar candidato remoto')
  assert.strictEqual(componentImports, 1, 'Preflight de COMPONENT deve usar importComponentByKeyAsync')
  report = await inspectRemoteComponent({ key: 'component-key', assetType: 'component' })
  assert.strictEqual(report.passed, false, 'Preflight sem biblioteca de origem deveria reprovar')
  report = await inspectRemoteComponent({ key: 'set-key', assetType: 'component_set', libraryKey: 'library-a' })
  assert.strictEqual(report.passed, true, 'Preflight de COMPONENT_SET deveria aprovar candidato remoto')
  assert.strictEqual(setImports, 1, 'Preflight de COMPONENT_SET deve usar importComponentSetByKeyAsync')
}
function createJourneyFigma({ aliases = [], includeInstance = true, variant = false } = {}) {
  const contentVariable = { id: 'content-variable', variableCollectionId: 'content-collection' }
  const otherVariable = { id: 'other-variable', variableCollectionId: 'other-content-collection' }
  const idsVariable = { id: 'ids-variable', variableCollectionId: 'ids-structural-collection' }
  const mainComponent = {
    id: 'template-id',
    type: 'COMPONENT',
    boundVariables: { aliases: aliases.map((id) => ({ type: 'VARIABLE_ALIAS', id })) },
  }
  if (variant) {
    const componentSet = { id: 'set-id', type: 'COMPONENT_SET', componentPropertyDefinitions: {} }
    mainComponent.parent = componentSet
    Object.defineProperty(mainComponent, 'componentPropertyDefinitions', {
      get: () => { throw new Error('variante nao pode expor definitions diretamente') },
    })
  }
  const instance = {
    id: 'instance-id',
    name: 'instancia-esperada',
    type: 'INSTANCE',
    mainComponent,
    boundVariables: {},
    explicitVariableModes: {},
  }
  const descendants = includeInstance ? [instance] : []
  const section = {
    id: 'section-id',
    name: 'Jornada modalidade-exemplo',
    type: 'SECTION',
    explicitVariableModes: { 'content-collection': 'mode-a' },
    findAll: () => descendants,
  }
  const variables = new Map([
    [contentVariable.id, contentVariable],
    [otherVariable.id, otherVariable],
    [idsVariable.id, idsVariable],
  ])
  return {
    getNodeByIdAsync: async (id) => ({ 'section-id': section, 'instance-id': instance, 'template-id': mainComponent })[id] ?? null,
    variables: { getVariableByIdAsync: async (id) => variables.get(id) ?? null },
  }
}
function journeyContract() {
  return {
    contentCollectionId: 'content-collection',
    modeId: 'mode-a',
    knownContentCollectionIds: ['content-collection', 'other-content-collection'],
    templates: [{
      instanceId: 'instance-id',
      templateId: 'template-id',
      expectedContentVariableIds: ['content-variable'],
      expectedContentRoles: ['titulo'],
    }],
    selection: {
      contextId: 'ctx-a',
      presentTemplateIds: ['template-id'],
      absentTemplateIds: [],
    },
  }
}
async function testJourneyAndLocalComponents() {
  let figma = createJourneyFigma({ includeInstance: false })
  let validateJourneySection = loadFigmaFunction('scripts/validateJourneySection.js', 'validateJourneySection', figma)
  let report = await validateJourneySection('section-id', journeyContract())
  assert.strictEqual(report.passed, false, 'Section sem templates deveria reprovar')

  figma = createJourneyFigma({ aliases: [] })
  validateJourneySection = loadFigmaFunction('scripts/validateJourneySection.js', 'validateJourneySection', figma)
  report = await validateJourneySection('section-id', journeyContract())
  assert.strictEqual(report.passed, false, 'Template sem binding de conteudo deveria reprovar')

  figma = createJourneyFigma({ aliases: ['other-variable'] })
  validateJourneySection = loadFigmaFunction('scripts/validateJourneySection.js', 'validateJourneySection', figma)
  report = await validateJourneySection('section-id', journeyContract())
  assert.strictEqual(report.passed, false, 'Template ligado a outra collection deveria reprovar')

  figma = createJourneyFigma({ aliases: ['content-variable', 'ids-variable'] })
  validateJourneySection = loadFigmaFunction('scripts/validateJourneySection.js', 'validateJourneySection', figma)
  report = await validateJourneySection('section-id', journeyContract())
  assert.strictEqual(report.passed, true, 'Section valida com IDS estrutural deveria aprovar')

  figma = createJourneyFigma({ aliases: ['content-variable'], variant: true })
  validateJourneySection = loadFigmaFunction('scripts/validateJourneySection.js', 'validateJourneySection', figma)
  report = await validateJourneySection('section-id', journeyContract())
  assert.strictEqual(report.passed, true, 'Section com variante deve ler definitions no COMPONENT_SET pai')

  const selectionWithAbsent = journeyContract()
  selectionWithAbsent.selection.absentTemplateIds = ['template-id']
  selectionWithAbsent.selection.presentTemplateIds = []
  report = await validateJourneySection('section-id', selectionWithAbsent)
  assert.strictEqual(report.passed, false, 'Template ausente escondido ou presente deveria reprovar')

  const internalArea = { name: '_componentes-locais', parent: null }
  const invalidComponent = {
    id: 'local-invalid',
    type: 'COMPONENT',
    name: '_componentes-locais/exemplo/ctx-a-item',
    description: '',
    parent: internalArea,
  }
  let validateLocalComponents = loadFigmaFunction('scripts/validateLocalComponents.js', 'validateLocalComponents', {
    getNodeByIdAsync: async () => invalidComponent,
  })
  report = await validateLocalComponents('local-invalid', {
    approved: false,
    reuseEvidence: [{ modalidade: 'modalidade-a', etapa: 'etapa-a', tela: 'tela-a', casoUso: 'caso-a' }],
    knownContexts: [{ id: 'ctx-a', label: 'Rotulo A' }],
  })
  assert.strictEqual(report.passed, false, 'Componente sem aprovacao, um uso e contexto no nome deveria reprovar')

  const validComponent = {
    id: 'local-valid',
    type: 'COMPONENT',
    name: '_componentes-locais/exemplo/item',
    description: 'Composicao reutilizavel',
    parent: internalArea,
  }
  validateLocalComponents = loadFigmaFunction('scripts/validateLocalComponents.js', 'validateLocalComponents', {
    getNodeByIdAsync: async () => validComponent,
  })
  report = await validateLocalComponents('local-valid', {
    approved: true,
    reuseEvidence: [
      { modalidade: 'modalidade-a', etapa: 'etapa-a', tela: 'tela-a', casoUso: 'caso-a' },
      { modalidade: 'modalidade-a', etapa: 'etapa-b', tela: 'tela-b', casoUso: 'caso-b' },
    ],
    knownContexts: [{ id: 'ctx-a', label: 'Rotulo A' }],
  })
  assert.strictEqual(report.passed, true, 'Componente aprovado com duas reutilizacoes deveria aprovar')
}

async function testInteractionCompositionAndReconstruction() {
  const action = {
    id: 'action-url',
    name: 'acao-pdf',
    reactions: [{
      trigger: { type: 'ON_CLICK' },
      actions: [{ type: 'URL', url: 'https://example.test/documento.pdf' }],
    }],
  }
  const interactionRoot = {
    id: 'interaction-root',
    name: 'tela',
    children: [action],
    findAll: () => [action],
  }
  let validateInteractionContract = loadFigmaFunction('scripts/validateInteractionContract.js', 'validateInteractionContract', {
    getNodeByIdAsync: async (id) => id === interactionRoot.id ? interactionRoot : null,
  })
  let report = await validateInteractionContract('interaction-root', {
    reactions: [{ name: 'acao-pdf', expected: 'url', url: 'https://example.test/documento.pdf' }],
  })
  assert.strictEqual(report.passed, true, 'URL HTTPS declarada deveria aprovar')
  action.reactions[0].actions[0].url = 'http://example.test/documento.pdf'
  report = await validateInteractionContract('interaction-root', {
    reactions: [{ name: 'acao-pdf', expected: 'url' }],
  })
  assert.strictEqual(report.passed, false, 'URL nao HTTPS deveria reprovar')

  const remoteMain = { id: 'ids-main', key: 'ids-key', remote: true }
  const detached = {
    id: 'ids-instance',
    name: 'acao-principal',
    type: 'INSTANCE',
    mainComponent: remoteMain,
    detachedInfo: { componentId: 'old' },
  }
  const template = {
    id: 'template',
    name: '_rascunho-modalidade-etapa-tela',
    type: 'COMPONENT',
    children: [detached],
    findAll: () => [detached],
  }
  let validateCompositionContract = loadFigmaFunction('scripts/validateCompositionContract.js', 'validateCompositionContract', {
    getNodeByIdAsync: async (id) => id === template.id ? template : null,
  })
  report = await validateCompositionContract('template', {
    roles: [{ id: 'acao', source: 'IDS', target: { nodeName: 'acao-principal' }, componentKey: 'ids-key' }],
  })
  assert.strictEqual(report.passed, false, 'Instancia destacada deveria reprovar o contrato de composicao')
  detached.detachedInfo = null
  report = await validateCompositionContract('template', {
    roles: [{ id: 'acao', source: 'IDS', target: { nodeName: 'acao-principal' }, componentKey: 'ids-key' }],
  })
  assert.strictEqual(report.passed, true, 'Instancia IDS com key correta deveria aprovar')
  remoteMain.remote = false
  report = await validateCompositionContract('template', {
    roles: [{ id: 'acao', source: 'IDS', target: { nodeName: 'acao-principal' }, componentKey: 'ids-key' }],
  })
  assert.strictEqual(report.passed, false, 'Imitador local nao pode aprovar como papel IDS')

  const child = (id, name, y, height) => ({
    id,
    name,
    type: 'FRAME',
    absoluteBoundingBox: { x: 0, y, width: 360, height },
    children: [],
    parent: null,
  })
  const content = child('content', 'conteudo', 0, 700)
  const footer = child('footer', 'rodape', 752, 48)
  const screen = {
    id: 'screen',
    name: '_rascunho-modalidade-etapa-tela',
    type: 'COMPONENT',
    width: 360,
    height: 800,
    overflowDirection: 'VERTICAL',
    numberOfFixedChildren: 1,
    absoluteBoundingBox: { x: 0, y: 0, width: 360, height: 800 },
    children: [content, footer],
    findAll: () => [content, footer],
  }
  content.parent = screen
  footer.parent = screen
  const reference = { ...screen, id: 'reference', name: 'ref-modalidade-tela-ctx-a' }
  const figma = {
    getNodeByIdAsync: async (id) => ({ screen, reference })[id] ?? null,
    variables: { getLocalVariablesAsync: async () => [] },
  }
  const validateReconstructionContract = loadFigmaFunction('scripts/validateReconstructionContract.js', 'validateReconstructionContract', figma)
  const reconstructionContract = {
    viewport: { surface: 'mobile', width: 360, height: 800 },
    prototype: { overflowDirection: 'VERTICAL', fixedChildren: ['rodape'], fixedBottomTolerance: 2, fixedNoOverlap: true },
    roles: [{ id: 'raiz', target: { root: true }, reference: { root: true }, type: 'COMPONENT', source: 'local-layout' }],
  }
  report = await validateReconstructionContract('screen', 'reference', reconstructionContract)
  assert.strictEqual(report.passed, true, 'Rodape declarado e fixado corretamente deveria aprovar')
  footer.absoluteBoundingBox.y = 740
  report = await validateReconstructionContract('screen', 'reference', reconstructionContract)
  assert.strictEqual(report.passed, false, 'Rodape fora do limite inferior deveria reprovar')
}

async function testSlotsAndTypographyContracts() {
  const createSlotFixture = ({ twoSlots = false, propertyName = 'Conteudo', contentInside = true, limitViolations = [], exposePropertyLink = true } = {}) => {
    const contentA = { id: 'content-a', name: 'conteudo-a', type: 'TEXT', children: [] }
    const contentB = { id: 'content-b', name: 'conteudo-b', type: 'TEXT', children: [] }
    const slotA = {
      id: 'slot-a', name: 'slot-a', type: 'SLOT', limitViolations,
      componentPropertyReferences: exposePropertyLink ? { slotContent: 'Conteudo#1:2' } : {},
      children: contentInside ? [contentA] : [],
    }
    const slotB = {
      id: 'slot-b', name: 'slot-b', type: 'SLOT', limitViolations: [],
      componentPropertyReferences: { slotContent: 'Complemento#1:3' }, children: [contentB],
    }
    const remoteMain = {
      id: 'remote-main', key: 'ids-card', remote: true,
      componentPropertyDefinitions: {
        'Conteudo#1:2': { type: 'SLOT', name: 'Conteudo' },
        'Complemento#1:3': { type: 'SLOT', name: 'Complemento' },
      },
    }
    const host = { id: 'host', name: 'card-ids', type: 'INSTANCE', mainComponent: remoteMain, children: twoSlots ? [slotA, slotB] : [slotA] }
    if (!contentInside) host.children.push(contentA)
    const template = { id: 'template-slot', name: '_rascunho-modalidade-etapa-tela', type: 'COMPONENT', children: [host], findAll: () => [host] }
    const roles = [
      { id: 'host', source: 'IDS', target: { nodeName: 'card-ids' }, componentKey: 'ids-card' },
      { id: 'content-a', source: 'TEXTO', target: { nodeName: 'conteudo-a' } },
    ]
    const slots = [{ id: 'slot-principal', hostRole: 'host', slotName: 'slot-a', componentPropertyName: propertyName, libraryKey: 'library-ids', contentRoleIds: ['content-a'] }]
    if (twoSlots) {
      roles.push({ id: 'content-b', source: 'TEXTO', target: { nodeName: 'conteudo-b' } })
      slots.push({ id: 'slot-complementar', hostRole: 'host', slotName: 'slot-b', componentPropertyName: 'Complemento', libraryKey: 'library-ids', contentRoleIds: ['content-b'] })
    }
    return { template, roles, slots }
  }
  const runSlot = async (options) => {
    const fixture = createSlotFixture(options)
    const validateCompositionContract = loadFigmaFunction('scripts/validateCompositionContract.js', 'validateCompositionContract', {
      getNodeByIdAsync: async (id) => id === fixture.template.id ? fixture.template : null,
    })
    return validateCompositionContract(fixture.template.id, { roundId: 'rodada-slot', roles: fixture.roles, slots: fixture.slots })
  }
  let report = await runSlot()
  assert.strictEqual(report.passed, true, 'Slot valido deve provar host, property, conteudo e limites')
  assert.strictEqual(report.slotResults[0].componentPropertyKey, 'Conteudo#1:2', 'Evidencia de Slot deve guardar a key publica completa')
  report = await runSlot({ twoSlots: true })
  assert.strictEqual(report.passed, true, 'Dois Slots no mesmo componente devem ser distinguidos pela property publica')
  report = await runSlot({ propertyName: 'Inexistente' })
  assert.strictEqual(report.verificationStatus, 'REPROVADO', 'Property publica errada deve reprovar')
  report = await runSlot({ contentInside: false })
  assert.strictEqual(report.verificationStatus, 'REPROVADO', 'Conteudo fora do Slot deve reprovar')
  for (const violation of ['BELOW_MIN', 'ABOVE_MAX', 'HAS_NON_PREFERRED']) {
    report = await runSlot({ limitViolations: [violation] })
    assert.strictEqual(report.verificationStatus, 'REPROVADO', `limitViolation ${violation} deve reprovar`)
  }
  report = await runSlot({ exposePropertyLink: false })
  assert.strictEqual(report.verificationStatus, 'NAO_VERIFICAVEL', 'Sem releitura do vinculo Slot/property o resultado deve ser NAO_VERIFICAVEL')

  let segments = [{ start: 0, end: 5, textStyleId: 'style-body', boundVariables: {} }]
  const text = { id: 'text-a', name: 'texto-a', type: 'TEXT', getStyledTextSegments: () => segments }
  const template = { id: 'template-type', type: 'COMPONENT', name: '_rascunho-tipo', children: [text], findAll: () => [text] }
  const validateTypographyContract = loadFigmaFunction('scripts/validateTypographyContract.js', 'validateTypographyContract', {
    getNodeByIdAsync: async (id) => id === template.id ? template : null,
  })
  const styles = [
    { role: 'body', styleId: 'style-body', boundVariableIds: [] },
    { role: 'strong', styleId: 'style-strong', boundVariableIds: ['weight-variable'] },
  ]
  report = await validateTypographyContract(template.id, {
    roundId: 'rodada-tipo', styles,
    targets: [{ id: 'titulo', target: { nodeName: 'texto-a' }, kind: 'UNICO', source: 'IDS_STYLE', styleRole: 'body' }],
  })
  assert.strictEqual(report.passed, true, 'Texto UNICO com Text Style IDS deve aprovar')
  segments = [
    { start: 0, end: 2, textStyleId: 'style-body', boundVariables: {} },
    { start: 2, end: 5, textStyleId: 'style-strong', boundVariables: { fontWeight: { type: 'VARIABLE_ALIAS', id: 'weight-variable' } } },
  ]
  report = await validateTypographyContract(template.id, {
    roundId: 'rodada-tipo', styles,
    targets: [{ id: 'titulo-misto', target: { nodeName: 'texto-a' }, kind: 'MISTO', source: 'IDS_STYLE', segments: [{ styleRole: 'body' }, { styleRole: 'strong' }] }],
  })
  assert.strictEqual(report.passed, true, 'Texto MISTO deve comparar segmentos, estilos e bindings')
  delete text.getStyledTextSegments
  report = await validateTypographyContract(template.id, {
    roundId: 'rodada-tipo', styles,
    targets: [{ id: 'sem-leitura', target: { nodeName: 'texto-a' }, kind: 'UNICO', source: 'IDS_STYLE', styleRole: 'body' }],
  })
  assert.strictEqual(report.verificationStatus, 'NAO_VERIFICAVEL', 'Sem leitura de segmentos, tipografia nao e verificavel')
}

async function testPromotionMcpAndModes() {
  const contentVariable = { id: 'content-variable', variableCollectionId: 'content-collection' }
  const candidate = {
    id: 'candidate', name: '_rascunho-modalidade-etapa-tela', type: 'COMPONENT', children: [],
    findAll: () => [], boundVariables: { content: { type: 'VARIABLE_ALIAS', id: 'content-variable' } },
    explicitVariableModes: { 'ids-structural': 'theme-claro' },
  }
  const reference = { id: 'reference', name: 'ref-modalidade-tela-ctx-a', type: 'FRAME' }
  const validatePromotion = loadFigmaFunction('scripts/validatePromotion.js', 'validatePromotion', {
    getNodeByIdAsync: async (id) => ({ candidate, reference })[id] ?? null,
    variables: { getLocalVariablesAsync: async () => [contentVariable] },
  })
  const evidence = {
    creationPassed: true, contentContractPassed: true, compositionContractPassed: true,
    typographyContractPassed: true, modeBehaviorPassed: true, reconstructionContractPassed: true,
    layoutPassed: true, visualReviewPassed: true, roundPassed: true,
    typographyRequired: false, validatorVerdict: 'APTO PARA PROMOCAO',
    mcpReports: { composition: { roundId: 'rodada-promocao', templateId: 'candidate', passed: true, verificationStatus: 'APROVADO', slotResults: [] } },
  }
  let report = await validatePromotion('candidate', { contentCollectionId: 'content-collection', referenceIds: ['reference'], roundId: 'rodada-promocao', evidence })
  assert.strictEqual(report.passed, true, 'Mode estrutural IDS permitido nao pode bloquear promocao')
  candidate.explicitVariableModes['content-collection'] = 'modo-contexto'
  report = await validatePromotion('candidate', { contentCollectionId: 'content-collection', referenceIds: ['reference'], roundId: 'rodada-promocao', evidence })
  assert.strictEqual(report.passed, false, 'Mode de conteudo no template deve bloquear promocao')
}

async function testPrototypeCollectionOutsideSection() {
  const source = {
    id: 'source',
    name: 'acao-externa',
    type: 'FRAME',
    reactions: [{
      trigger: { type: 'ON_CLICK' },
      actions: [{ type: 'NODE', destinationId: 'outside' }],
    }],
  }
  const secondSource = {
    id: 'second-source',
    name: 'acao-secundaria',
    type: 'FRAME',
    reactions: [{
      trigger: { type: 'ON_CLICK' },
      actions: [{ type: 'BACK' }],
    }],
  }
  const section = {
    id: 'section',
    name: 'ref-modalidade-tela-ctx-a',
    type: 'SECTION',
    children: [source, secondSource],
    findAll: () => [source, secondSource],
  }
  const page = {
    id: 'page',
    findOne: (predicate) => predicate(section) ? section : null,
  }
  const collectPrototypeReactions = loadFigmaFunction('scripts/collectPrototypeReactions.js', 'collectPrototypeReactions', {
    root: { children: [page] },
    setCurrentPageAsync: async () => {},
    getNodeByIdAsync: async (id) => id === 'outside'
      ? { id: 'outside', name: 'evidencia-externa' }
      : null,
  })
  const report = await collectPrototypeReactions('page', 'section', { part: 1, pageSize: 1 })
  const target = report.reacoes[0].reactions[0].acoes[0].target
  assert.strictEqual(target.kind, 'NODE', 'Coletor precisa registrar destino NODE')
  assert.strictEqual(target.node.scope, 'FORA_DA_SECTION', 'Coletor precisa distinguir destino fora da Section')
  assert.strictEqual(report.paginacao.totalPartes, 2, 'Coletor de reacoes precisa dividir uma leitura grande')
  assert.strictEqual(report.cobertura.status, 'PARCIAL', 'Cobertura nao pode ser concluida antes da ultima parte')
  const secondPart = await collectPrototypeReactions('page', 'section', { part: 2, pageSize: 1 })
  assert.strictEqual(secondPart.reacoes[0].origem.id, 'second-source', 'Segunda parte precisa conservar a reacao restante')
}

async function testReferenceStructurePagination() {
  const nodes = ['a', 'b', 'c'].map((id) => ({
    id,
    name: 'frame-' + id,
    type: 'FRAME',
    children: [],
    layoutMode: 'VERTICAL',
    absoluteBoundingBox: { x: 0, y: 0, width: 360, height: 80 },
    boundVariables: {},
  }))
  const section = {
    id: 'section',
    name: 'ref-modalidade-tela-ctx-a',
    type: 'SECTION',
    children: nodes,
    findOne: (predicate) => predicate(section) ? section : null,
    findAll: () => nodes,
    boundVariables: {},
  }
  const page = {
    id: 'page',
    findOne: (predicate) => predicate(section) ? section : null,
  }
  const collectReferenceStructure = loadFigmaFunction('scripts/collectReferenceStructure.js', 'collectReferenceStructure', {
    root: { children: [page] },
    setCurrentPageAsync: async () => {},
  })
  const firstPart = await collectReferenceStructure('page', 'section', { part: 1, pageSize: 2 })
  const secondPart = await collectReferenceStructure('page', 'section', { part: 2, pageSize: 2 })
  assert.strictEqual(firstPart.paginacao.totalPartes, 2, 'Coletor estrutural precisa dividir todos os nos')
  assert.strictEqual(firstPart.cobertura.status, 'PARCIAL', 'Estrutura nao pode ser coberta antes de todas as partes')
  assert.deepStrictEqual(
    [...firstPart.nodes, ...secondPart.nodes].map((node) => node.id),
    ['section', 'a', 'b', 'c'],
    'Partes estruturais precisam reconstruir a arvore completa sem omissao',
  )
}

async function testLocalCompositionWithIds() {
  const remoteChild = {
    id: 'remote-ids', name: 'ids-card', type: 'INSTANCE', children: [{ id: 'opaque-child', name: 'opaque', type: 'TEXT', children: [] }],
    mainComponent: { id: 'remote-main', key: 'ids-card-key', remote: true }, boundVariables: {},
  }
  const local = { id: 'local-component', name: 'composicao-local', type: 'COMPONENT', children: [remoteChild], layoutMode: 'VERTICAL', boundVariables: {} }
  const section = {
    id: 'section', name: 'ref-modalidade-tela-ctx-a', type: 'SECTION', children: [local], boundVariables: {},
    findOne: (predicate) => predicate(section) ? section : null,
  }
  const page = { id: 'page', findOne: (predicate) => predicate(section) ? section : null }
  const collectReferenceStructure = loadFigmaFunction('scripts/collectReferenceStructure.js', 'collectReferenceStructure', {
    root: { children: [page] }, setCurrentPageAsync: async () => {},
  })
  const report = await collectReferenceStructure('page', 'section', { part: 1, pageSize: 20 })
  assert.strictEqual(report.sinais.totais.remoteInstances, 1, 'IDS aninhado em componente local precisa ser encontrado')
  assert.strictEqual(report.sinais.totais.componentesLocaisComIDS, 1, 'Composicao local com IDS precisa ser identificada')
  assert.strictEqual(report.sinais.nestaParte.componentesLocaisComIDS[0].instanciasIDSDescendentes[0].mainComponentKey, 'ids-card-key', 'IDS descendente precisa preservar key')
  assert(!report.nodes.some((node) => node.id === 'opaque-child'), 'Coletor nao pode atravessar internals opacos de instancia remota')
}

async function testCanvasOrganization() {
  const localArea = {
    id: 'local-area',
    name: '_componentes-locais',
    type: 'SECTION',
    absoluteBoundingBox: { x: 0, y: 0, width: 500, height: 500 },
    findAll: () => [
      { id: 'local-a', name: 'componente-local-a', type: 'COMPONENT', parent: localArea, absoluteBoundingBox: { x: 20, y: 20, width: 200, height: 64 } },
      { id: 'local-b', name: 'componente-local-b', type: 'COMPONENT', parent: localArea, absoluteBoundingBox: { x: 120, y: 40, width: 200, height: 64 } },
    ],
  }
  const page = {
    id: 'page',
    name: 'pagina',
    type: 'PAGE',
    children: [localArea],
  }
  const validateCanvasOrganization = loadFigmaFunction('scripts/validateCanvasOrganization.js', 'validateCanvasOrganization', {
    getNodeByIdAsync: async (id) => id === page.id ? page : null,
  })
  const report = await validateCanvasOrganization('page', {
    regions: ['_componentes-locais'],
    checkLocalComponentOverlap: true,
  })
  assert.strictEqual(report.passed, false, 'Componentes locais sobrepostos dentro da Section devem reprovar')
  assert.strictEqual(report.localComponentOverlaps.length, 1, 'Sobreposicao dentro de _componentes-locais deve ser registrada')
}

function testValidateRound() {
  const fixture = temporaryDirectory('designops-round-')
  const screens = path.join(fixture, 'screens')
  fs.mkdirSync(screens)
  const legacyInput = path.join(fixture, 'legacy-v1.json')
  const legacyOutput = path.join(fixture, 'legacy-v2.json')
  fs.writeFileSync(legacyInput, JSON.stringify({ schemaVersion: 1, id: 'legado' }))
  expectSuccess(runNode(path.join(root, 'scripts/migrateScreenContractV1ToV2.js'), [legacyInput, legacyOutput]), 'Migracao explicita v1 para v2')
  const migrated = JSON.parse(fs.readFileSync(legacyOutput, 'utf8'))
  assert.strictEqual(migrated.migration.status, 'PENDENTE_REVISAO_HUMANA', 'Migracao nao pode aprovar Slots e tipografia sozinha')
  const screen = {
    schemaVersion: 2,
    id: 'screen-a',
    modalidade: 'modalidade-a',
    etapa: 'etapa-a',
    tela: 'tela-a',
    viewport: { surface: 'mobile', width: 360, height: 800 },
    prototype: { overflowDirection: 'NONE', fixedChildren: [] },
    roles: [{ id: 'raiz', source: 'LOCAL_LAYOUT' }],
    interacoes: [],
    slots: [],
    typography: [],
  }
  const journey = {
    schemaVersion: 1,
    id: 'jornada-a',
    modalidade: 'modalidade-a',
    collectionConteudo: 'Conteudo - Modalidade A',
    contextos: [{ id: 'ctx-a', mode: 'mode-a' }],
    selecoes: [{ contextoId: 'ctx-a', tela: 'tela-a', casoUso: 'padrao', presente: true, template: 'modalidade-a/etapa-a/tpl-tela-a' }],
  }
  const resolved = {
    schemaVersion: 1,
    rodada: 'rodada-a',
    telas: [{ contratoId: 'screen-a', referencias: [{ contextoId: 'ctx-a', sectionId: '1:2', frameId: '1:3' }] }],
    jornadas: [{ contratoId: 'jornada-a', contextoId: 'ctx-a', sectionId: '1:4', modeId: 'mode-a' }],
  }
  const screenFile = path.join(screens, 'screen-a.json')
  const journeyFile = path.join(fixture, 'journey.json')
  const resolvedFile = path.join(fixture, 'resolved.json')
  const componentsFile = path.join(fixture, 'componentes-locais.json')
  fs.writeFileSync(screenFile, JSON.stringify(screen))
  fs.writeFileSync(journeyFile, JSON.stringify(journey))
  fs.writeFileSync(resolvedFile, JSON.stringify(resolved))
  fs.writeFileSync(componentsFile, JSON.stringify({ schemaVersion: 1, id: 'componentes-a', rodada: 'rodada-a', contextosConhecidos: [{ id: 'ctx-a', rotulo: 'Contexto A' }], componentes: [] }))
  const roundArgs = ['--screens', screens, '--journey', journeyFile, '--resolved', resolvedFile, '--components', componentsFile]
  expectSuccess(runNode(path.join(root, 'scripts/validateRound.js'), roundArgs), 'Round valido')
  const manifestFile = path.join(fixture, 'analise.json')
  const referenceScopeFile = path.join(fixture, 'referencias.json')
  fs.writeFileSync(manifestFile, JSON.stringify(validManifest()))
  fs.writeFileSync(referenceScopeFile, JSON.stringify(validReferenceScope()))
  expectFailure(
    runNode(path.join(root, 'scripts/validateRound.js'), [...roundArgs, '--manifest', manifestFile]),
    'Round com manifesto sem referencias da rodada',
  )
  expectSuccess(
    runNode(path.join(root, 'scripts/validateRound.js'), [...roundArgs, '--manifest', manifestFile, '--references', referenceScopeFile]),
    'Round com manifesto e recorte de referencias',
  )

  screen.roles = [
    { id: 'host', source: 'IDS' },
    { id: 'texto-slot', source: 'TEXTO' },
  ]
  screen.slots = [{ id: 'slot-a', hostRole: 'host', slotName: 'slot-a', componentPropertyName: 'Conteudo', contentRoleIds: ['texto-slot'] }]
  screen.typography = [{ id: 'tipo-a', targetRole: 'texto-slot', kind: 'UNICO', source: 'IDS_STYLE', styleRole: 'corpo' }]
  fs.writeFileSync(screenFile, JSON.stringify(screen))
  const evidenceFile = path.join(fixture, 'evidencias-mcp.json')
  const evidence = {
    schemaVersion: 1,
    roundId: 'rodada-a',
    referencesConsulted: [{ reference: 'figma-use', reason: 'pre-requisito MCP da rodada', symbols: ['use_figma'] }],
    slots: [{
      contractId: 'screen-a', slotId: 'slot-a', roundId: 'rodada-a', hostInstanceId: 'host-real', slotNodeId: 'slot-real', contentNodeIds: ['content-real'],
      componentKey: 'component-key', libraryKey: 'library-key', componentPropertyKey: 'Conteudo#1:2', componentPropertyName: 'Conteudo', componentPropertyType: 'SLOT',
      writtenAt: '2026-08-04T10:00:00.000Z', readAt: '2026-08-04T10:01:00.000Z', limitViolations: [], status: 'APROVADO', passed: true,
      report: { roundId: 'rodada-a', passed: true, verificationStatus: 'APROVADO', slotResults: [{ id: 'slot-a', hostInstanceId: 'host-real', slotNodeId: 'slot-real', contentNodeIds: ['content-real'], componentKey: 'component-key', libraryKey: 'library-key', componentPropertyKey: 'Conteudo#1:2', componentPropertyName: 'Conteudo', componentPropertyType: 'SLOT', limitViolations: [], passed: true }] },
    }],
    typography: [{
      contractId: 'screen-a', typographyId: 'tipo-a', roundId: 'rodada-a', targetNodeIds: ['content-real'],
      writtenAt: '2026-08-04T10:00:00.000Z', readAt: '2026-08-04T10:01:00.000Z', status: 'APROVADO', passed: true,
      report: { roundId: 'rodada-a', passed: true, verificationStatus: 'APROVADO', targetResults: [{ id: 'tipo-a', targetNodeIds: ['content-real'], passed: true }] },
    }],
  }
  const runPromotionRound = (nextEvidence, description, shouldPass = true) => {
    fs.writeFileSync(evidenceFile, JSON.stringify(nextEvidence))
    const result = runNode(path.join(root, 'scripts/validateRound.js'), [...roundArgs, '--stage', 'pre-promocao', '--evidence', evidenceFile])
    if (shouldPass) expectSuccess(result, description)
    else expectFailure(result, description)
  }
  runPromotionRound(evidence, 'Evidencia MCP vinculada a Slot e tipografia')
  const changedRound = JSON.parse(JSON.stringify(evidence)); changedRound.roundId = 'rodada-outra'
  runPromotionRound(changedRound, 'Evidencia de outra rodada', false)
  const missingReport = JSON.parse(JSON.stringify(evidence)); missingReport.slots[0].report = {}
  runPromotionRound(missingReport, 'Relatorio MCP de Slot ausente', false)
  const divergentIds = JSON.parse(JSON.stringify(evidence)); divergentIds.slots[0].report.slotResults[0].slotNodeId = 'outro-slot'
  runPromotionRound(divergentIds, 'IDs divergentes no relatorio MCP', false)
  const failedEvidence = JSON.parse(JSON.stringify(evidence)); failedEvidence.slots[0].passed = false
  runPromotionRound(failedEvidence, 'Evidencia MCP reprovada', false)
  const missingId = JSON.parse(JSON.stringify(evidence)); missingId.slots[0].contentNodeIds = []
  runPromotionRound(missingId, 'Evidencia MCP sem ID de conteudo', false)
  const staleRead = JSON.parse(JSON.stringify(evidence)); staleRead.slots[0].readAt = staleRead.slots[0].writtenAt
  runPromotionRound(staleRead, 'Releitura sem ordem temporal posterior', false)
  const notVerifiable = JSON.parse(JSON.stringify(evidence)); notVerifiable.slots[0].status = 'NAO_VERIFICAVEL'; notVerifiable.slots[0].passed = false
  runPromotionRound(notVerifiable, 'Falha de releitura deve permanecer NAO_VERIFICAVEL', false)

  journey.composicoesInternas = [{
    id: 'confirmacao-externa',
    contextoId: 'ctx-a',
    etapaHospedeira: 'etapa-a',
    presente: true,
    orientacao: 'DIRETA_COM_TUTORIAL_OPCIONAL',
    retorno: 'DIRETO',
    origemRegra: 'convenio',
  }]
  fs.writeFileSync(journeyFile, JSON.stringify(journey))
  expectSuccess(runNode(path.join(root, 'scripts/validateRound.js'), roundArgs), 'Composicao externa com tutorial opcional valida')
  delete journey.composicoesInternas[0].orientacao
  fs.writeFileSync(journeyFile, JSON.stringify(journey))
  expectFailure(runNode(path.join(root, 'scripts/validateRound.js'), roundArgs), 'Composicao externa presente sem roteiro de orientacao')
  journey.composicoesInternas[0].orientacao = 'DIRETA'
  journey.composicoesInternas[0].presente = false
  fs.writeFileSync(journeyFile, JSON.stringify(journey))
  expectFailure(runNode(path.join(root, 'scripts/validateRound.js'), roundArgs), 'Composicao externa ausente com retorno declarado')
  journey.composicoesInternas = []
  journey.selecoes[0].template = null
  fs.writeFileSync(journeyFile, JSON.stringify(journey))
  expectFailure(runNode(path.join(root, 'scripts/validateRound.js'), roundArgs), 'Jornada sem template para tela presente')
}
async function main() {
  try {
    let fixture = createSquadFixture()
    const operatorFile = path.join(fixture, '.github/agents/operador.agent.md')
    fs.writeFileSync(operatorFile, fs.readFileSync(operatorFile, 'utf8').replace('  - agent\n', ''))
    expectFailure(runNode(path.join(fixture, 'scripts/validatePilotSquad.js')), 'Operador sem ferramenta agent')

    fixture = createSquadFixture()
    const readerFile = path.join(fixture, '.github/agents/leitor-de-etapa.agent.md')
    fs.writeFileSync(readerFile, fs.readFileSync(readerFile, 'utf8').replace('  - search/codebase\n', '  - search/codebase\n  - edit\n'))
    expectFailure(runNode(path.join(fixture, 'scripts/validatePilotSquad.js')), 'Leitor com edit')

    fixture = createSquadFixture()
    const readerFileWithFigma = path.join(fixture, '.github/agents/leitor-de-etapa.agent.md')
    fs.writeFileSync(readerFileWithFigma, fs.readFileSync(readerFileWithFigma, 'utf8').replace('  - search/codebase\n', '  - search/codebase\n  - figma/*\n'))
    expectFailure(runNode(path.join(fixture, 'scripts/validatePilotSquad.js')), 'Leitor com Figma')

    fixture = createSquadFixture()
    const koraFile = path.join(fixture, '.github/agents/kora.agent.md')
    fs.writeFileSync(koraFile, fs.readFileSync(koraFile, 'utf8').replace('user-invocable: true', 'user-invocable: false'))
    expectFailure(runNode(path.join(fixture, 'scripts/validatePilotSquad.js')), 'Kora precisa ser a unica porta humana')

    testKoraRoundAndAudit()
    testKoraOperationIncidentRoute()

    let manifest = validManifest()
    delete manifest.fontes.figma.descoberta
    expectFailure(validateManifest(manifest), 'Manifesto sem descoberta atual de referencias')
    manifest = validManifest()
    manifest.execucoesColeta = []
    expectFailure(validateManifest(manifest), 'Manifesto sem execucoes unitarias de coleta')
    manifest = validManifest()
    manifest.execucoesColeta.push({ ...manifest.execucoesColeta[0] })
    expectFailure(validateManifest(manifest), 'Manifesto com execucao de coleta duplicada')
    manifest = validManifest()
    manifest.execucoesColeta[0].parte = 2
    expectFailure(validateManifest(manifest), 'Manifesto com parte de coleta inexistente')
    manifest = validManifest()
    manifest.verificacoesTecnicas = [{ regraId: 'ids-remoto', aplicacao: { secoesReferencia: [] }, status: 'VIOLADA' }]
    expectFailure(validateManifest(manifest), 'Verificacao tecnica sem escopo explicito')
    manifest = validManifest()
    manifest.verificacoesTecnicas = [{ regraId: 'ids-remoto', aplicacao: { secoesReferencia: ['ref-modalidade-tela-ctx-a'] }, status: 'NAO_APLICAVEL' }]
    expectSuccess(validateManifest(manifest), 'Verificacao tecnica nao aplicavel com escopo explicito')
    manifest = validManifest()
    manifest.reacoes = []
    expectFailure(validateManifest(manifest), 'Manifesto com reacoes vazias')
    manifest = validManifest()
    manifest.coberturaReacoes = []
    expectFailure(validateManifest(manifest), 'Manifesto sem cobertura de uma Section')
    manifest = validManifest()
    manifest.coberturaEstrutura = []
    expectFailure(validateManifest(manifest), 'Manifesto sem cobertura estrutural de uma Section')
    manifest = validManifest()
    manifest.reacoes[0].target.node = null
    expectFailure(validateManifest(manifest), 'Reacao observada sem destino')
    manifest = validManifest()
    manifest.coberturaEstrutura[0].totalPartes = 2
    manifest.coberturaEstrutura[0].partesLidas = [1]
    expectFailure(validateManifest(manifest), 'Manifesto com parte estrutural nao lida')
    manifest = validManifest()
    manifest.coberturaReacoes[0].itensPorParte = [2]
    expectFailure(validateManifest(manifest), 'Manifesto com distribuicao de leitura invalida')
    expectSuccess(validateManifest(validManifest()), 'Manifesto completo')

    testAnalysisRoundGate()
    testAnalystOperation()
    await testJourneyAndLocalComponents()
    await testInteractionCompositionAndReconstruction()
    await testSlotsAndTypographyContracts()
    await testPromotionMcpAndModes()
    await testPrototypeCollectionOutsideSection()
    await testReferenceStructurePagination()
    await testLocalCompositionWithIds()
    await testCanvasOrganization()
    testFigmaApiContracts()
    testManifestValidationWithoutTerminal()
    testReferenceScopeValidationWithoutTerminal()
    testContextDraftValidationWithoutTerminal()
    await testManifestReconciliationWithoutTerminal()
    await testRemoteComponentPreflight()
    testValidateRound()

    fixture = temporaryDirectory('designops-baseline-')
    copy('scripts/validateBaselineClean.js', fixture)
    writeValidBaselineFixture(fixture)
    childProcess.execFileSync('git', ['init', '-q'], { cwd: fixture })
    expectSuccess(runNode(path.join(fixture, 'scripts/validateBaselineClean.js')), 'Base documental valida')
    fs.mkdirSync(path.join(fixture, 'docs/mapas'), { recursive: true })
    fs.writeFileSync(path.join(fixture, 'docs/mapas/pcon.md'), '# Mapa concreto\n')
    expectFailure(runNode(path.join(fixture, 'scripts/validateBaselineClean.js')), 'Mapa concreto no baseline')
    fs.rmSync(path.join(fixture, 'docs/mapas/pcon.md'))
    fs.mkdirSync(path.join(fixture, '.designops/runs/rodada-a'), { recursive: true })
    fs.writeFileSync(path.join(fixture, '.designops/runs/rodada-a/analise.json'), '{}\n')
    expectFailure(runNode(path.join(fixture, 'scripts/validateBaselineClean.js')), 'Estado de rodada no baseline')
    fs.rmSync(path.join(fixture, '.designops/runs/rodada-a'), { recursive: true, force: true })
    fs.writeFileSync(path.join(fixture, 'docs/modalidades/pcon.md'), '# PCon\n\n## Status da base\n\n- Aprovado por: [CONFIRMAR]\n- Atualizado em: [CONFIRMAR]\n')
    expectFailure(runNode(path.join(fixture, 'scripts/validateBaselineClean.js')), 'Manual-base sem fonte')

    console.log('Testes de guardrails aprovados.')
  } finally {
    for (const directory of temporaryDirectories) fs.rmSync(directory, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error.stack || error.message)
  process.exit(1)
})
