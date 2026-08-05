#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const failures = [];

function read(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) { failures.push('Arquivo ausente: ' + file); return ''; }
  return fs.readFileSync(absolute, 'utf8');
}
function requireText(file, text, expected) {
  if (!text.includes(expected)) failures.push(file + ' precisa conter: ' + expected);
}

const agents = read('AGENTS.md');
const model = read('docs/modelo-clusters.md');
const modalityTemplate = read('docs/modalidades/_template.md');
const mapTemplate = read('docs/mapas/_template.md');
const contextTemplate = read('docs/contextos/_template.md');
const globalTemplate = read('docs/manual-credito-consignado_template.md');
const globalManual = read('docs/manual-credito-consignado.md');
const baseGovernance = read('docs/base-documental.md');
const roleContract = read('docs/contrato-papeis.md');
const contextSkill = read('.github/skills/consignado-contexto/SKILL.md');
const baseSkill = read('.github/skills/consignado-base/SKILL.md');
const analysisSkill = read('.github/skills/consignado-analise/SKILL.md');
const assemblySkill = read('.github/skills/consignado-montagem/SKILL.md');
const validationSkill = read('.github/skills/consignado-validacao/SKILL.md');
const localValidator = read('scripts/validateLocalComponents.js');
const journeyValidator = read('scripts/validateJourneySection.js');
const compositionValidator = read('scripts/validateCompositionContract.js');
const roundValidator = read('scripts/validateRound.js');
const screenSchema = read('docs/contratos/tela.schema.json');
const journeySchema = read('docs/contratos/jornada.schema.json');
const resolutionSchema = read('docs/contratos/resolucao.schema.json');
const localComponentsSchema = read('docs/contratos/componentes-locais.schema.json');
const contextDraftSchema = read('docs/contratos/contexto-rodada.schema.json');
const mcpEvidenceSchema = read('docs/contratos/evidencias-mcp.schema.json');
const referenceScopeSchema = read('docs/contratos/referencias-rodada.schema.json');
const referenceScopeCore = read('scripts/validateReferenceScopeCore.js');
const contractTemplate = read('docs/contratos/_template.md');
const contextDraftCore = read('scripts/validateContextDraftCore.js');
const referenceSkill = read('.github/skills/figma-referencias/SKILL.md');
const koraAgent = read('.github/agents/kora.agent.md');
const koraOperation = read('docs/operacao-kora.md');
const koraSchema = read('docs/contratos/rodada-kora.schema.json');
const koraAuditSchema = read('docs/contratos/evento-auditoria-kora.schema.json');
const koraAuditReader = read('scripts/auditKoraRounds.js');
const koraDecisionResume = read('scripts/resumeKoraDecision.js');
const koraIncidentOpen = read('scripts/openKoraOperationIncident.js');
const koraIncidentResume = read('scripts/resumeKoraIncident.js');
const koraIncidentResolution = read('scripts/recordKoraIncidentResolution.js');
const analystPackageSchema = read('docs/contratos/pacote-analista.schema.json');
const analystVariablePlanSchema = read('docs/contratos/plano-variaveis-analise.schema.json');
const analystPackageValidator = read('scripts/validateAnalystPackage.js');
const libraryTopology = read('docs/topologia-biblioteca.md');
const assemblyPackageSchema = read('docs/contratos/pacote-montagem.schema.json');
const assemblyPackageValidator = read('scripts/validateAssemblyPackage.js');
const validatorVerdictSchema = read('docs/contratos/veredito-validador.schema.json');
const promotionPackageSchema = read('docs/contratos/pacote-promocao.schema.json');
const validatorVerdict = read('scripts/validateValidatorVerdict.js');
const promotionPackage = read('scripts/validatePromotionPackage.js');
const koraPackageRegister = read('scripts/registerKoraPackage.js');
const koraCheckpointApproval = read('scripts/approveKoraCheckpoint.js');
const momentScopeSchema = read('docs/contratos/escopo-momento.schema.json');
const momentContractSchema = read('docs/contratos/momento.schema.json');
const momentScopeValidator = read('scripts/validateMomentScopeCore.js');
const stageCompositionSchema = read('docs/contratos/composicao-etapa.schema.json');
const stageCompositionValidator = read('scripts/validateStageCompositionPackage.js');
const stageCompositionProposalValidator = read('scripts/validateStageCompositionProposal.js');
const stageCompositionAssemblyValidator = read('scripts/validateStageCompositionAssembly.js');

[
  'contexto-id',
  'duas telas',
  'collection de conteudo da',
  'aprovacao humana',
  'veredito favoravel',
  'confirmacao externa',
  'ACAO_NO_APP',
  'tutorial opcional'
].forEach((expected) => requireText('AGENTS.md', agents, expected));
requireText('docs/modelo-clusters.md', model, '<etapa>/<tela>/<papel>');
requireText('docs/modelo-clusters.md', model, 'Collections estruturais do IDS');
requireText('docs/modelo-clusters.md', model, 'Hierarquia documental');
requireText('docs/modalidades/_template.md', modalityTemplate, 'Regras estruturais');
requireText('docs/manual-credito-consignado_template.md', globalTemplate, 'Regras globais');
requireText('docs/manual-credito-consignado.md', globalManual, 'Fonte inicial');
requireText('docs/base-documental.md', baseGovernance, 'Mapas concretos permanecem');
requireText('docs/mapas/_template.md', mapTemplate, 'Origem da regra');
requireText('docs/mapas/_template.md', mapTemplate, 'Manual da modalidade');
requireText('docs/mapas/_template.md', mapTemplate, 'Contrato de retorno');
requireText('docs/mapas/_template.md', mapTemplate, 'Roteiro de orientacao');
requireText('docs/contextos/_template.md', contextTemplate, 'Rotulo atual');
requireText('scripts/validateLocalComponents.js', localValidator, 'duas reutilizacoes previstas distintas');
requireText('scripts/validateLocalComponents.js', localValidator, 'knownContexts');
requireText('scripts/validateLocalComponents.js', localValidator, 'area interna _componentes-locais');
requireText('scripts/validateJourneySection.js', journeyValidator, 'knownContentCollectionIds');
requireText('scripts/validateJourneySection.js', journeyValidator, 'instancias esperadas da jornada');
requireText('scripts/validateJourneySection.js', journeyValidator, "'modeId'");
requireText('scripts/validateCompositionContract.js', compositionValidator, 'COMPONENTE_LOCAL');
requireText('scripts/validateCompositionContract.js', compositionValidator, 'componentKey');
requireText('scripts/validateRound.js', roundValidator, 'resolucao temporaria');
requireText('scripts/validateRound.js', roundValidator, 'plano de componentes locais');
requireText('scripts/validateRound.js', roundValidator, 'relatorio MCP literal');
requireText('docs/contratos/tela.schema.json', screenSchema, 'fixedChildren');
requireText('docs/contratos/tela.schema.json', screenSchema, '"const": 2');
requireText('docs/contratos/tela.schema.json', screenSchema, '"slots"');
requireText('docs/contratos/tela.schema.json', screenSchema, '"typography"');
requireText('docs/contratos/jornada.schema.json', journeySchema, 'selecoes');
requireText('docs/contratos/jornada.schema.json', journeySchema, 'composicoesInternas');
requireText('docs/contratos/jornada.schema.json', journeySchema, 'ACAO_NO_APP');
requireText('docs/contratos/jornada.schema.json', journeySchema, 'DIRETA_COM_TUTORIAL_OPCIONAL');
requireText('docs/contratos/resolucao.schema.json', resolutionSchema, 'sectionId');
requireText('docs/contratos/componentes-locais.schema.json', localComponentsSchema, 'reutilizacoes');
requireText('docs/contratos/contexto-rodada.schema.json', contextDraftSchema, 'FATO_OBSERVADO');
requireText('docs/contratos/contexto-rodada.schema.json', contextDraftSchema, 'APROVADO_PARA_REGISTRO');
requireText('docs/contratos/pacote-analista.schema.json', analystPackageSchema, 'PRONTO_PARA_REVISAO');
requireText('docs/contratos/pacote-analista.schema.json', analystPackageSchema, 'CONTRATO_MOMENTO');
requireText('docs/contratos/pacote-analista.schema.json', analystPackageSchema, 'MATRIZ_VARIACOES');
requireText('docs/contratos/plano-variaveis-analise.schema.json', analystVariablePlanSchema, 'diferencasEstruturais');
requireText('docs/contratos/escopo-momento.schema.json', momentScopeSchema, '"telas"');
requireText('docs/contratos/momento.schema.json', momentContractSchema, 'AUSENTE_OBSERVADA');
requireText('scripts/validateMomentScopeCore.js', momentScopeValidator, 'validateMomentScopeData');
requireText('docs/contratos/composicao-etapa.schema.json', stageCompositionSchema, 'semPromocao');
requireText('scripts/validateStageCompositionPackage.js', stageCompositionValidator, 'validatePromotionPackage.js');
requireText('scripts/validateStageCompositionProposal.js', stageCompositionProposalValidator, 'momentos promovidos selecionados');
requireText('scripts/validateStageCompositionAssembly.js', stageCompositionAssemblyValidator, 'semPromocao');
requireText('scripts/validateAnalystPackage.js', analystPackageValidator, 'gate pre-proposta reprovado');
requireText('docs/contratos/evidencias-mcp.schema.json', mcpEvidenceSchema, 'limitViolations');
requireText('docs/contratos/evidencias-mcp.schema.json', mcpEvidenceSchema, 'componentPropertyType');
requireText('docs/contratos/referencias-rodada.schema.json', referenceScopeSchema, 'EVIDENCIA_APENAS');
requireText('docs/contratos/referencias-rodada.schema.json', referenceScopeSchema, 'adocaoAutomatica');
requireText('scripts/validateReferenceScopeCore.js', referenceScopeCore, 'validateReferenceScopeData');
requireText('scripts/validateReferenceScopeCore.js', referenceScopeCore, 'ativosForaDoRecorte');
requireText('docs/contratos/_template.md', contractTemplate, 'IDs logicos');
requireText('docs/contratos/_template.md', contractTemplate, 'componentes-locais.json');
requireText('docs/contratos/_template.md', contractTemplate, 'contexto-rodada.schema.json');
requireText('scripts/validateContextDraftCore.js', contextDraftCore, 'validateContextDraftData');
requireText('scripts/validateContextDraftCore.js', contextDraftCore, 'nao pode transformar fato Figma em regra de negocio');
requireText('.github/skills/figma-referencias/SKILL.md', referenceSkill, 'validateInteractionContract');
requireText('.github/skills/figma-referencias/SKILL.md', referenceSkill, 'nao podem revelar o defeito');
requireText('docs/contrato-papeis.md', roleContract, 'Conversa guiada');
requireText('AGENTS.md', agents, 'Kora e a unica agente visivel');
requireText('.github/agents/kora.agent.md', koraAgent, 'unica porta de entrada humana');
requireText('.github/agents/kora.agent.md', koraAgent, 'Nao abra Figma');
requireText('.github/agents/kora.agent.md', koraAgent, 'authorizeKoraAction.js');
requireText('.github/agents/kora.agent.md', koraAgent, 'Nunca encaminhe a saida bruta');
requireText('docs/operacao-kora.md', koraOperation, 'Kora, audite as rodadas');
requireText('docs/contratos/veredito-validador.schema.json', validatorVerdictSchema, 'APTO_PARA_PROMOCAO');
requireText('docs/contratos/veredito-validador.schema.json', validatorVerdictSchema, 'CRIACAO');
requireText('docs/contratos/veredito-validador.schema.json', validatorVerdictSchema, 'MODES');
requireText('docs/contratos/pacote-promocao.schema.json', promotionPackageSchema, 'ativosPublicados');
requireText('scripts/validateValidatorVerdict.js', validatorVerdict, 'validateValidatorVerdictData');
requireText('scripts/validatePromotionPackage.js', promotionPackage, 'validatePromotionPackageData');
requireText('scripts/registerKoraPackage.js', koraPackageRegister, 'Pacote verificavel aceito');
requireText('scripts/approveKoraCheckpoint.js', koraCheckpointApproval, 'Aprovacao humana registrada');
requireText('docs/operacao-kora.md', koraOperation, 'nunca pede que voce forneca ID');
requireText('docs/contratos/rodada-kora.schema.json', koraSchema, 'AGUARDANDO_APROVACAO_CONTRATO');
requireText('docs/contratos/rodada-kora.schema.json', koraSchema, 'recibos');
requireText('docs/contratos/rodada-kora.schema.json', koraSchema, 'PROMOVENDO');
requireText('docs/contratos/evento-auditoria-kora.schema.json', koraAuditSchema, 'RODADA_INICIADA');
requireText('scripts/auditKoraRounds.js', koraAuditReader, 'AUDIT_KORA');
requireText('scripts/resumeKoraDecision.js', koraDecisionResume, 'Decisao humana registrada');
requireText('.github/agents/kora.agent.md', koraAgent, 'INCIDENTE_DA_OPERACAO');
if (!/Kora nunca\s+edita codigo, hook ou script no VS Code\./.test(koraAgent)) failures.push('.github/agents/kora.agent.md precisa impedir correcao de codigo durante a rodada');
requireText('docs/operacao-kora.md', koraOperation, 'Encaminhar ao Codex');
requireText('docs/contratos/rodada-kora.schema.json', koraSchema, 'incidenteOperacao');
requireText('docs/contratos/evento-auditoria-kora.schema.json', koraAuditSchema, 'INCIDENTE_OPERACAO_ABERTO');
requireText('scripts/openKoraOperationIncident.js', koraIncidentOpen, 'pedido-codex.md');
requireText('scripts/resumeKoraIncident.js', koraIncidentResume, 'correction-commit');
requireText('scripts/recordKoraIncidentResolution.js', koraIncidentResolution, 'RETOMADO');
requireText('.github/skills/consignado-base/SKILL.md', baseSkill, 'sem Figma');
requireText('.github/skills/consignado-base/SKILL.md', baseSkill, 'merge manual');
requireText('docs/topologia-biblioteca.md', libraryTopology, 'status:');
requireText('docs/topologia-biblioteca.md', libraryTopology, '### A.');
requireText('docs/topologia-biblioteca.md', libraryTopology, '### B.');
requireText('docs/topologia-biblioteca.md', libraryTopology, '### C.');
requireText('.github/skills/consignado-montagem/SKILL.md', assemblySkill, 'validateAssemblyPackage.js');
requireText('docs/contratos/pacote-montagem.schema.json', assemblyPackageSchema, 'CONCLUIDA_PARA_VALIDACAO');
requireText('docs/contratos/pacote-montagem.schema.json', assemblyPackageSchema, '_verificacao-');
requireText('scripts/validateAssemblyPackage.js', assemblyPackageValidator, 'pacote-montagem.json');
['consignado-base', 'consignado-contexto', 'consignado-analise', 'consignado-montagem', 'consignado-validacao'].forEach((skill) => {
  const content = {
    'consignado-base': baseSkill,
    'consignado-contexto': contextSkill,
    'consignado-analise': analysisSkill,
    'consignado-montagem': assemblySkill,
    'consignado-validacao': validationSkill,
  }[skill];
  requireText('.github/skills/' + skill + '/SKILL.md', content, 'docs/contrato-papeis.md');
  requireText('.github/skills/' + skill + '/SKILL.md', content, 'Na primeira resposta');
});

if (fs.existsSync(path.join(root, 'docs/clusters/_template.md'))) failures.push('molde legado de contexto ainda existe');
if (fs.existsSync(path.join(root, 'docs/mapa-fluxo-_template.md'))) failures.push('molde legado de mapa ainda existe');

if (failures.length) {
  console.error('Arquitetura documental reprovada:');
  failures.forEach((failure) => console.error('- ' + failure));
  process.exit(1);
}
console.log('Arquitetura documental aprovada.');
