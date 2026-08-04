#!/usr/bin/env node
/*
 * Gate estatico de uma rodada. Antes da montagem, confere apenas contratos
 * v2 e evidencias documentais. Antes da promocao, tambem vincula os
 * relatorios literais dos validadores MCP aos IDs e a rodada corretos.
 * Nunca substitui validateCompositionContract ou validateTypographyContract.
 *
 * Uso:
 * node scripts/validateRound.js --screens <dir> --journey <arquivo> \
 *   --resolved <arquivo> --components <arquivo> [--manifest <arquivo>] \
 *   [--stage pre-montagem|pre-promocao] [--evidence <arquivo>]
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
function idSetEqual(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((id) => b.includes(id))
}
function validIsoAfter(readAt, writtenAt) {
  const read = Date.parse(readAt ?? '')
  const written = Date.parse(writtenAt ?? '')
  return Number.isFinite(read) && Number.isFinite(written) && read > written
}

function validateScreen(screen, failures, file) {
  if (!screen || screen.schemaVersion !== 2) failures.push(`${file}: contrato legado ou invalido; schemaVersion precisa ser 2`)
  if (screen?.migration?.status === 'PENDENTE_REVISAO_HUMANA') failures.push(`${file}: contrato migrado aguarda revisao humana de Slots e tipografia`)
  if (screen?.migration?.status === 'REVISAO_HUMANA_CONCLUIDA' && !screen.migration.approvalId) failures.push(`${file}: migracao concluida exige approvalId humano`)
  for (const field of ['id', 'modalidade', 'etapa', 'tela']) if (!screen?.[field]) failures.push(`${file}: ${field} e obrigatorio`)
  if (!screen?.viewport || screen.viewport.width <= 0 || screen.viewport.height <= 0) failures.push(`${file}: viewport invalido`)
  if (!screen?.prototype || !Array.isArray(screen.prototype.fixedChildren)) failures.push(`${file}: prototype.fixedChildren e obrigatorio`)
  const roleIds = (screen?.roles ?? []).map((role) => role?.id)
  if (roleIds.length === 0 || roleIds.some((id) => !id) || !distinct(roleIds)) failures.push(`${file}: roles precisam ter ids unicos`)
  const roles = new Map((screen?.roles ?? []).map((role) => [role.id, role]))
  for (const role of screen?.roles ?? []) {
    if (!['IDS', 'COMPONENTE_LOCAL', 'LOCAL_LAYOUT', 'TEXTO', 'ASSET'].includes(role.source)) failures.push(`${file}: papel ${role.id ?? '?'} sem source valido`)
    if (role.source === 'COMPONENTE_LOCAL' && !role.componentId) failures.push(`${file}: papel local ${role.id ?? '?'} sem componentId`)
  }

  const slots = screen?.slots
  if (!Array.isArray(slots)) failures.push(`${file}: slots e obrigatorio em contrato v2`)
  const slotIds = (slots ?? []).map((slot) => slot?.id)
  if (slotIds.some((id) => !id) || !distinct(slotIds)) failures.push(`${file}: slots precisam ter ids unicos`)
  for (const slot of slots ?? []) {
    const host = roles.get(slot?.hostRole)
    if (!host || host.source !== 'IDS') failures.push(`${file}: Slot ${slot?.id ?? '?'} exige hostRole IDS existente`)
    if (!slot?.slotName || !slot?.componentPropertyName) failures.push(`${file}: Slot ${slot?.id ?? '?'} sem nome do Slot ou property publica`)
    const contentRoles = slot?.contentRoleIds ?? []
    if (!Array.isArray(contentRoles) || contentRoles.length === 0 || !distinct(contentRoles)) failures.push(`${file}: Slot ${slot?.id ?? '?'} sem contentRoleIds unicos`)
    for (const roleId of contentRoles) {
      if (roleId === slot?.hostRole || !roles.has(roleId)) failures.push(`${file}: Slot ${slot?.id ?? '?'} aponta para papel de conteudo invalido: ${roleId ?? '?'}`)
    }
  }

  const typography = screen?.typography
  if (!Array.isArray(typography)) failures.push(`${file}: typography e obrigatorio em contrato v2`)
  const typographyIds = (typography ?? []).map((item) => item?.id)
  if (typographyIds.some((id) => !id) || !distinct(typographyIds)) failures.push(`${file}: typography precisa ter ids unicos`)
  const typographyByTarget = new Map()
  for (const item of typography ?? []) {
    if (!roles.has(item?.targetRole)) failures.push(`${file}: tipografia ${item?.id ?? '?'} aponta para targetRole inexistente`)
    if (!['UNICO', 'MISTO'].includes(item?.kind)) failures.push(`${file}: tipografia ${item?.id ?? '?'} sem kind valido`)
    if (!['IDS_STYLE', 'IDS_COMPONENT', 'LOCAL_APPROVED'].includes(item?.source)) failures.push(`${file}: tipografia ${item?.id ?? '?'} sem source valido`)
    if (item?.source === 'IDS_COMPONENT' && roles.get(item?.targetRole)?.source !== 'IDS') failures.push(`${file}: IDS_COMPONENT exige targetRole IDS`)
    if (item?.source !== 'IDS_COMPONENT' && !item?.styleRole) failures.push(`${file}: tipografia ${item?.id ?? '?'} exige styleRole`)
    if (item?.source === 'LOCAL_APPROVED' && !item?.approvalId) failures.push(`${file}: LOCAL_APPROVED exige approvalId`)
    if (item?.kind === 'MISTO' && (!Array.isArray(item?.segments) || item.segments.length === 0 || item.segments.some((segment) => !segment?.styleRole))) {
      failures.push(`${file}: tipografia MISTO ${item?.id ?? '?'} exige segmentos ordenados`)
    }
    if (typographyByTarget.has(item?.targetRole)) failures.push(`${file}: targetRole possui mais de uma regra tipografica: ${item?.targetRole ?? '?'}`)
    typographyByTarget.set(item?.targetRole, item)
  }
  for (const role of screen?.roles ?? []) {
    if (role.source === 'TEXTO' && !typographyByTarget.has(role.id)) failures.push(`${file}: papel TEXTO ${role.id} sem contrato tipografico`)
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
  for (const context of plan?.contextosConhecidos ?? []) if (!context?.id || !context?.rotulo) failures.push('contexto conhecido incompleto no plano de componentes locais')
  if (!Array.isArray(plan?.componentes)) { failures.push('plano de componentes locais sem componentes'); return }
  const componentIds = new Set()
  for (const component of plan.componentes) {
    if (!component?.id || component.aprovado !== true) failures.push('componente local sem id ou aprovacao explicita')
    if (componentIds.has(component?.id)) failures.push(`plano de componentes locais repete id: ${component?.id}`)
    componentIds.add(component?.id)
    const uses = (component?.reutilizacoes ?? []).map((use) => [use?.modalidade, use?.etapa, use?.tela, use?.casoUso].join('::'))
    if (uses.length < 2 || new Set(uses).size !== uses.length || uses.some((use) => use.includes('undefined'))) failures.push(`componente local ${component?.id ?? '?'} sem duas reutilizacoes previstas distintas`)
  }
  for (const screen of screens) for (const role of screen.roles ?? []) if (role.source === 'COMPONENTE_LOCAL' && !componentIds.has(role.componentId)) failures.push(`contrato ${screen.id}: componentId local nao consta no plano: ${role.componentId}`)
}

function validateMcpEvidence(evidence, failures, screens, roundId) {
  if (!evidence || evidence.schemaVersion !== 1 || evidence.roundId !== roundId) {
    failures.push('evidencia MCP invalida ou pertence a outra rodada')
    return
  }
  if (!Array.isArray(evidence.slots) || !Array.isArray(evidence.typography)) {
    failures.push('evidencia MCP sem listas de slots e typography')
    return
  }
  if (!Array.isArray(evidence.referencesConsulted) || evidence.referencesConsulted.length === 0 || evidence.referencesConsulted.some((entry) => !entry?.reference || !entry?.reason || !Array.isArray(entry?.symbols))) {
    failures.push('evidencia MCP sem referencias oficiais, motivo e simbolos consultados')
  }
  for (const screen of screens) {
    for (const slot of screen.slots ?? []) {
      const matches = evidence.slots.filter((entry) => entry?.contractId === screen.id && entry?.slotId === slot.id)
      if (matches.length !== 1) { failures.push(`Slot ${screen.id}/${slot.id} sem evidencia MCP unica`); continue }
      const entry = matches[0]
      if (entry.roundId !== roundId || entry.passed !== true || entry.status !== 'APROVADO') failures.push(`Slot ${screen.id}/${slot.id} sem passed APROVADO na rodada atual`)
      if (![entry.hostInstanceId, entry.slotNodeId, entry.componentKey, entry.libraryKey, entry.componentPropertyKey, entry.componentPropertyName].every(Boolean) || !Array.isArray(entry.contentNodeIds) || entry.contentNodeIds.length === 0) failures.push(`Slot ${screen.id}/${slot.id} sem IDs ou identidade completa`)
      if (entry.componentPropertyType !== 'SLOT' || entry.componentPropertyName !== slot.componentPropertyName) failures.push(`Slot ${screen.id}/${slot.id} diverge da property publica contratada`)
      if (!Array.isArray(entry.limitViolations) || entry.limitViolations.length > 0) failures.push(`Slot ${screen.id}/${slot.id} possui limitViolations`)
      if (!validIsoAfter(entry.readAt, entry.writtenAt)) failures.push(`Slot ${screen.id}/${slot.id} sem releitura posterior a escrita`)
      const literal = entry.report
      const result = literal?.slotResults?.find((item) => item?.id === slot.id)
      if (literal?.roundId !== roundId || literal?.passed !== true || literal?.verificationStatus !== 'APROVADO' || !result || result.hostInstanceId !== entry.hostInstanceId || result.slotNodeId !== entry.slotNodeId || !idSetEqual(result.contentNodeIds, entry.contentNodeIds) || result.componentKey !== entry.componentKey || result.libraryKey !== entry.libraryKey || result.componentPropertyKey !== entry.componentPropertyKey || result.componentPropertyName !== entry.componentPropertyName || result.componentPropertyType !== 'SLOT' || !Array.isArray(result.limitViolations) || result.limitViolations.length > 0 || result.passed !== true) failures.push(`Slot ${screen.id}/${slot.id} sem relatorio MCP literal vinculado aos mesmos IDs`)
    }
    for (const typography of screen.typography ?? []) {
      const matches = evidence.typography.filter((entry) => entry?.contractId === screen.id && entry?.typographyId === typography.id)
      if (matches.length !== 1) { failures.push(`Tipografia ${screen.id}/${typography.id} sem evidencia MCP unica`); continue }
      const entry = matches[0]
      if (entry.roundId !== roundId || entry.passed !== true || entry.status !== 'APROVADO') failures.push(`Tipografia ${screen.id}/${typography.id} sem passed APROVADO na rodada atual`)
      if (!Array.isArray(entry.targetNodeIds) || entry.targetNodeIds.length === 0 || !validIsoAfter(entry.readAt, entry.writtenAt)) failures.push(`Tipografia ${screen.id}/${typography.id} sem IDs ou releitura posterior`)
      const literal = entry.report
      const result = literal?.targetResults?.find((item) => item?.id === typography.id)
      if (literal?.roundId !== roundId || literal?.passed !== true || literal?.verificationStatus !== 'APROVADO' || !result || !idSetEqual(result.targetNodeIds, entry.targetNodeIds) || result.passed !== true) failures.push(`Tipografia ${screen.id}/${typography.id} sem relatorio MCP literal vinculado aos mesmos IDs`)
    }
  }
}

function main() {
  const input = args(process.argv.slice(2))
  const failures = []
  if (!input.screens || !input.journey || !input.resolved || !input.components) {
    console.error('Uso: node scripts/validateRound.js --screens <dir> --journey <arquivo> --resolved <arquivo> --components <arquivo> [--manifest <arquivo>] [--stage pre-montagem|pre-promocao] [--evidence <arquivo>]')
    process.exit(1)
  }
  const stage = input.stage ?? 'pre-montagem'
  const requiresMcpEvidence = ['pre-promocao', 'promocao'].includes(stage)
  const screenDirectory = path.resolve(input.screens)
  const screenFiles = fs.existsSync(screenDirectory) ? fs.readdirSync(screenDirectory).filter((file) => file.endsWith('.json')).map((file) => path.join(screenDirectory, file)) : []
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
  if (requiresMcpEvidence) {
    if (!input.evidence) failures.push('pre-promocao exige --evidence com relatorios MCP literais')
    else validateMcpEvidence(readJson(input.evidence, failures, 'evidencia MCP'), failures, screens, resolved?.rodada)
  }
  if (input.manifest) {
    const result = childProcess.spawnSync(process.execPath, [path.join(__dirname, 'validateAnalysisManifest.js'), path.resolve(input.manifest)], { encoding: 'utf8' })
    if (result.status !== 0) failures.push(`manifesto reprovado: ${(result.stderr || result.stdout).trim()}`)
  }
  const report = { stage, screens: screens.map((screen) => screen.id), journey: journey?.id ?? null, localComponentPlan: componentPlan?.id ?? null, resolvedRound: resolved?.rodada ?? null, mcpEvidenceChecked: requiresMcpEvidence, failures, passed: failures.length === 0 }
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}
main()
