#!/usr/bin/env node
/*
 * Testes de regressao do motor neutro. Cada fixture nasce em diretorio
 * temporario e e removida ao fim: nenhum cenario de negocio entra na master.
 */
const assert = require('assert')
const childProcess = require('child_process')
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
function validManifest() {
  return {
    schemaVersion: 2,
    id: 'rodada-neutra',
    etapa: 'etapa-exemplo',
    status: 'PROPOSTA_PARA_APROVACAO',
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
  }
}
function validateManifest(manifest) {
  const fixture = temporaryDirectory('designops-manifest-')
  const file = path.join(fixture, 'analise.json')
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2))
  return runNode(path.join(root, 'scripts/validateAnalysisManifest.js'), [file])
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
  const reconciliationSource = fs.readFileSync(path.join(root, 'scripts/reconcileAnalysisManifestFigma.js'), 'utf8')
  assert(structureSource.includes('totalPartes'), 'Coletor estrutural precisa expor a quantidade total de partes')
  assert(structureSource.includes('itensPorParte'), 'Coletor estrutural precisa expor a distribuicao da leitura')
  assert(reactionsSource.includes('totalParts'), 'Coletor de reacoes precisa paginar a leitura completa')
  assert(!manifestCoreSource.includes("require('fs')"), 'Validador MCP nao pode depender de fs')
  assert(!manifestCoreSource.includes('process.exit'), 'Validador MCP nao pode depender de process')
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
  assert(analysisSkill.includes('reconcileAnalysisManifestFigma.js'), 'Analista precisa reconciliar o manifesto com Figma atual')
  assert(analysisSkill.includes('return await reconcileAnalysisManifestFigma(manifest);'), 'Analista precisa receber a chamada literal da reconciliacao MCP')
}
function testManifestValidationWithoutTerminal() {
  const validateAnalysisManifestData = loadFigmaFunction(
    'scripts/validateAnalysisManifestCore.js',
    'validateAnalysisManifestData',
    {},
  )
  assert.strictEqual(
    validateAnalysisManifestData(validManifest()).length,
    0,
    'Validador portatil precisa aprovar manifesto completo sem terminal',
  )
  const invalid = validManifest()
  invalid.fontes.figma.descoberta = null
  assert(
    validateAnalysisManifestData(invalid).some((failure) => failure.includes('descoberta atual')),
    'Validador portatil precisa reprovar manifesto sem descoberta atual',
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
  const approved = await reconcileAnalysisManifestFigma(validManifest())
  assert.strictEqual(approved.passed, true, 'Reconciliacao MCP precisa aprovar manifesto que coincide com Figma atual')

  const stale = validManifest()
  stale.coberturaEstrutura[0].nodesInspecionados = 8
  stale.coberturaEstrutura[0].totalItens = 8
  stale.coberturaEstrutura[0].itensPorParte = [8]
  const rejected = await reconcileAnalysisManifestFigma(stale)
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
  const screen = {
    schemaVersion: 1,
    id: 'screen-a',
    modalidade: 'modalidade-a',
    etapa: 'etapa-a',
    tela: 'tela-a',
    viewport: { surface: 'mobile', width: 360, height: 800 },
    prototype: { overflowDirection: 'NONE', fixedChildren: [] },
    roles: [{ id: 'raiz', source: 'LOCAL_LAYOUT' }],
    interacoes: [],
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
  fs.writeFileSync(componentsFile, JSON.stringify({ schemaVersion: 1, id: 'componentes-a', contextosConhecidos: [{ id: 'ctx-a', rotulo: 'Contexto A' }], componentes: [] }))
  const roundArgs = ['--screens', screens, '--journey', journeyFile, '--resolved', resolvedFile, '--components', componentsFile]
  expectSuccess(runNode(path.join(root, 'scripts/validateRound.js'), roundArgs), 'Round valido')
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

    await testJourneyAndLocalComponents()
    await testInteractionCompositionAndReconstruction()
    await testPrototypeCollectionOutsideSection()
    await testReferenceStructurePagination()
    await testCanvasOrganization()
    testFigmaApiContracts()
    testManifestValidationWithoutTerminal()
    await testManifestReconciliationWithoutTerminal()
    await testRemoteComponentPreflight()
    testValidateRound()

    fixture = temporaryDirectory('designops-baseline-')
    copy('scripts/validateBaselineClean.js', fixture)
    fs.mkdirSync(path.join(fixture, 'docs'), { recursive: true })
    fs.writeFileSync(path.join(fixture, 'docs/manual-credito-consignado.md'), '# Manual preenchido\n')
    childProcess.execFileSync('git', ['init', '-q'], { cwd: fixture })
    expectFailure(runNode(path.join(fixture, 'scripts/validateBaselineClean.js')), 'Manual global preenchido no baseline')

    console.log('Testes de guardrails aprovados.')
  } finally {
    for (const directory of temporaryDirectories) fs.rmSync(directory, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error.stack || error.message)
  process.exit(1)
})
