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
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'contrato de retorno');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'reencontro');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'As skills deste projeto vivem em `.github/skills/`');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'skill://index.json');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, '.designops/runs/<outra-rodada>/');
requireText('.github/agents/analista.agent.md', analyst, 'pelo leitor local do projeto');
requireText('.github/agents/analista.agent.md', analyst, 'Nao liste diretorios inteiros por padrao');
requireText('.github/agents/analista.agent.md', analyst, 'Em coleta tecnica\nisolada ou laboratorio');
requireText('.github/agents/analista.agent.md', analyst, 'somente `consignado-analise` e\n`figma-plugin-api`');
requireText('.github/agents/analista.agent.md', analyst, 'Em analise completa, carregue');
requireText('.github/agents/analista.agent.md', analyst, 'Em contexto guiado que inclui leitura de\nreferencias Figma');
requireText('.github/agents/analista.agent.md', analyst, '`consignado-contexto`,\n`consignado-analise` e `figma-plugin-api`');
requireText('.github/agents/analista.agent.md', analyst, '`FATO OBSERVADO`, `REGRA\nDOCUMENTADA`, `REGRA CONFIRMADA` ou `[CONFIRMAR]`');
requireText('.github/agents/analista.agent.md', analyst, 'inclusive\nem chamada subsequente de leitura');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, '## Escopo de skills');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'coleta tecnica isolada ou laboratorio');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'somente esta\nskill `consignado-analise`, `figma-plugin-api`');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'Em analise completa, leia tambem');
requireText('.github/skills/consignado-contexto/SKILL.md', context, 'So entao crie ou atualize');
requireText('.github/skills/consignado-contexto/SKILL.md', context, 'ACAO_NO_APP');
requireText('.github/skills/consignado-contexto/SKILL.md', context, '## Contexto guiado com referencias Figma');
requireText('.github/skills/consignado-contexto/SKILL.md', context, '`consignado-contexto`, `consignado-analise` e `figma-plugin-api`');
requireText('.github/skills/consignado-contexto/SKILL.md', context, '`FATO OBSERVADO`, `REGRA\nDOCUMENTADA`, `REGRA CONFIRMADA` ou `[CONFIRMAR]`');
requireText('.github/skills/consignado-contexto/SKILL.md', context, 'Nao liste diretorios inteiros');
requireText('docs/mapas/_template.md', mapTemplate, 'Origem da regra');
requireText('docs/mapas/_template.md', mapTemplate, 'Composicoes internas');
requireText('docs/contextos/_template.md', contextTemplate, 'Regras locais por etapa');
if (failures.length) { console.error('Portoes da analise reprovados:'); failures.forEach((failure) => console.error('- ' + failure)); process.exit(1); }
console.log('Portoes da analise aprovados.');
