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

function forbidText(file, content, forbidden) {
  if (content.includes(forbidden)) {
    failures.push(`${file} nao pode conter: ${forbidden}`);
  }
}

function frontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : '';
}

const operatorPath = '.github/agents/operador.agent.md';
const readerPath = '.github/agents/leitor-de-etapa.agent.md';
const operator = read(operatorPath);
const reader = read(readerPath);
const operatorFrontmatter = frontmatter(operator);
const readerFrontmatter = frontmatter(reader);

requireText(operatorPath, operator, 'name: operador');
requireText(operatorPath, operator, 'user-invocable: true');
requireText(operatorPath, operator, 'disable-model-invocation: true');
requireText(operatorPath, operator, '  - agent');
requireText(operatorPath, operator, '  - leitor-de-etapa');
requireText(operatorPath, operator, 'essa leitura e\nresponsabilidade exclusiva dos Leitores');
requireText(operatorPath, operator, 'antes de qualquer leitura de documentos da etapa feita por voce');
requireText(operatorPath, operator, 'nao o registre no estado');
requireText(operatorPath, operator, 'Leitores que concluiram');
forbidText(operatorPath, operatorFrontmatter, 'figma/*');

requireText(readerPath, reader, 'name: leitor-de-etapa');
requireText(readerPath, reader, 'user-invocable: false');
forbidText(readerPath, readerFrontmatter, 'figma/*');
forbidText(readerPath, readerFrontmatter, '  - edit');
forbidText(readerPath, readerFrontmatter, '  - agent');

const settingsPath = '.vscode/settings.json';
try {
  const settings = JSON.parse(read(settingsPath));
  if (settings['chat.customAgentInSubagent.enabled'] !== true) {
    failures.push(`${settingsPath} precisa habilitar subagentes customizados`);
  }
} catch (error) {
  failures.push(`${settingsPath} nao contem JSON valido: ${error.message}`);
}

const gitignore = read('.gitignore');
requireText('.gitignore', gitignore, '.designops/runs/*');
requireText('.gitignore', gitignore, '!.designops/runs/.gitkeep');

[
  'docs/operacao-squad.md',
  'docs/estado-rodada.schema.md',
  'docs/fila-de-trabalho.md',
  'docs/piloto-squad.md',
  '.designops/runs/.gitkeep'
].forEach(read);

const squadOperation = read('docs/operacao-squad.md');
requireText('docs/operacao-squad.md', squadOperation, 'sem ler os');
requireText('docs/operacao-squad.md', squadOperation, 'documentos das etapas por conta propria');
requireText('docs/operacao-squad.md', squadOperation, 'nao e aberto nem');
requireText('docs/operacao-squad.md', squadOperation, 'gravado no estado');

const squadPilot = read('docs/piloto-squad.md');
requireText('docs/piloto-squad.md', squadPilot, 'Leitores que concluiram');

if (failures.length > 0) {
  console.error('Fase 0 reprovada:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Fase 0 aprovada: Operador e Leitor estao configurados para leitura segura.');
