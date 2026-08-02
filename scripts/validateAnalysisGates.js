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

requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'tabela de reacoes');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'CONTEUDO_POR_CLUSTER');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'DADO_TRANSACIONAL');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'biblioteca,\ncomponente ou token, key real');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'valor aproximado nao entra no contrato');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'Nunca proponha placeholder');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'ANALISE INCOMPLETA');

requireText('.github/skills/figma-reconstrucao/SKILL.md', reconstruction, 'Asset proprietario obrigatorio ausente');
requireText('docs/contrato-papeis.md', roles, 'evidencia\nde leitura visual, reacoes e IDS');

if (failures.length > 0) {
  console.error('Portoes da analise reprovados:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Portoes da analise aprovados: evidencia, IDS e limites de papel estao exigidos.');
