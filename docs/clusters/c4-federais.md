# Manual do convenio: Servidores Federais

RASCUNHO. Validar com o designer e o time de produto. [CONFIRMAR] marca
o que foi inferido da conversa e nao confirmado.

## Identificacao
- Cluster: c4
- Mode na collection: c4-federais
- Orgao/convenio: convenio federal (servidores publicos federais)
- Modalidades ativas: primeira concessao, refinanciamento

## Regras

### R1. Consentimento de dados obrigatorio antes da simulacao
- Regra: antes de simular, sobe uma tela pedindo consentimento para
  consultar os dados do cliente. Sem aceite, o fluxo nao avanca.
- Origem: [CONFIRMAR] exigencia do convenio federal / LGPD no contexto
  do orgao pagador.
- Mecanismo: mapa de fluxo (etapa consentimento = sim)
- Status: ATIVA

### R2. Tela de dados consultados como segundo nivel
- Regra: do consentimento, o cliente pode abrir uma tela opcional que
  detalha quais dados sao consultados. E botao secundario, nao
  obrigatorio no fluxo.
- Origem: [CONFIRMAR] transparencia exigida pelo convenio.
- Mecanismo: mapa de fluxo (nivel 2, gatilho = botao secundario)
- Status: ATIVA

### R3. Anuencia externa obrigatoria apos a senha
- Regra: apos a senha, o cliente e direcionado a confirmar a operacao
  no site do orgao. So depois de confirmar, a contratacao e efetivada.
- Origem: [CONFIRMAR] exigencia do convenio federal.
- Mecanismo: mapa de fluxo (etapa anuencia = sim) + variant
  aguardando-anuencia no tpl-efetivacao
- Status: ATIVA

### R4. Estado de espera enquanto a anuencia nao chega
- Regra: se o cliente sai sem confirmar, ve a tela de "aguardando
  confirmacao". Quando volta e confirma, a tela atualiza sozinha.
- Origem: decisao de produto (nao deixar o cliente sem feedback).
- Mecanismo: variant Estado=aguardando-anuencia do tpl-efetivacao
- Status: ATIVA

### R5. Titulo da efetivacao difere de outros clusters
- Regra: aqui a contratacao e "registrada", nao "concluida", porque
  depende da confirmacao do orgao.
- Origem: [CONFIRMAR] precisao juridica exigida pelo convenio?
- Mecanismo: variavel efetivacao/titulo (mode c4-federais)
- Status: ATIVA

### R6. [CONFIRMAR] Limite maior de valor
- Regra: valor maximo de simulacao superior ao do c1.
- Origem: [CONFIRMAR] margem consignavel do convenio federal.
- Mecanismo: variavel simulacao/valor-maximo
- Status: [CONFIRMAR] valores reais.

## Regras que NAO se aplicam aqui
- [CONFIRMAR] alguma etapa que existe no c1 e nao existe aqui?

## Historico
- 2026-07-12: rascunho inicial a partir do desenho do piloto.
