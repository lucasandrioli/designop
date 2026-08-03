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
  if (!content.includes(expected)) {
    failures.push(`${file} precisa conter: ${expected}`);
  }
}

const analyst = read('.github/agents/analista.agent.md');
const analysis = read('.github/skills/consignado-analise/SKILL.md');
const reconstruction = read('.github/skills/figma-reconstrucao/SKILL.md');
const roles = read('docs/contrato-papeis.md');

requireText('.github/agents/analista.agent.md', analyst, 'screenshots das referencias');
requireText('.github/agents/analista.agent.md', analyst, 'nao pede promocao');
requireText('.github/agents/analista.agent.md', analyst, 'Nao tente\ncarrega-las por `figma-get_figma_skill`');
requireText('.github/agents/analista.agent.md', analyst, 'nao leia seus\nbindings, modes, previews ou layout');
requireText('.github/agents/analista.agent.md', analyst, 'nao capture screenshot nem contexto dessa verificacao');

requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'tabela de reacoes');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'CONTEUDO_POR_CLUSTER');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'DADO_TRANSACIONAL');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'biblioteca,\ncomponente ou token, key real');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'valor aproximado nao entra no contrato');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'Nunca proponha placeholder');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'ANALISE INCOMPLETA');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'contexts representativos sao sempre frames `ref-*`');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'uma quinta\ninstancia oculta na referencia e artefato tecnico');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'Nao leia bindings, modes, layout,');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'previews ou screenshots deles');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'ANALISE PARCIAL');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'findAll` nao inclui o proprio frame');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'Nao abrevie keys na proposta');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'Escopo\naprovavel agora');

requireText('.github/skills/figma-reconstrucao/SKILL.md', reconstruction, 'Asset proprietario obrigatorio ausente');
requireText('docs/contrato-papeis.md', roles, 'evidencia\nde leitura visual, reacoes e IDS');
requireText('docs/contrato-papeis.md', roles, '`_verificacao-*` e territorio do\nValidador');

if (failures.length > 0) {
  console.error('Portoes da analise reprovados:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Portoes da analise aprovados: evidencia, IDS e limites de papel estao exigidos.');
