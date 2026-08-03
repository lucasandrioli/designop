#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const ledgerPath = path.join(root, 'docs/aprendizados-operacionais.md');
const content = fs.readFileSync(ledgerPath, 'utf8');
const failures = [];
const allowedClasses = new Set(['GENERICO', 'ETAPA', 'HIPOTESE']);
const allowedStates = new Set(['CONSOLIDADO', 'PENDENTE']);
const rows = content.split('\n').filter((line) => /^\| [LH]-/.test(line));

if (rows.length === 0) failures.push('nenhum aprendizado registrado');

for (const row of rows) {
  const cells = row.split('|').slice(1, -1).map((cell) => cell.trim());
  const [id, learning, kind, evidence, state, appliedTo] = cells;
  if (!id || !learning || !allowedClasses.has(kind) || !evidence || !allowedStates.has(state) || !appliedTo) failures.push(`registro invalido: ${row}`);
  if (kind === 'HIPOTESE' && appliedTo !== 'worktree local') failures.push(`${id} e hipotese e nao pode ser aplicada ao motor`);
  if (kind === 'ETAPA' && !/(catalogo|mapa)/i.test(appliedTo)) failures.push(`${id} de etapa precisa apontar para catalogo ou mapa`);
  if (kind === 'GENERICO' && !/(skill|script|agente|AGENTS|runbook|valid|consignado-)/i.test(appliedTo)) failures.push(`${id} generico precisa apontar para guardrail operacional`);
}

if (failures.length > 0) {
  console.error('Ledger de aprendizados reprovado:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Ledger aprovado: ${rows.length} aprendizados classificados.`);
