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
function loadFigmaFunction(relative, name, figma) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8') + '\nmodule.exports = ' + name
  const sandbox = { module: { exports: null }, exports: {}, figma, console }
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
    coberturaReacoes: [{
      secao: 'ref-modalidade-tela-ctx-a',
      nodeId: '1:2',
      nodesInspecionados: 3,
      nodesComReacao: 1,
      coletor: 'scripts/collectPrototypeReactions.js',
      status: 'COBERTA',
    }],
    coberturaEstrutura: [{
      secao: 'ref-modalidade-tela-ctx-a',
      nodeId: '1:2',
      nodesInspecionados: 3,
      coletor: 'scripts/collectReferenceStructure.js',
      status: 'COBERTA',
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
function createJourneyFigma({ aliases = [], includeInstance = true } = {}) {
  const contentVariable = { id: 'content-variable', variableCollectionId: 'content-collection' }
  const otherVariable = { id: 'other-variable', variableCollectionId: 'other-content-collection' }
  const idsVariable = { id: 'ids-variable', variableCollectionId: 'ids-structural-collection' }
  const mainComponent = {
    id: 'template-id',
    type: 'COMPONENT',
    boundVariables: { aliases: aliases.map((id) => ({ type: 'VARIABLE_ALIAS', id })) },
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
  const section = {
    id: 'section',
    name: 'ref-modalidade-tela-ctx-a',
    type: 'SECTION',
    children: [source],
    findAll: () => [source],
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
  const report = await collectPrototypeReactions('page', 'section')
  const target = report.reacoes[0].reactions[0].acoes[0].target
  assert.strictEqual(target.kind, 'NODE', 'Coletor precisa registrar destino NODE')
  assert.strictEqual(target.node.scope, 'FORA_DA_SECTION', 'Coletor precisa distinguir destino fora da Section')
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
    expectSuccess(validateManifest(validManifest()), 'Manifesto completo')

    await testJourneyAndLocalComponents()
    await testInteractionCompositionAndReconstruction()
    await testPrototypeCollectionOutsideSection()
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
