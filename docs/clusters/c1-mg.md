# Manual do convenio: Governo de Minas Gerais

RASCUNHO gerado a partir da conversa de desenho. TODAS as regras
precisam de validacao do designer e do time de produto. Marcado como
[CONFIRMAR] o que foi inferido.

## Identificacao
- Cluster: c1
- Mode na collection: c1-mg
- Orgao/convenio: Governo de Minas Gerais
- Modalidades ativas: primeira concessao, refinanciamento

## Regras

### R1. Nao ha consentimento de dados no fluxo
- Regra: o fluxo vai direto da oferta para a simulacao, sem tela de
  consentimento de acesso a dados.
- Origem: [CONFIRMAR] o convenio ja preve o compartilhamento, ou o
  consentimento acontece fora do app?
- Mecanismo: mapa de fluxo (etapa consentimento = nao)
- Status: ATIVA

### R2. Nao ha anuencia externa
- Regra: apos a senha, o cliente vai direto para a tela de efetivacao.
  Nao ha etapa de confirmacao em site do orgao.
- Origem: [CONFIRMAR] o convenio de MG nao exige confirmacao externa.
- Mecanismo: mapa de fluxo (etapa anuencia = nao)
- Status: ATIVA

### R3. Cliente elegivel a seguro consignado e portabilidade
- Regra: ambas as ofertas adicionais aparecem na simulacao quando o
  cliente e elegivel.
- Origem: confirmado pelo designer (2026-07-25): a oferta de seguro
  existe nos clusters 1 e 4, mas NAO existe no cluster 5 (cluster sem
  manual proprio ainda neste repo; anotado aqui como referencia
  cruzada para quando ele for documentado).
- Mecanismo: variaveis elegibilidade/mostra-seguro e
  elegibilidade/mostra-portabilidade
- Status: ATIVA

### R4. Elegibilidade de portabilidade depende de salario em outro banco
- Regra: a oferta de portabilidade so aparece se o cliente recebe
  salario em outro banco.
- Origem: [CONFIRMAR] regra de produto.
- Mecanismo: variavel elegibilidade/mostra-portabilidade
- Status: [CONFIRMAR] esta regra vale para todos os clusters ou so
  para este?

### R5. Texto de suporte da oferta de seguro difere em tom entre clusters
- Regra: mesmo quando a oferta de seguro aparece nos dois clusters (c1
  e c4), o texto de suporte muda de tom: aqui, "Protege seu contrato"
  (beneficio opcional); no c4, "Protecao exigida pelo convenio"
  (soa obrigatorio).
- Origem: [CONFIRMAR] se o seguro e de fato obrigatorio no c4 (o que
  teria implicacao alem do texto — ex: a acao de remover a oferta
  deveria sumir la) ou se e so uma escolha de copy sem diferenca de
  comportamento. Achado pelo agente inventario ao comparar as
  referencias cruas, 2026-07-25.
- Mecanismo: variavel oferta-seguro/texto-suporte (mode por cluster)
- Status: [CONFIRMAR]

## Regras que NAO se aplicam aqui
- Consentimento de dados (existe no c4)
- Anuencia externa (existe no c4 e, [CONFIRMAR], no c2.1)

## Historico
- 2026-07-12: rascunho inicial a partir do desenho do piloto.
- 2026-07-25: R3 confirmada (seguro existe em c1/c4, nao em c5); R5
  adicionada (divergencia de tom no texto do seguro, achado pelo
  inventario, mecanismo ainda [CONFIRMAR]).
