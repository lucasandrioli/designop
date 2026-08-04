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
const roleContract = read('docs/contrato-papeis.md');
const contextSkill = read('.github/skills/consignado-contexto/SKILL.md');
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
const contractTemplate = read('docs/contratos/_template.md');
const contextDraftCore = read('scripts/validateContextDraftCore.js');
const referenceSkill = read('.github/skills/figma-referencias/SKILL.md');

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
requireText('docs/contratos/evidencias-mcp.schema.json', mcpEvidenceSchema, 'limitViolations');
requireText('docs/contratos/evidencias-mcp.schema.json', mcpEvidenceSchema, 'componentPropertyType');
requireText('docs/contratos/_template.md', contractTemplate, 'IDs logicos');
requireText('docs/contratos/_template.md', contractTemplate, 'componentes-locais.json');
requireText('docs/contratos/_template.md', contractTemplate, 'contexto-rodada.schema.json');
requireText('scripts/validateContextDraftCore.js', contextDraftCore, 'validateContextDraftData');
requireText('scripts/validateContextDraftCore.js', contextDraftCore, 'nao pode transformar fato Figma em regra de negocio');
requireText('.github/skills/figma-referencias/SKILL.md', referenceSkill, 'validateInteractionContract');
requireText('.github/skills/figma-referencias/SKILL.md', referenceSkill, 'nao podem revelar o defeito');
requireText('docs/contrato-papeis.md', roleContract, 'Conversa guiada');
['consignado-contexto', 'consignado-analise', 'consignado-montagem', 'consignado-validacao'].forEach((skill) => {
  const content = {
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
  console.error('Arquitetura neutra reprovada:');
  failures.forEach((failure) => console.error('- ' + failure));
  process.exit(1);
}
console.log('Arquitetura neutra aprovada.');
