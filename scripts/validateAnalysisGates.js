#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const failures = [];
function read(file) { const absolute = path.join(root, file); if (!fs.existsSync(absolute)) { failures.push('Arquivo ausente: ' + file); return ''; } return fs.readFileSync(absolute, 'utf8'); }
function requireText(file, value, expected) { if (!value.includes(expected)) failures.push(file + ' precisa conter: ' + expected); }
const analyst = read('.github/agents/analista.agent.md');
const analysis = read('.github/skills/consignado-analise/SKILL.md');
const context = read('.github/skills/consignado-contexto/SKILL.md');
const mapTemplate = read('docs/mapas/_template.md');
const contextTemplate = read('docs/contextos/_template.md');
['referencias cruas', 'aprovacao humana explicita', 'Rascunhos e previews'].forEach((expected) => requireText('.github/agents/analista.agent.md', analyst, expected));
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'reutilizacoes previstas');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'collectPrototypeReactions.js');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'collectReferenceStructure.js');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'em cada Section');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'resolvido.json');
requireText('.github/skills/consignado-contexto/SKILL.md', context, 'So entao crie ou atualize');
requireText('docs/mapas/_template.md', mapTemplate, 'Origem da regra');
requireText('docs/contextos/_template.md', contextTemplate, 'Regras locais por etapa');
if (failures.length) { console.error('Portoes da analise reprovados:'); failures.forEach((failure) => console.error('- ' + failure)); process.exit(1); }
console.log('Portoes da analise aprovados.');
