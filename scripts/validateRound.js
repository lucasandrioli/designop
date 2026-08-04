#!/usr/bin/env node
/*
 * Gate estatico de uma rodada. Ele valida contratos logicos, manifesto e a
 * resolucao temporaria antes da montagem ou promocao. Provas Figma continuam
 * sendo executadas pelos validadores colados na Plugin API.
 *
 * Uso:
 * node scripts/validateRound.js --screens <dir> --journey <arquivo> \
 *   --resolved <arquivo> --components <arquivo> [--manifest <arquivo>]
 *   [--stage pre-montagem]
 */
const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

function args(argv) {
  const result = {}
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index]
    if (!key.startsWith('--')) continue
    result[key.slice(2)] = argv[index + 1]
    index += 1
  }
  return result
}
function readJson(file, failures, label) {
  try { return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')) }
  catch (error) { failures.push(`${label} invalido: ${error.message}`); return null }
}
function distinct(items) { return new Set(items).size === items.length }
function validateScreen(screen, failures, file) {
  if (!screen || screen.schemaVersion !== 1) failures.push(`${file}: schemaVersion precisa ser 1`)
  for (const field of ['id', 'modalidade', 'etapa', 'tela']) if (!screen?.[field]) failures.push(`${file}: ${field} e obrigatorio`)
  if (!screen?.viewport || screen.viewport.width <= 0 || screen.viewport.height <= 0) failures.push(`${file}: viewport invalido`)
  if (!screen?.prototype || !Array.isArray(screen.prototype.fixedChildren)) failures.push(`${file}: prototype.fixedChildren e obrigatorio`)
  const roleIds = (screen?.roles ?? []).map((role) => role?.id)
  if (roleIds.length === 0 || roleIds.some((id) => !id) || !distinct(roleIds)) failures.push(`${file}: roles precisam ter ids unicos`)
  for (const role of screen?.roles ?? []) {
    if (!['IDS', 'COMPONENTE_LOCAL', 'LOCAL_LAYOUT', 'TEXTO', 'ASSET'].includes(role.source)) failures.push(`${file}: papel ${role.id ?? '?'} sem source valido`)
    if (role.source === 'COMPONENTE_LOCAL' && !role.componentId) failures.push(`${file}: papel local ${role.id ?? '?'} sem componentId`)
  }
  for (const interaction of screen?.interacoes ?? []) {
    if (!interaction?.id || !interaction?.origem || !interaction?.gatilho || !interaction?.destino?.tipo) failures.push(`${file}: interacao incompleta`)
    if (!['ON_CLICK', 'AFTER_TIMEOUT'].includes(interaction?.gatilho)) failures.push(`${file}: interacao possui gatilho invalido`)
    if (interaction?.gatilho === 'AFTER_TIMEOUT' && (!Number.isFinite(interaction?.timeout) || interaction.timeout < 0)) failures.push(`${file}: AFTER_TIMEOUT exige timeout nao negativo`)
    if (!['NODE', 'URL', 'BACK', 'CLOSE'].includes(interaction?.destino?.tipo)) failures.push(`${file}: interacao possui destino invalido`)
    if (interaction?.destino?.tipo === 'NODE' && !interaction.destino.tela) failures.push(`${file}: interacao NODE exige tela logica de destino`)
    if (interaction?.destino?.tipo === 'URL' && !/^https:\/\//i.test(interaction.destino.url ?? '')) failures.push(`${file}: interacao URL exige https`)
  }
  for (const local of screen?.componentesLocais ?? []) {
    const uses = (local.reutilizacoes ?? []).map((use) => [use.modalidade, use.etapa, use.tela, use.casoUso].join('::'))
    if (local.aprovado !== true || uses.length < 2 || !distinct(uses)) failures.push(`${file}: componente local ${local.id ?? '?'} sem duas reutilizacoes aprovadas`)
  }
}
function validateLocalComponentPlan(plan, failures, screens) {
  if (!plan || plan.schemaVersion !== 1 || !plan.id) failures.push('plano de componentes locais incompleto')
  if (!Array.isArray(plan?.contextosConhecidos)) failures.push('plano de componentes locais sem contextosConhecidos')
  for (const context of plan?.contextosConhecidos ?? []) {
    if (!context?.id || !context?.rotulo) failures.push('contexto conhecido incompleto no plano de componentes locais')
  }
  if (!Array.isArray(plan?.componentes)) {
    failures.push('plano de componentes locais sem componentes')
    return
  }
  const componentIds = new Set()
  for (const component of plan.componentes) {
    if (!component?.id || component.aprovado !== true) failures.push('componente local sem id ou aprovacao explicita')
    if (componentIds.has(component?.id)) failures.push(`plano de componentes locais repete id: ${component?.id}`)
    componentIds.add(component?.id)
    const uses = (component?.reutilizacoes ?? []).map((use) => [use?.modalidade, use?.etapa, use?.tela, use?.casoUso].join('::'))
    if (uses.length < 2 || new Set(uses).size !== uses.length || uses.some((use) => use.includes('undefined'))) {
      failures.push(`componente local ${component?.id ?? '?'} sem duas reutilizacoes previstas distintas`)
    }
  }
  for (const screen of screens) {
    for (const role of screen.roles ?? []) {
      if (role.source === 'COMPONENTE_LOCAL' && !componentIds.has(role.componentId)) {
        failures.push(`contrato ${screen.id}: componentId local nao consta no plano: ${role.componentId}`)
      }
    }
  }
}
function main() {
  const input = args(process.argv.slice(2))
  const failures = []
  if (!input.screens || !input.journey || !input.resolved || !input.components) {
    console.error('Uso: node scripts/validateRound.js --screens <dir> --journey <arquivo> --resolved <arquivo> --components <arquivo> [--manifest <arquivo>] [--stage <nome>]')
    process.exit(1)
  }
  const screenDirectory = path.resolve(input.screens)
  const screenFiles = fs.existsSync(screenDirectory)
    ? fs.readdirSync(screenDirectory).filter((file) => file.endsWith('.json')).map((file) => path.join(screenDirectory, file))
    : []
  if (screenFiles.length === 0) failures.push('nenhum contrato de tela encontrado')
  const screens = []
  for (const file of screenFiles) {
    const screen = readJson(file, failures, 'contrato de tela')
    if (screen) { validateScreen(screen, failures, file); screens.push(screen) }
  }
  const screenById = new Map(screens.map((screen) => [screen.id, screen]))
  if (screenById.size !== screens.length) failures.push('contratos de tela possuem id duplicado')
  const componentPlan = readJson(input.components, failures, 'plano de componentes locais')
  if (componentPlan) validateLocalComponentPlan(componentPlan, failures, screens)

  const journey = readJson(input.journey, failures, 'contrato de jornada')
  if (journey) {
    if (journey.schemaVersion !== 1 || !journey.id || !journey.modalidade || !journey.collectionConteudo) failures.push('contrato de jornada incompleto')
    const contextIds = (journey.contextos ?? []).map((context) => context?.id)
    if (contextIds.length === 0 || contextIds.some((id) => !id) || !distinct(contextIds)) failures.push('contextos da jornada invalidos')
    const selectionIds = new Set()
    for (const selection of journey.selecoes ?? []) {
      const selectionId = [selection?.contextoId, selection?.tela, selection?.casoUso].join('::')
      if (selectionIds.has(selectionId)) failures.push(`selecao de jornada duplicada: ${selectionId}`)
      selectionIds.add(selectionId)
      if (!contextIds.includes(selection?.contextoId)) failures.push(`selecao usa contexto inexistente: ${selection?.contextoId ?? '?'}`)
      if (!selection?.tela || typeof selection.presente !== 'boolean') failures.push('selecao de jornada incompleta')
      if (selection?.presente === true && !selection.template) failures.push(`tela presente sem template: ${selection?.tela ?? '?'}`)
      if (selection?.presente === false && selection.template) failures.push(`tela ausente nao pode selecionar template: ${selection?.tela ?? '?'}`)
    }
    const compositionIds = new Set()
    for (const composition of journey.composicoesInternas ?? []) {
      if (!composition?.id || !composition?.etapaHospedeira || typeof composition?.presente !== 'boolean') {
        failures.push('composicao interna incompleta')
        continue
      }
      const compositionId = [composition.contextoId, composition.id].join('::')
      if (compositionIds.has(compositionId)) failures.push(`composicao interna duplicada: ${compositionId}`)
      compositionIds.add(compositionId)
      if (!contextIds.includes(composition.contextoId)) failures.push(`composicao interna usa contexto inexistente: ${composition.contextoId ?? '?'}`)
      if (!['global', 'convenio', '[CONFIRMAR]'].includes(composition.origemRegra)) failures.push(`composicao interna sem origem de regra valida: ${composition.id}`)
      if (composition.presente === true && !['DIRETA', 'DIRETA_COM_TUTORIAL_OPCIONAL', '[CONFIRMAR]'].includes(composition.orientacao)) {
        failures.push(`composicao interna presente sem roteiro de orientacao: ${composition.id}`)
      }
      if (composition.presente === true && !['DIRETO', 'ACAO_NO_APP', '[CONFIRMAR]'].includes(composition.retorno)) {
        failures.push(`composicao interna presente sem contrato de retorno: ${composition.id}`)
      }
      if (composition.presente === false && (composition.orientacao || composition.retorno)) failures.push(`composicao interna ausente nao pode declarar orientacao ou retorno: ${composition.id}`)
    }
    for (const document of Object.values(journey.documentos ?? {})) {
      if (document && !fs.existsSync(path.resolve(document))) failures.push(`documento declarado nao encontrado: ${document}`)
    }
  }

  const resolved = readJson(input.resolved, failures, 'resolucao temporaria')
  if (resolved) {
    if (resolved.schemaVersion !== 1 || !resolved.rodada) failures.push('resolucao temporaria incompleta')
    for (const item of resolved.telas ?? []) {
      if (!screenById.has(item?.contratoId)) failures.push(`resolucao aponta para contrato de tela inexistente: ${item?.contratoId ?? '?'}`)
      if (!Array.isArray(item?.referencias) || item.referencias.length === 0) failures.push(`contrato ${item?.contratoId ?? '?'} sem referencias resolvidas`)
      for (const reference of item?.referencias ?? []) {
        if (!reference?.contextoId || !reference?.sectionId || !reference?.frameId) failures.push('referencia resolvida incompleta')
        if (journey && !(journey.contextos ?? []).some((context) => context.id === reference.contextoId)) failures.push(`referencia resolvida usa contexto inexistente: ${reference.contextoId}`)
      }
    }
    for (const section of resolved.jornadas ?? []) {
      if (!journey || section?.contratoId !== journey.id) failures.push(`Section resolvida aponta para jornada inexistente: ${section?.contratoId ?? '?'}`)
      if (!section?.contextoId || !section?.sectionId || !section?.modeId) failures.push('Section de jornada resolvida incompleta')
      if (journey && !(journey.contextos ?? []).some((context) => context.id === section.contextoId)) failures.push(`Section resolvida usa contexto inexistente: ${section.contextoId}`)
    }
  }
  if (input.manifest) {
    const result = childProcess.spawnSync(process.execPath, [path.join(__dirname, 'validateAnalysisManifest.js'), path.resolve(input.manifest)], { encoding: 'utf8' })
    if (result.status !== 0) failures.push(`manifesto reprovado: ${(result.stderr || result.stdout).trim()}`)
  }
  const report = { stage: input.stage ?? 'pre-montagem', screens: screens.map((screen) => screen.id), journey: journey?.id ?? null, localComponentPlan: componentPlan?.id ?? null, resolvedRound: resolved?.rodada ?? null, failures, passed: failures.length === 0 }
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}
main()
