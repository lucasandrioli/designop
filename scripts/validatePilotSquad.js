#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const failures = [];
function read(file) { const absolute = path.join(root, file); if (!fs.existsSync(absolute)) { failures.push('Arquivo ausente: ' + file); return ''; } return fs.readFileSync(absolute, 'utf8'); }
function requireText(file, value, expected) { if (!value.includes(expected)) failures.push(file + ' precisa conter: ' + expected); }
function requirePattern(file, value, pattern, label) { if (!pattern.test(value)) failures.push(file + ' precisa conter: ' + label); }
function frontmatter(file) {
  const value = read(file);
  const match = value.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    failures.push(file + ' sem frontmatter YAML');
    return '';
  }
  return match[1];
}
function escapeRegex(value) { return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'); }
function requireYamlListEntry(file, yaml, field, value) {
  const fieldMatch = yaml.match(new RegExp('^' + field + ':\\n((?:^[ \\t]+- .+\\n?)+)', 'm'));
  if (!fieldMatch || !new RegExp('^[ \\t]+- ' + escapeRegex(value) + '$', 'm').test(fieldMatch[1])) {
    failures.push(file + ' precisa declarar ' + field + ': ' + value);
  }
}
function rejectYamlListEntry(file, yaml, field, value) {
  const fieldMatch = yaml.match(new RegExp('^' + field + ':\\n((?:^[ \\t]+- .+\\n?)+)', 'm'));
  if (fieldMatch && new RegExp('^[ \\t]+- ' + escapeRegex(value) + '$', 'm').test(fieldMatch[1])) {
    failures.push(file + ' nao pode declarar ' + field + ': ' + value);
  }
}
const gitignore = read('.gitignore');
const operation = read('docs/operacao-squad.md');
const operator = read('.github/agents/operador.agent.md');
const reader = read('.github/agents/leitor-de-etapa.agent.md');
const operatorYaml = frontmatter('.github/agents/operador.agent.md');
const readerYaml = frontmatter('.github/agents/leitor-de-etapa.agent.md');
const vscodeSettings = read('.vscode/settings.json');
requireText('.gitignore', gitignore, '.designops/runs/*');
requireText('.gitignore', gitignore, '!.designops/runs/.gitkeep');
['leituras paralelas', 'um Leitor por etapa', 'documentos oficiais'].forEach((expected) => requireText('docs/operacao-squad.md', operation, expected));
['Coordene uma rodada documental', 'Aguarde todos os leitores', 'exatamente um Leitor por etapa', 'Nao consolide resultado parcial', 'somente disponibilidade documental'].forEach((expected) => requireText('.github/agents/operador.agent.md', operator, expected));
requirePattern('.github/agents/operador.agent.md', operator, /Nao abra\s+Figma/, 'Nao abra Figma');
requirePattern('.github/agents/operador.agent.md', operator, /Nao chame\s+Analista, Montador ou Validador/, 'Nao chame Analista, Montador ou Validador');
['Nao leia Figma', 'nao altere arquivos', 'manual da modalidade', 'Retorne somente\no cartao abaixo'].forEach((expected) => requireText('.github/agents/leitor-de-etapa.agent.md', reader, expected));
requirePattern('.github/agents/leitor-de-etapa.agent.md', reader, /nao\s+chame outros agentes/, 'nao chame outros agentes');
requireYamlListEntry('.github/agents/operador.agent.md', operatorYaml, 'tools', 'agent');
requireYamlListEntry('.github/agents/operador.agent.md', operatorYaml, 'agents', 'leitor-de-etapa');
rejectYamlListEntry('.github/agents/operador.agent.md', operatorYaml, 'tools', 'figma/*');
for (const blockedTool of ['edit', 'figma/*', 'agent']) rejectYamlListEntry('.github/agents/leitor-de-etapa.agent.md', readerYaml, 'tools', blockedTool);
if (!/name:\s*leitor-de-etapa/.test(readerYaml)) failures.push('Leitor precisa manter nome leitor-de-etapa');
if (!/user-invocable:\s*false/.test(readerYaml)) failures.push('Leitor nao pode ser invocavel diretamente');
if (!/disable-model-invocation:\s*true/.test(readerYaml)) failures.push('Leitor precisa bloquear invocacao automatica pelo modelo');
if (!/"chat\.customAgentInSubagent\.enabled"\s*:\s*true/.test(vscodeSettings)) {
  failures.push('.vscode/settings.json precisa habilitar chat.customAgentInSubagent.enabled');
}
if (failures.length) { console.error('Fase 0 reprovada:'); failures.forEach((failure) => console.error('- ' + failure)); process.exit(1); }
console.log('Fase 0 aprovada: Operador coordena Leitores sem tocar em Figma ou documentos oficiais.');
