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
- Origem: [CONFIRMAR] regra de produto ou do convenio?
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

## Regras que NAO se aplicam aqui
- Consentimento de dados (existe no c4)
- Anuencia externa (existe no c4 e, [CONFIRMAR], no c2.1)

## Historico
- 2026-07-12: rascunho inicial a partir do desenho do piloto.
