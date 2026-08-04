#!/usr/bin/env node
/* Migra explicitamente um contrato de tela v1. Nao infere Slots nem tipografia. */
const fs = require('fs')
const path = require('path')
const input = process.argv[2]
const output = process.argv[3]
if (!input || !output) {
  console.error('Uso: node scripts/migrateScreenContractV1ToV2.js <entrada-v1.json> <saida-v2.json>')
  process.exit(1)
}
const screen = JSON.parse(fs.readFileSync(path.resolve(input), 'utf8'))
if (screen.schemaVersion !== 1) {
  console.error('Migracao exige contrato tela.schemaVersion: 1')
  process.exit(1)
}
const migrated = {
  ...screen,
  schemaVersion: 2,
  slots: [],
  typography: [],
  migration: { fromSchemaVersion: 1, status: 'PENDENTE_REVISAO_HUMANA', approvalId: null },
}
fs.writeFileSync(path.resolve(output), JSON.stringify(migrated, null, 2) + '\n')
console.log(JSON.stringify({ migrated: true, output: path.resolve(output), pendingHumanReview: ['slots', 'typography'] }, null, 2))
