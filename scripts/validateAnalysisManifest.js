#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error('Uso: node scripts/validateAnalysisManifest.js <caminho-do-analise.json>');
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(path.resolve(manifestPath), 'utf8'));
} catch (error) {
  console.error(`Manifesto invalido: ${error.message}`);
  process.exit(1);
}

const failures = [];
const required = ['schemaVersion', 'id', 'etapa', 'status', 'fontes', 'inventario', 'coberturaReacoes', 'reacoes', 'diferencas', 'lacunas'];
for (const field of required) if (!(field in manifest)) failures.push(`campo ausente: ${field}`);

if (manifest.schemaVersion !== 1) failures.push('schemaVersion precisa ser 1');
if (!['PRECISA_CONTEXTO', 'ANALISE_INCOMPLETA', 'PROPOSTA_PARA_APROVACAO'].includes(manifest.status)) failures.push('status invalido');
if (!manifest.fontes?.figma?.pagina) failures.push('fonte Figma ausente');
if (!Array.isArray(manifest.fontes?.figma?.secoesReferencia) || manifest.fontes.figma.secoesReferencia.length === 0) {
  failures.push('secoes de referencia do Figma ausentes');
}
if (!Array.isArray(manifest.fontes?.documentos?.manuais)) failures.push('lista de manuais ausente');

for (const [index, item] of (manifest.inventario ?? []).entries()) {
  if (!item.tela || !item.cluster || !item.frame?.nome || !item.frame?.nodeId) failures.push(`inventario[${index}] sem tela, cluster ou frame de evidencia`);
  if (!item.evidencia?.screenshot || !item.evidencia?.designContext) failures.push(`inventario[${index}] sem screenshot ou designContext`);
}

const secoesReferencia = manifest.fontes?.figma?.secoesReferencia ?? [];
const coberturas = manifest.coberturaReacoes ?? [];
for (const [index, coverage] of coberturas.entries()) {
  if (!coverage.secao || !coverage.nodeId || !Number.isInteger(coverage.nodesInspecionados) || coverage.nodesInspecionados < 1) {
    failures.push(`coberturaReacoes[${index}] sem secao ou contagem valida`);
  }
  if (!Number.isInteger(coverage.nodesComReacao) || coverage.nodesComReacao < 0 || coverage.nodesComReacao > coverage.nodesInspecionados) {
    failures.push(`coberturaReacoes[${index}] com contagem de reacoes invalida`);
  }
  if (coverage.coletor !== 'scripts/collectPrototypeReactions.js') {
    failures.push(`coberturaReacoes[${index}] nao usou o coletor oficial`);
  }
  if (!['COBERTA', 'FALHOU'].includes(coverage.status)) failures.push(`coberturaReacoes[${index}] com status invalido`);
}

for (const section of secoesReferencia) {
  const coverage = coberturas.find((item) => item.nodeId === section.nodeId);
  if (!coverage) failures.push(`secao de referencia sem varredura: ${section.nome}`);
  else if (coverage.status !== 'COBERTA') failures.push(`varredura de reacoes falhou: ${section.nome}`);
}

for (const [index, reaction] of (manifest.reacoes ?? []).entries()) {
  if (!reaction.origem || !reaction.acao || !reaction.tipo || !reaction.fonte || !reaction.status) failures.push(`reacoes[${index}] incompleta`);
  if (reaction.status === 'OBSERVADA' && (!reaction.destino || reaction.fonte !== 'FIGMA')) failures.push(`reacoes[${index}] observada sem destino ou fonte Figma`);
  if (reaction.status === 'SEM_REACAO_OBSERVADA' && reaction.fonte !== 'NAO_EXPOSTA') failures.push(`reacoes[${index}] sem reacao precisa usar fonte NAO_EXPOSTA`);
}

for (const [index, difference] of (manifest.diferencas ?? []).entries()) {
  if (!difference.tela || !difference.tipo || !Array.isArray(difference.clusters)) failures.push(`diferencas[${index}] incompleta`);
  if (!difference.regraDocumentada && difference.confirmar !== true) failures.push(`diferencas[${index}] sem regra documental ou [CONFIRMAR]`);
}

for (const [index, gap] of (manifest.lacunas ?? []).entries()) {
  if (!gap.id || typeof gap.bloqueante !== 'boolean' || !gap.motivo) failures.push(`lacunas[${index}] incompleta`);
}

if (manifest.status === 'PROPOSTA_PARA_APROVACAO') {
  if ((manifest.inventario ?? []).length === 0) failures.push('proposta sem inventario');
  if (coberturas.length !== secoesReferencia.length) failures.push('proposta sem cobertura de todas as secoes de referencia');
  if ((manifest.lacunas ?? []).some((gap) => gap.bloqueante)) failures.push('proposta possui lacuna bloqueante');
}

if (failures.length > 0) {
  console.error('Manifesto de analise reprovado:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Manifesto aprovado: ${manifest.etapa} (${manifest.status}).`);
