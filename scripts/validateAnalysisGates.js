#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const failures = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`Arquivo ausente: ${relativePath}`);
    return '';
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function requireText(file, content, expected) {
  if (!content.includes(expected)) failures.push(`${file} precisa conter: ${expected}`);
}

const analyst = read('.github/agents/analista.agent.md');
const analysis = read('.github/skills/consignado-analise/SKILL.md');
const reconstruction = read('.github/skills/figma-reconstrucao/SKILL.md');
const context = read('.github/skills/consignado-contexto/SKILL.md');
const roles = read('docs/contrato-papeis.md');
const stageTemplate = read('docs/etapas/_template.md');
const flowTemplate = read('docs/mapa-fluxo-_template.md');
const manifestSchema = read('docs/analise-rodada.schema.json');

[
  'screenshots das referencias',
  'nao pede promocao',
  'Uma solicitacao `/consignado-analise` ja pede a proposta completa',
  'Toda\nseta observada precisa mostrar node de origem',
  'get_libraries` apenas lista bibliotecas conectadas',
  'get_libraries` e ultimo recurso',
  'libraries_added_to_file',
  'libraries_available_to_add',
  'includeLibraryKeys',
  '.designops/runs/<id>/analise.json',
].forEach((text) => requireText('.github/agents/analista.agent.md', analyst, text));

[
  'tabela de reacoes',
  'scripts/collectPrototypeReactions.js',
  'origem, gatilho, destino e fonte',
  'Nao presuma uma reacao pela ordem dos frames',
  'todos os descendentes sem depender',
  'fato tecnico, nao uma regra de\nnegocio',
  'CONTEUDO_POR_CLUSTER',
  'DADO_TRANSACIONAL',
  'biblioteca,\ncomponente ou token, key real',
  'Nao abrevie keys na proposta',
  'valor aproximado nao entra no contrato',
  'bibliotecas confirmadas',
  'libraries_added_to_file',
  'includeLibraryKeys',
  'Nunca proponha placeholder',
  '`SEM_REACAO_OBSERVADA`',
  '`PROPOSTA PARA APROVACAO`',
  '`ANALISE INCOMPLETA`',
  'Manifesto temporario da rodada',
  'validateAnalysisManifest.js',
].forEach((text) => requireText('.github/skills/consignado-analise/SKILL.md', analysis, text));

[
  'Cada frame interno atravessado por uma reacao observada',
  'nunca de a essa evidencia uma identidade de tela da etapa',
  'Antes de pedir aprovacao, confira todas as diferencas factuais',
  'Nao mostre mecanismo tecnico, caminho de arquivo,',
].forEach((text) => requireText('.github/skills/consignado-contexto/SKILL.md', context, text));

[
  'O Analista prova prototipos na referencia na rodada atual',
  'Fronteiras que o mapa ja definiu nao viram pergunta nova',
  'evidencia\nde leitura visual, reacoes e IDS',
].forEach((text) => requireText('docs/contrato-papeis.md', roles, text));

requireText('docs/contrato-papeis.md', roles, 'evidencias externas sao\nregistradas como handoffs');
requireText('docs/etapas/_template.md', stageTemplate, '## Telas internas observadas');
requireText('docs/etapas/_template.md', stageTemplate, '## Handoffs e evidencias externas');
requireText('docs/mapa-fluxo-_template.md', flowTemplate, 'Cada tela interna atravessada por uma reacao observada');

requireText('.github/skills/figma-reconstrucao/SKILL.md', reconstruction, 'Asset proprietario obrigatorio ausente');
requireText('docs/analise-rodada.schema.json', manifestSchema, 'PROPOSTA_PARA_APROVACAO');

if (failures.length > 0) {
  console.error('Portoes da analise reprovados:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Portoes da analise aprovados: evidencia, contratos e limites de papel estao exigidos.');
