#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { validateContextDraftData } = require('./validateContextDraftCore');

const draftPath = process.argv[2];
if (!draftPath) {
  console.error('Uso: node scripts/validateContextDraft.js <contexto.json>');
  process.exit(1);
}

let contexto;
try {
  contexto = JSON.parse(fs.readFileSync(path.resolve(draftPath), 'utf8'));
} catch (error) {
  console.error('Rascunho de contexto invalido: ' + error.message);
  process.exit(1);
}

const failures = validateContextDraftData(contexto);
if (failures.length) {
  console.error('Rascunho de contexto reprovado:');
  failures.forEach((failure) => console.error('- ' + failure));
  process.exit(1);
}
console.log('Rascunho de contexto aprovado: ' + contexto.id + ' (' + contexto.status + ').');
