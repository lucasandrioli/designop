#!/usr/bin/env node
/* Regressao do recorte por momento e da separacao obrigatoria por modalidade. */
const assert = require('assert')
const crypto = require('crypto')
const fs = require('fs')
const os = require('os')
const path = require('path')
const childProcess = require('child_process')

const root = path.resolve(__dirname, '..')
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'kora-momento-'))
for (const name of ['koraRoundState.js', 'validateKoraStateCore.js', 'validateMomentScopeCore.js', 'validateVariablePlanCore.js', 'validateMomentProposalCore.js', 'validatePromotionPackageCore.js', 'validatePromotionPackage.js', 'validateValidatorVerdictCore.js', 'startKoraRound.js', 'validateKoraRound.js', 'validateKoraPackages.js', 'authorizeKoraAction.js', 'approveKoraCheckpoint.js', 'registerKoraPackage.js', 'validateStageCompositionProposal.js', 'validateStageCompositionAssembly.js', 'validateStageCompositionPackage.js']) {
  fs.mkdirSync(path.join(fixture, 'scripts'), { recursive: true })
  fs.copyFileSync(path.join(root, 'scripts', name), path.join(fixture, 'scripts', name))
}
function run(name, args) { return childProcess.spawnSync(process.execPath, [path.join(fixture, 'scripts', name), ...args], { cwd: fixture, encoding: 'utf8' }) }
function hash(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
function write(directory, name, data) { const file = path.join(directory, name); fs.writeFileSync(file, JSON.stringify(data, null, 2)); return file }
function sourcePromotion(roundId, modalidade) {
  const directory = path.join(fixture, '.designops/runs', roundId)
  fs.mkdirSync(directory, { recursive: true })
  const artifact = (name) => ({ caminho: `.designops/runs/${roundId}/${name}`, sha256: hash(path.join(directory, name)) })
  const stamp = '2026-08-05T12:00:00.000Z'
  for (const name of ['pacote-montagem.json', 'contrato.json', 'resolvido.json', 'evidencias-mcp.json', 'pre-promocao.json', 'criacao.json', 'conteudo.json', 'modes.json', 'layout.json', 'estrutura.json', 'interacoes.json', 'visual.json', 'validacao-promocao.json', 'releitura-publicada.json']) write(directory, name, name === 'pacote-montagem.json' ? { alvos: [{ modalidade, tela: 'principal' }] } : { passed: true })
  const check = (tipo, name) => ({ tipo, resultado: 'FAVORAVEL', artefato: artifact(name), executadaEm: stamp })
  write(directory, 'veredito-validador.json', {
    schemaVersion: 2, rodada: roundId, emitidoEm: stamp, resultado: 'APTO_PARA_PROMOCAO',
    artefatosVinculados: [['PACOTE_MONTAGEM', 'pacote-montagem.json'], ['CONTRATO', 'contrato.json'], ['RESOLUCAO', 'resolvido.json'], ['EVIDENCIAS_MCP', 'evidencias-mcp.json'], ['PRE_PROMOCAO', 'pre-promocao.json']].map(([papel, name]) => ({ papel, ...artifact(name) })),
    resultados: [{ id: `${modalidade}-principal`, modalidade, tela: 'principal', template: 'informacoes-importantes', contextoId: 'ctx-a', resultado: 'FAVORAVEL', revisaoVisual: 'FAVORAVEL' }],
    verificacoes: [check('CRIACAO', 'criacao.json'), check('CONTEUDO', 'conteudo.json'), check('MODES', 'modes.json'), check('LAYOUT', 'layout.json'), check('PRE_PROMOCAO', 'pre-promocao.json')],
    releiturasIndependentes: [{ tipo: 'ESTRUTURA', resultado: 'FAVORAVEL', independenteDaMontagem: true, artefato: artifact('estrutura.json'), executadaEm: stamp }, { tipo: 'INTERACOES', resultado: 'FAVORAVEL', independenteDaMontagem: true, artefato: artifact('interacoes.json'), executadaEm: stamp }],
    revisaoVisual: { resultado: 'FAVORAVEL', artefato: artifact('visual.json'), executadaEm: stamp }, prePromocao: { resultado: 'FAVORAVEL', artefato: artifact('pre-promocao.json'), executadaEm: stamp },
  })
  write(directory, 'aprovacao-promocao.json', { aprovacoes: { promocao: { tipo: 'PROMOCAO', decisao: 'APROVADA', confirmadoPor: 'DESIGNER', ocorreuEm: stamp } }, checkpoints: { promocao: { status: 'CONCLUIDA' } } })
  write(directory, 'pacote-promocao.json', {
    schemaVersion: 2, rodada: roundId, emitidoEm: stamp, aprovacaoKora: artifact('aprovacao-promocao.json'), veredito: artifact('veredito-validador.json'), validacaoPromocao: { origem: 'VALIDATE_PROMOTION', resultado: 'FAVORAVEL', artefato: artifact('validacao-promocao.json'), executadaEm: stamp }, contextosProibidosNoNome: ['ctx-a'],
    ativosPublicados: [{ modalidade, tela: 'principal', template: 'informacoes-importantes', nome: `${modalidade}/formalizacao/tpl-informacoes-importantes`, tipo: 'COMPONENT', resultado: 'FAVORAVEL' }], releiturasPosPromocao: [{ template: 'informacoes-importantes', resultado: 'FAVORAVEL', artefato: artifact('releitura-publicada.json'), executadaEm: stamp }],
  })
  const promotion = { arquivo: `.designops/runs/${roundId}/pacote-promocao.json`, sha256: hash(path.join(directory, 'pacote-promocao.json')), estado: 'CONCLUIDA' }
  write(directory, 'kora.json', { schemaVersion: 2, rodada: roundId, tipoRodada: 'MOMENTO', status: 'CONCLUIDA', entrada: { modalidades: [modalidade] }, pacotes: { promocao: promotion }, pacotesPorModalidade: { [modalidade]: { promocao: { ...promotion } } } })
}

const round = 'momento-comparativo'
const start = run('startKoraRound.js', ['--round', round, '--figma-url', 'https://www.figma.com/design/nao-publicar', '--etapa', 'formalizacao', '--momento', 'informacoes-importantes', '--modalidades', 'pcon,refin', '--telas', '[{"id":"principal","nome":"Informações importantes","papel":"PRINCIPAL","abertaPor":null},{"id":"detalhes-contrato","nome":"Detalhes do contrato","papel":"DETALHE","abertaPor":"principal"}]', '--sections', 'ref-pcon-info-ctx-a,ref-refin-info-ctx-b', '--root', fixture])
assert.equal(start.status, 0, start.stderr)
const stateFile = path.join(fixture, '.designops/runs', round, 'kora.json')
const scopeFile = path.join(fixture, '.designops/runs', round, 'escopo-momento.json')
const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'))
assert.equal(state.schemaVersion, 2)
assert.equal(state.tipoRodada, 'MOMENTO')
assert.deepEqual(Object.keys(state.pacotesPorModalidade).sort(), ['pcon', 'refin'])
assert.equal(hash(scopeFile), state.escopo.sha256)
assert.equal(run('validateKoraRound.js', ['--round', round, '--root', fixture]).status, 0)

const compositionRound = 'formalizacao-conectada'
const withoutPromotion = run('startKoraRound.js', ['--tipo', 'COMPOSICAO_ETAPA', '--round', compositionRound, '--figma-url', 'https://www.figma.com/design/nao-publicar', '--etapa', 'formalizacao', '--modalidade', 'pcon', '--momentos', round, '--root', fixture])
assert.notEqual(withoutPromotion.status, 0, 'composicao nao inicia a partir de momento sem promocao comprovada')
sourcePromotion('momento-promovido', 'pcon')
const composition = run('startKoraRound.js', ['--tipo', 'COMPOSICAO_ETAPA', '--round', compositionRound, '--figma-url', 'https://www.figma.com/design/nao-publicar', '--etapa', 'formalizacao', '--modalidade', 'pcon', '--momentos', 'momento-promovido', '--root', fixture])
assert.equal(composition.status, 0, composition.stderr)
assert.equal(run('validateKoraRound.js', ['--round', compositionRound, '--root', fixture]).status, 0, 'composicao de etapa inicia como rodada verificavel')
assert.equal(run('authorizeKoraAction.js', ['--round', compositionRound, '--role', 'ANALISTA', '--action', 'ANALISAR', '--root', fixture]).status, 0, 'composicao libera analise somente depois de fixar momentos promovidos')
const compositionDirectory = path.join(fixture, '.designops/runs', compositionRound)
const compositionArtifact = (name) => ({ caminho: `.designops/runs/${compositionRound}/${name}`, sha256: hash(path.join(compositionDirectory, name)) })
const compositionScope = JSON.parse(fs.readFileSync(path.join(compositionDirectory, 'escopo-composicao-etapa.json'), 'utf8'))
write(compositionDirectory, 'contrato-composicao.json', { rodada: compositionRound, tipo: 'CONEXOES_VERIFICACAO' })
write(compositionDirectory, 'proposta-composicao-etapa.json', { schemaVersion: 1, rodada: compositionRound, etapa: 'formalizacao', modalidade: 'pcon', estado: 'PRONTO_PARA_REVISAO', semPromocao: true, momentosPromovidos: compositionScope.momentos, contratoComposicao: compositionArtifact('contrato-composicao.json') })
assert.equal(run('registerKoraPackage.js', ['--round', compositionRound, '--package', 'analista', '--root', fixture]).status, 0, 'proposta de composicao entra no contrato somente com fontes promovidas')
assert.equal(run('approveKoraCheckpoint.js', ['--round', compositionRound, '--checkpoint', 'contrato', '--root', fixture]).status, 0, 'composicao ainda preserva aprovacao humana antes da montagem')
write(compositionDirectory, 'prototipo-composicao.json', { rodada: compositionRound, area: '_verificacao-formalizacao' })
write(compositionDirectory, 'evidencia-montagem-composicao.json', { rodada: compositionRound, releitura: true })
write(compositionDirectory, 'pacote-composicao-montagem.json', { schemaVersion: 1, rodada: compositionRound, estado: 'CONCLUIDA_PARA_VALIDACAO', semPromocao: true, prototipo: compositionArtifact('prototipo-composicao.json'), evidenciaMontagem: compositionArtifact('evidencia-montagem-composicao.json') })
assert.equal(run('registerKoraPackage.js', ['--round', compositionRound, '--package', 'montagem', '--root', fixture]).status, 0, 'montagem da composicao entrega somente o prototipo de verificacao')
write(compositionDirectory, 'veredito-composicao.json', { rodada: compositionRound, resultado: 'FAVORAVEL' })
write(compositionDirectory, 'pacote-composicao-etapa.json', { schemaVersion: 1, rodada: compositionRound, modalidade: 'pcon', etapa: 'formalizacao', estado: 'PRONTA_PARA_VERIFICACAO', semPromocao: true, momentosPromovidos: compositionScope.momentos, contratoComposicao: compositionArtifact('contrato-composicao.json'), prototipo: compositionArtifact('prototipo-composicao.json'), evidenciaMontagem: compositionArtifact('evidencia-montagem-composicao.json'), veredito: compositionArtifact('veredito-composicao.json') })
assert.equal(run('registerKoraPackage.js', ['--round', compositionRound, '--package', 'veredito', '--root', fixture]).status, 0, 'veredito encerra composicao sem abrir promocao')
const compositionState = JSON.parse(fs.readFileSync(path.join(compositionDirectory, 'kora.json'), 'utf8'))
assert.equal(compositionState.status, 'CONCLUIDA')
assert.equal(compositionState.checkpoints.promocao.status, 'PENDENTE')
assert.equal(run('validateKoraRound.js', ['--round', compositionRound, '--root', fixture]).status, 0, 'composicao concluida preserva somente o prototipo verificavel')

const scope = JSON.parse(fs.readFileSync(scopeFile, 'utf8'))
scope.telas[1].abertaPor = 'ausente'
fs.writeFileSync(scopeFile, JSON.stringify(scope))
assert.notEqual(run('validateKoraRound.js', ['--round', round, '--root', fixture]).status, 0, 'escopo alterado bloqueia a rodada')

const { validateVariablePlanData } = require('./validateVariablePlanCore')
const invalidPlan = { schemaVersion: 2, id: 'variaveis', rodada: round, status: 'PROPOSTO', etapa: 'formalizacao', momento: 'informacoes-importantes', modalidades: [{ id: 'pcon', collectionConteudo: 'Conteudo - PCon', variaveis: [{ tela: 'principal', papel: 'bloco', caminho: 'formalizacao/principal/bloco', tipo: 'CONTEUDO', mecanismo: 'VARIAVEL' }] }], diferencasEstruturais: [{ modalidade: 'pcon', tela: 'principal', descricao: 'layout diferente', tratamento: 'VARIAVEL' }], conexoes: [] }
assert(validateVariablePlanData(invalidPlan, { round }).some((failure) => failure.includes('estrutural')), 'estrutura nao pode virar variavel')

const { validateMomentContractData } = require('./validateMomentProposalCore')
const cleanScope = JSON.parse(JSON.stringify(scope)); cleanScope.telas[1].abertaPor = 'principal'
const invalidContract = { schemaVersion: 1, id: 'momento', rodada: round, etapa: 'formalizacao', momento: 'informacoes-importantes', modalidades: ['pcon', 'refin'], telas: cleanScope.telas, cobertura: [{ modalidade: 'pcon', tela: 'principal', contextoId: 'ctx-a', status: 'NAO_VERIFICAVEL', evidencia: 'ref-a' }], conexoes: [] }
assert(validateMomentContractData(invalidContract, cleanScope, { round }).some((failure) => failure.includes('nao verificavel')), 'cobertura nao verificavel bloqueia proposta')
console.log('Rodada por momento da Kora aprovada.')
