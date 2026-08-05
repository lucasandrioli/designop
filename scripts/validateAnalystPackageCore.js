/*
 * Validador portatil do pacote final do Analista.
 * Ele confere forma e coerencia interna; o adaptador Node tambem confere
 * caminhos, hashes e o gate da rodada antes de Kora aceitar a proposta.
 */
function validateAnalystPackageData(pacote, options = {}) {
  const failures = [];
  const required = ['schemaVersion', 'id', 'rodada', 'status', 'artefatos', 'resumoHumano'];
  for (const field of required) if (!(field in (pacote ?? {}))) failures.push('campo ausente: ' + field);
  if (![1, 2].includes(pacote?.schemaVersion)) failures.push('schemaVersion precisa ser 1 ou 2');
  if (!pacote?.id || !pacote?.rodada) failures.push('id e rodada sao obrigatorios');
  if (options.round && pacote?.rodada !== options.round) failures.push('pacote pertence a outra rodada');
  if (pacote?.status !== 'PRONTO_PARA_REVISAO') failures.push('pacote precisa estar PRONTO_PARA_REVISAO');

  const requiredTypes = pacote?.schemaVersion === 2
    ? ['ESCOPO_MOMENTO', 'REFERENCIAS', 'MANIFESTO_ANALISE', 'CONTEXTO', 'ESTADO_ANALISTA', 'MATRIZ_VARIACOES', 'CONTRATO_MOMENTO', 'PLANO_VARIAVEIS', 'PLANO_COMPONENTES_LOCAIS', 'CONTRATO_TELA', 'MAPA_IDS']
    : ['REFERENCIAS', 'MANIFESTO_ANALISE', 'CONTEXTO', 'ESTADO_ANALISTA', 'PLANO_VARIAVEIS', 'PLANO_COMPONENTES_LOCAIS', 'MAPA_JORNADA', 'CONTRATO_TELA', 'CONTRATO_JORNADA', 'MAPA_IDS'];
  if (!Array.isArray(pacote?.artefatos)) failures.push('artefatos precisa ser uma lista');
  const types = new Set();
  const paths = new Set();
  for (const [index, artifact] of (pacote?.artefatos ?? []).entries()) {
    const label = 'artefatos[' + index + ']';
    if (!artifact?.tipo || !artifact?.caminho || !/^[a-f0-9]{64}$/.test(artifact?.sha256 ?? '')) {
      failures.push(label + ' incompleto');
      continue;
    }
    if (types.has(artifact.tipo) && artifact.tipo !== 'CONTRATO_TELA') failures.push('artefatos repete tipo: ' + artifact.tipo);
    if (paths.has(artifact.caminho)) failures.push('artefatos repete caminho: ' + artifact.caminho);
    types.add(artifact.tipo);
    paths.add(artifact.caminho);
  }
  for (const type of requiredTypes) if (!types.has(type)) failures.push('artefato obrigatorio ausente: ' + type);
  if (options.requiresResolution === true && !types.has('RESOLUCAO_IDS')) failures.push('proposta depende de IDs e exige RESOLUCAO_IDS');
  if (options.requiresResolution === false && types.has('RESOLUCAO_IDS') === false) {
    // A resolucao e realmente opcional. O ramo deixa a regra explicita para o
    // uso portatil do core, sem forcar um recibo inexistente.
  }

  const human = pacote?.resumoHumano;
  if (!Array.isArray(human?.concluido) || human.concluido.length === 0) failures.push('resumo humano sem conclusoes');
  if (!Array.isArray(human?.encontrado) || human.encontrado.length === 0) failures.push('resumo humano sem achados');
  if (!human?.proposta?.resumo || !Array.isArray(human?.proposta?.entregaveis) || human.proposta.entregaveis.length === 0) failures.push('resumo humano sem proposta');
  if (!Array.isArray(human?.decisoes) || human.decisoes.length > 3) failures.push('resumo humano com decisoes invalidas');
  for (const [index, decision] of (human?.decisoes ?? []).entries()) {
    if (!decision?.pergunta || !decision?.impacto || !decision?.recomendacao) failures.push('resumo humano decisao[' + index + '] incompleta');
  }
  if (!human?.proximoPasso) failures.push('resumo humano sem proximo passo');
  const humanText = JSON.stringify(human ?? {});
  if (/https?:\/\/|node-id|nodeId|\bschema\b|\bJSON\b|\bpaginação\b|\bpaginacao\b|\bgate\b|\breconcilia(?:cao|ção)\b|\[CONFIRMAR\]/i.test(humanText)) {
    failures.push('resumo humano contem detalhe tecnico ou evidencia bruta');
  }
  return failures;
}

if (typeof module !== 'undefined') module.exports = { validateAnalystPackageData };
