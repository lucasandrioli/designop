#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const manifestPath = process.argv[2];
if (!manifestPath) { console.error('Uso: node scripts/validateAnalysisManifest.js <analise.json>'); process.exit(1); }
let manifest;
try { manifest = JSON.parse(fs.readFileSync(path.resolve(manifestPath), 'utf8')); }
catch (error) { console.error('Manifesto invalido: ' + error.message); process.exit(1); }
const failures = [];
const required = ['schemaVersion', 'id', 'etapa', 'status', 'fontes', 'inventario', 'execucoesColeta', 'coberturaReacoes', 'coberturaEstrutura', 'reacoes', 'diferencas', 'lacunas'];
for (const field of required) if (!(field in manifest)) failures.push('campo ausente: ' + field);
if (manifest.schemaVersion !== 2) failures.push('schemaVersion precisa ser 2');
if (!['PRECISA_CONTEXTO', 'ANALISE_INCOMPLETA', 'PROPOSTA_PARA_APROVACAO'].includes(manifest.status)) failures.push('status invalido');
if (!manifest.fontes?.figma?.pagina) failures.push('fonte Figma ausente');
if (!Array.isArray(manifest.fontes?.figma?.secoesReferencia) || manifest.fontes.figma.secoesReferencia.length === 0) failures.push('secoes de referencia ausentes');
if (!Array.isArray(manifest.fontes?.documentos?.manuaisContexto)) failures.push('manuais de contexto ausentes');
const referenceSections = manifest.fontes?.figma?.secoesReferencia ?? [];
const referenceByNodeId = new Map();
const validatePagination = (coverage, label, index) => {
  if (!Number.isInteger(coverage?.totalPartes) || coverage.totalPartes < 1) {
    failures.push(`${label}[${index}] sem totalPartes valido`);
    return;
  }
  if (!Array.isArray(coverage?.partesLidas)) {
    failures.push(`${label}[${index}] sem partesLidas`);
    return;
  }
  if (!Number.isInteger(coverage?.pageSize) || coverage.pageSize < 1) {
    failures.push(`${label}[${index}] sem pageSize valido`);
  }
  if (!Number.isInteger(coverage?.totalItens) || coverage.totalItens < 0) {
    failures.push(`${label}[${index}] sem totalItens valido`);
  }
  if (!Array.isArray(coverage?.itensPorParte)) {
    failures.push(`${label}[${index}] sem itensPorParte`);
  } else if (Number.isInteger(coverage?.pageSize) && Number.isInteger(coverage?.totalItens)) {
    const expectedParts = Math.max(1, Math.ceil(coverage.totalItens / coverage.pageSize));
    const expectedItems = Array.from({ length: expectedParts }, (_, part) =>
      Math.max(0, Math.min(coverage.pageSize, coverage.totalItens - part * coverage.pageSize)),
    );
    if (coverage.totalPartes !== expectedParts || coverage.itensPorParte.length !== expectedItems.length || coverage.itensPorParte.some((value, part) => value !== expectedItems[part])) {
      failures.push(`${label}[${index}] possui distribuicao de partes invalida`);
    }
  }
  const parts = [...new Set(coverage.partesLidas)];
  const expected = Array.from({ length: coverage.totalPartes }, (_, part) => part + 1);
  if (parts.length !== coverage.partesLidas.length || parts.length !== expected.length || parts.some((part, position) => part !== expected[position])) {
    failures.push(`${label}[${index}] nao comprova leitura de todas as partes`);
  }
};
for (const [index, section] of referenceSections.entries()) {
  if (!section?.nome || !section?.nodeId || !section?.contextoId) failures.push('secoesReferencia[' + index + '] incompleta');
  if (referenceByNodeId.has(section?.nodeId)) failures.push('secoesReferencia possui nodeId duplicado: ' + section.nodeId);
  referenceByNodeId.set(section?.nodeId, section);
}
for (const [index, item] of (manifest.inventario ?? []).entries()) {
  if (!item.tela || !item.modalidade || !item.contextoId || !item.frame?.nome || !item.frame?.nodeId) failures.push('inventario[' + index + '] sem tela, modalidade, contextoId ou frame');
}
const coverageByNodeId = new Map();
for (const [index, coverage] of (manifest.coberturaReacoes ?? []).entries()) {
  if (!coverage?.secao || !coverage?.nodeId || !Number.isInteger(coverage?.nodesInspecionados) || coverage.nodesInspecionados < 1 || !Number.isInteger(coverage?.nodesComReacao) || coverage.nodesComReacao < 0) {
    failures.push('coberturaReacoes[' + index + '] incompleta');
    continue;
  }
  if (coverage.coletor !== 'scripts/collectPrototypeReactions.js') failures.push('coberturaReacoes[' + index + '] precisa usar scripts/collectPrototypeReactions.js');
  if (!['COBERTA', 'FALHOU'].includes(coverage.status)) failures.push('coberturaReacoes[' + index + '] possui status invalido');
  validatePagination(coverage, 'coberturaReacoes', index);
  const referencedSection = referenceByNodeId.get(coverage.nodeId);
  if (!referencedSection) failures.push('coberturaReacoes[' + index + '] aponta para Section que nao e referencia');
  else if (referencedSection.nome !== coverage.secao) failures.push('coberturaReacoes[' + index + '] nao corresponde ao nome da Section de referencia');
  if (coverage.nodesComReacao > coverage.nodesInspecionados) failures.push('coberturaReacoes[' + index + '] possui contagem de reacoes invalida');
  if (coverageByNodeId.has(coverage.nodeId)) failures.push('coberturaReacoes possui nodeId duplicado: ' + coverage.nodeId);
  coverageByNodeId.set(coverage.nodeId, coverage);
}
const structureByNodeId = new Map();
for (const [index, coverage] of (manifest.coberturaEstrutura ?? []).entries()) {
  if (!coverage?.secao || !coverage?.nodeId || !Number.isInteger(coverage?.nodesInspecionados) || coverage.nodesInspecionados < 1) {
    failures.push('coberturaEstrutura[' + index + '] incompleta');
    continue;
  }
  if (coverage.coletor !== 'scripts/collectReferenceStructure.js') failures.push('coberturaEstrutura[' + index + '] precisa usar scripts/collectReferenceStructure.js');
  if (!['COBERTA', 'FALHOU'].includes(coverage.status)) failures.push('coberturaEstrutura[' + index + '] possui status invalido');
  validatePagination(coverage, 'coberturaEstrutura', index);
  const referencedSection = referenceByNodeId.get(coverage.nodeId);
  if (!referencedSection) failures.push('coberturaEstrutura[' + index + '] aponta para Section que nao e referencia');
  else if (referencedSection.nome !== coverage.secao) failures.push('coberturaEstrutura[' + index + '] nao corresponde ao nome da Section de referencia');
  if (structureByNodeId.has(coverage.nodeId)) failures.push('coberturaEstrutura possui nodeId duplicado: ' + coverage.nodeId);
  structureByNodeId.set(coverage.nodeId, coverage);
}
for (const section of referenceSections) {
  const coverage = coverageByNodeId.get(section.nodeId);
  if (!coverage) failures.push('secao de referencia sem cobertura de reacoes: ' + section.nodeId);
  else if (coverage.status !== 'COBERTA') failures.push('varredura de reacoes falhou para a secao: ' + section.nodeId);
  const structure = structureByNodeId.get(section.nodeId);
  if (!structure) failures.push('secao de referencia sem cobertura estrutural: ' + section.nodeId);
  else if (structure.status !== 'COBERTA') failures.push('varredura estrutural falhou para a secao: ' + section.nodeId);
}
const allowedCollectors = new Set([
  'scripts/collectPrototypeReactions.js',
  'scripts/collectReferenceStructure.js',
]);
const coverageEntries = [
  ...(manifest.coberturaReacoes ?? []).map((coverage) => ({ coverage })),
  ...(manifest.coberturaEstrutura ?? []).map((coverage) => ({ coverage })),
];
const expectedExecutions = new Set();
for (const { coverage } of coverageEntries) {
  if (!coverage?.coletor || !coverage?.nodeId || !Number.isInteger(coverage?.totalPartes)) continue;
  for (let part = 1; part <= coverage.totalPartes; part += 1) {
    expectedExecutions.add(`${coverage.coletor}\u0000${coverage.nodeId}\u0000${part}`);
  }
}
const observedExecutions = new Set();
for (const [index, execution] of (manifest.execucoesColeta ?? []).entries()) {
  if (!allowedCollectors.has(execution?.coletor) || !execution?.secao || !execution?.nodeId || !Number.isInteger(execution?.parte) || execution.parte < 1) {
    failures.push('execucoesColeta[' + index + '] incompleta');
    continue;
  }
  const section = referenceByNodeId.get(execution.nodeId);
  if (!section || section.nome !== execution.secao) {
    failures.push('execucoesColeta[' + index + '] nao corresponde a uma Section de referencia');
    continue;
  }
  const executionKey = `${execution.coletor}\u0000${execution.nodeId}\u0000${execution.parte}`;
  if (observedExecutions.has(executionKey)) failures.push('execucoesColeta possui duplicidade de coletor, Section e parte: ' + executionKey);
  observedExecutions.add(executionKey);
  if (!expectedExecutions.has(executionKey)) failures.push('execucoesColeta[' + index + '] nao corresponde a uma parte esperada da cobertura');
}
for (const executionKey of expectedExecutions) {
  if (!observedExecutions.has(executionKey)) failures.push('coleta unitaria ausente para ' + executionKey);
}
for (const [index, verification] of (manifest.verificacoesTecnicas ?? []).entries()) {
  if (!verification?.regraId || !Array.isArray(verification?.aplicacao?.secoesReferencia) || verification.aplicacao.secoesReferencia.length === 0) {
    failures.push('verificacoesTecnicas[' + index + '] sem regra ou escopo explicito');
    continue;
  }
  if (!['ATENDIDA', 'VIOLADA', 'NAO_APLICAVEL', 'NAO_VERIFICAVEL'].includes(verification.status)) {
    failures.push('verificacoesTecnicas[' + index + '] sem status valido');
  }
  for (const sectionName of verification.aplicacao.secoesReferencia) {
    if (![...referenceByNodeId.values()].some((section) => section.nome === sectionName)) {
      failures.push('verificacoesTecnicas[' + index + '] aponta para Section fora da rodada: ' + sectionName);
    }
  }
}
for (const [index, reaction] of (manifest.reacoes ?? []).entries()) {
  const origin = reaction?.origem;
  if (!origin?.nodeId || !origin?.nome) failures.push('reacoes[' + index + '] sem origem Figma');
  if (reaction?.gatilho === undefined || reaction?.gatilho === null || reaction?.gatilho === '') failures.push('reacoes[' + index + '] sem gatilho');
  if (!['PRINCIPAL', 'OPCIONAL', 'RETORNO', 'EXCECAO', 'REENCONTRO'].includes(reaction?.tipo)) failures.push('reacoes[' + index + '] sem tipo valido');
  if (!['FIGMA', 'DESIGNER', 'NAO_EXPOSTA'].includes(reaction?.fonte)) failures.push('reacoes[' + index + '] sem fonte valida');
  if (!['OBSERVADA', 'SEM_REACAO_OBSERVADA', 'NAO_VERIFICADA_NESTA_RODADA'].includes(reaction?.status)) failures.push('reacoes[' + index + '] sem status valido');
  if (reaction?.status === 'OBSERVADA') {
    if (reaction.fonte !== 'FIGMA') failures.push('reacoes[' + index + '] observada precisa ter fonte FIGMA');
    const target = reaction.target;
    if (!target?.kind || !['NODE', 'URL', 'BACK', 'CLOSE'].includes(target.kind)) {
      failures.push('reacoes[' + index + '] observada sem target valido');
    } else if (target.kind === 'NODE' && (!target.node?.id || !target.node?.name)) {
      failures.push('reacoes[' + index + '] NODE sem destino Figma');
    } else if (target.kind === 'URL' && !/^https:\/\//i.test(target.url ?? '')) {
      failures.push('reacoes[' + index + '] URL sem destino HTTPS');
    }
  }
}
for (const [index, gap] of (manifest.lacunas ?? []).entries()) {
  if (!gap?.id || typeof gap?.bloqueante !== 'boolean' || !gap?.motivo) failures.push('lacunas[' + index + '] precisa ter id, bloqueante e motivo');
}
for (const [index, difference] of (manifest.diferencas ?? []).entries()) {
  if (!difference.tela || !difference.tipo || !Array.isArray(difference.contextoIds)) failures.push('diferencas[' + index + '] incompleta');
  if (!['global', 'convenio', '[CONFIRMAR]'].includes(difference.origemRegra)) failures.push('diferencas[' + index + '] sem origem da regra valida');
  if (!difference.regraDocumentada && difference.confirmar !== true) failures.push('diferencas[' + index + '] sem regra documental ou [CONFIRMAR]');
}
if (manifest.status === 'PROPOSTA_PARA_APROVACAO') {
  if ((manifest.inventario ?? []).length === 0) failures.push('proposta possui inventario vazio');
  if ((manifest.coberturaReacoes ?? []).length === 0) failures.push('proposta possui cobertura de reacoes vazia');
  if ((manifest.coberturaEstrutura ?? []).length === 0) failures.push('proposta possui cobertura estrutural vazia');
  if ((manifest.reacoes ?? []).length === 0) failures.push('proposta possui reacoes vazias; registre tambem ausencia observada quando aplicavel');
  if ((manifest.lacunas ?? []).some((gap) => gap.bloqueante)) failures.push('proposta possui lacuna bloqueante');
}
if (failures.length) { console.error('Manifesto de analise reprovado:'); failures.forEach((failure) => console.error('- ' + failure)); process.exit(1); }
console.log('Manifesto aprovado: ' + manifest.etapa + ' (' + manifest.status + ').');
