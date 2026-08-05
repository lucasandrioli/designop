function validateVariablePlanData(plan, options = {}) {
  const failures = []
  if (plan?.schemaVersion === 1) {
    if (!plan?.id || !plan?.rodada || plan?.rodada !== options.round || plan?.status !== 'PROPOSTO' || !plan?.modalidade || !plan?.etapa || !Array.isArray(plan?.collections) || !Array.isArray(plan?.variaveis)) failures.push('plano de variaveis legado invalido para esta rodada')
    return failures
  }
  if (plan?.schemaVersion !== 2 || !plan?.id || plan?.rodada !== options.round || plan?.status !== 'PROPOSTO' || !plan?.etapa || !plan?.momento) failures.push('plano de variaveis por momento invalido')
  if (!Array.isArray(plan?.modalidades) || plan.modalidades.length === 0) failures.push('plano de variaveis sem modalidades')
  const modalities = new Set()
  for (const item of (plan?.modalidades ?? [])) {
    if (!item?.id || !item?.collectionConteudo || !Array.isArray(item?.variaveis)) { failures.push('modalidade invalida no plano de variaveis'); continue }
    if (modalities.has(item.id)) failures.push('modalidade duplicada no plano de variaveis: ' + item.id)
    modalities.add(item.id)
    for (const variable of item.variaveis) {
      if (!variable?.tela || !variable?.papel || !variable?.caminho || variable?.tipo !== 'CONTEUDO') failures.push('variavel de conteudo invalida')
      if (variable?.mecanismo && !['VARIAVEL', 'PROPERTY', 'VARIANT', 'ESPECIALIZACAO'].includes(variable.mecanismo)) failures.push('mecanismo de variavel invalido')
    }
  }
  for (const decision of (plan?.diferencasEstruturais ?? [])) if (!decision?.modalidade || !decision?.tela || !decision?.descricao || !['ESPECIALIZACAO', 'DECISAO_HUMANA'].includes(decision?.tratamento)) failures.push('diferenca estrutural invalida')
  for (const connection of (plan?.conexoes ?? [])) if (!connection?.modalidade || !connection?.origem || !connection?.destino || !['INTERACAO', 'JORNADA'].includes(connection?.tipo)) failures.push('conexao nao-variavel invalida')
  return failures
}
if (typeof module !== 'undefined') module.exports = { validateVariablePlanData }
