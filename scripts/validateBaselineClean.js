#!/usr/bin/env node
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const tracked = childProcess.execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter((file) => fs.existsSync(path.join(root, file)));
const failures = [];
const allowedTemplates = new Set([
  'docs/etapas/_template.md',
  'docs/modalidades/_template.md',
  'docs/mapas/_template.md',
  'docs/contextos/_template.md',
  'docs/contratos/_template.md',
  'docs/contratos/tela.schema.json',
  'docs/contratos/jornada.schema.json',
  'docs/contratos/resolucao.schema.json',
  'docs/contratos/componentes-locais.schema.json',
  'docs/contratos/contexto-rodada.schema.json',
  'docs/manual-credito-consignado_template.md',
  'docs/receitas/_template.md',
  'docs/receitas/_comuns.md',
]);
for (const file of tracked) {
  if (file.startsWith('laboratorio/')) failures.push('fixture rastreado: ' + file);
  if (file.startsWith('docs/etapas/') || file.startsWith('docs/modalidades/') || file.startsWith('docs/mapas/') || file.startsWith('docs/contextos/') || file.startsWith('docs/contratos/')) {
    if (!allowedTemplates.has(file)) failures.push('documento de negocio preenchido no baseline: ' + file);
  }
  if (file === 'docs/manual-credito-consignado.md') failures.push('manual global preenchido no baseline: ' + file);
}
const forbidden = /\bpcon\b|refinanciamento|portabilidade|anu[eê]ncia|cluster-4|gov[ -]?sp|sougov|sou sp/iu;
for (const relative of tracked) {
  if (relative === 'scripts/validateBaselineClean.js') continue;
  if (!['AGENTS.md', 'COMECE-AQUI.md', '.github/', 'docs/', 'scripts/'].some((prefix) => relative === prefix || relative.startsWith(prefix))) continue;
  const absolute = path.join(root, relative);
  if (fs.statSync(absolute).isFile() && forbidden.test(fs.readFileSync(absolute, 'utf8'))) failures.push('termo de modalidade ou fixture no baseline: ' + relative);
}
if (failures.length) { console.error('Baseline distribuivel reprovado:'); failures.forEach((failure) => console.error('- ' + failure)); process.exit(1); }
console.log('Baseline distribuivel aprovado: motor neutro sem conteudo de modalidade.');
