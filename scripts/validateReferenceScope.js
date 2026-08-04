#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { validateReferenceScopeData } = require('./validateReferenceScopeCore');

const scopePath = process.argv[2];
if (!scopePath) {
  console.error('Uso: node scripts/validateReferenceScope.js <referencias.json>');
  process.exit(1);
}
let scope;
try {
  scope = JSON.parse(fs.readFileSync(path.resolve(scopePath), 'utf8'));
} catch (error) {
  console.error('Recorte de referencias invalido: ' + error.message);
  process.exit(1);
}
const failures = validateReferenceScopeData(scope);
if (failures.length) {
  console.error('Recorte de referencias reprovado:');
  failures.forEach((failure) => console.error('- ' + failure));
  process.exit(1);
}
console.log('Recorte de referencias aprovado: ' + scope.id + '.');
