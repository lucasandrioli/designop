#!/usr/bin/env node

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const tracked = childProcess.execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
  .split('\n').filter(Boolean)
  .filter((file) => fs.existsSync(path.join(root, file)));
const failures = [];
const allowedBusinessTemplates = new Set([
  'docs/etapas/_template.md',
  'docs/clusters/_template.md',
  'docs/mapa-fluxo-_template.md',
  'docs/receitas/_template.md',
  'docs/receitas/_comuns.md',
]);

for (const file of tracked) {
  if (file.startsWith('laboratorio/')) failures.push(`fixture rastreado: ${file}`);
  if (file.startsWith('docs/etapas/') || file.startsWith('docs/clusters/') || file.startsWith('docs/mapa-fluxo-')) {
    if (!allowedBusinessTemplates.has(file)) failures.push(`documento de negocio preenchido no baseline: ${file}`);
  }
}

const forbidden = /anu[eê]ncia|simula[cç][aã]o|cluster-4|gov[ -]?sp|sougov|sou sp/iu;
const scanRoots = ['AGENTS.md', 'COMECE-AQUI.md', '.github', 'docs', 'scripts'];
for (const entry of scanRoots) {
  const absolute = path.join(root, entry);
  const stack = [absolute];
  while (stack.length > 0) {
    const current = stack.pop();
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const child of fs.readdirSync(current)) stack.push(path.join(current, child));
      continue;
    }
    const relative = path.relative(root, current);
    if (relative === 'scripts/validateBaselineClean.js' || !tracked.includes(relative)) continue;
    if (forbidden.test(fs.readFileSync(current, 'utf8'))) failures.push(`termo de fixture no baseline: ${relative}`);
  }
}

if (failures.length > 0) {
  console.error('Baseline distribuivel reprovado:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Baseline distribuivel aprovado: motor sem fixtures de negocio.');
