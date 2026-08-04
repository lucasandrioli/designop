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
const allowedReferenceDocs = new Set([
  'docs/etapas/_template.md',
  'docs/etapas/consentimento.md',
  'docs/etapas/simular-e-revisar.md',
  'docs/etapas/formalizacao.md',
  'docs/modalidades/_template.md',
  'docs/modalidades/pcon.md',
  'docs/modalidades/refin.md',
  'docs/modalidades/portabilidade.md',
  'docs/mapas/_template.md',
  'docs/contextos/_template.md',
  'docs/contextos/indice.md',
  'docs/contratos/_template.md',
  'docs/contratos/tela.schema.json',
  'docs/contratos/jornada.schema.json',
  'docs/contratos/resolucao.schema.json',
  'docs/contratos/componentes-locais.schema.json',
  'docs/contratos/contexto-rodada.schema.json',
  'docs/contratos/evidencias-mcp.schema.json',
  'docs/contratos/referencias-rodada.schema.json',
  'docs/manual-credito-consignado_template.md',
  'docs/receitas/_template.md',
  'docs/receitas/_comuns.md',
]);
const requiredBaseDocs = [
  'docs/base-documental.md',
  'docs/manual-credito-consignado.md',
  'docs/modalidades/pcon.md',
  'docs/modalidades/refin.md',
  'docs/modalidades/portabilidade.md',
  'docs/etapas/consentimento.md',
  'docs/etapas/simular-e-revisar.md',
  'docs/etapas/formalizacao.md',
  'docs/contextos/indice.md',
];
const isContextManual = (file) => /^docs\/contextos\/ctx-[a-z0-9-]+\.md$/.test(file);
const isBaseManual = (file) => file === 'docs/manual-credito-consignado.md' ||
  /^docs\/(modalidades|etapas)\/(pcon|refin|portabilidade|consentimento|simular-e-revisar|formalizacao)\.md$/.test(file) ||
  file === 'docs/contextos/indice.md' || isContextManual(file);

for (const file of tracked) {
  if (file.startsWith('laboratorio/')) failures.push('fixture rastreado: ' + file);
  if (file.startsWith('.designops/runs/') && file !== '.designops/runs/.gitkeep') failures.push('estado temporario de rodada no baseline: ' + file);
  if (file.startsWith('docs/mapas/') && file !== 'docs/mapas/_template.md') {
    failures.push('mapa concreto no baseline: ' + file);
  }
  if (file.startsWith('docs/etapas/') || file.startsWith('docs/modalidades/') || file.startsWith('docs/contextos/') || file.startsWith('docs/contratos/')) {
    if (!allowedReferenceDocs.has(file) && !isContextManual(file)) {
      failures.push('documento fora da base aprovada: ' + file);
    }
  }
}
for (const file of requiredBaseDocs) {
  if (!tracked.includes(file)) failures.push('documento obrigatorio da base ausente: ' + file);
}
for (const relative of tracked.filter(isBaseManual)) {
  const content = fs.readFileSync(path.join(root, relative), 'utf8');
  ['## Status da base', 'Aprovado por:', 'Atualizado em:', 'Fonte inicial:'].forEach((required) => {
    if (!content.includes(required)) failures.push(relative + ' precisa declarar: ' + required);
  });
  if (/\b(?:fileKey|nodeId)\b|\b\d+:\d+\b|\bref-[a-z0-9-]+/i.test(content)) {
    failures.push('evidencia Figma ou ID temporario no manual-base: ' + relative);
  }
}
if (failures.length) { console.error('Baseline documental reprovado:'); failures.forEach((failure) => console.error('- ' + failure)); process.exit(1); }
console.log('Baseline documental aprovado: conhecimento versionado sem mapas ou estado de rodada.');
