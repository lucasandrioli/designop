#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { validateAnalysisManifestData } = require('./validateAnalysisManifestCore');

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error('Uso: node scripts/validateAnalysisManifest.js <analise.json>');
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(path.resolve(manifestPath), 'utf8'));
} catch (error) {
  console.error('Manifesto invalido: ' + error.message);
  process.exit(1);
}

const failures = validateAnalysisManifestData(manifest);
if (failures.length) {
  console.error('Manifesto de analise reprovado:');
  failures.forEach((failure) => console.error('- ' + failure));
  process.exit(1);
}
console.log('Manifesto aprovado: ' + manifest.etapa + ' (' + manifest.status + ').');
