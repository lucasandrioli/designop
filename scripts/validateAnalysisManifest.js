#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { validateAnalysisManifestData } = require('./validateAnalysisManifestCore');
const { validateReferenceScopeData } = require('./validateReferenceScopeCore');

const manifestPath = process.argv[2];
const scopePath = process.argv[3];
if (!manifestPath || !scopePath) {
  console.error('Uso: node scripts/validateAnalysisManifest.js <analise.json> <referencias.json>');
  process.exit(1);
}

let manifest;
let referenceScope;
try {
  manifest = JSON.parse(fs.readFileSync(path.resolve(manifestPath), 'utf8'));
} catch (error) {
  console.error('Manifesto invalido: ' + error.message);
  process.exit(1);
}
try {
  referenceScope = JSON.parse(fs.readFileSync(path.resolve(scopePath), 'utf8'));
} catch (error) {
  console.error('Recorte de referencias invalido: ' + error.message);
  process.exit(1);
}

const failures = [...validateReferenceScopeData(referenceScope), ...validateAnalysisManifestData(manifest, referenceScope)];
if (failures.length) {
  console.error('Manifesto de analise reprovado:');
  failures.forEach((failure) => console.error('- ' + failure));
  process.exit(1);
}
console.log('Manifesto aprovado: ' + manifest.etapa + ' (' + manifest.status + ').');
