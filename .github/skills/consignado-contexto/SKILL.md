---
name: consignado-contexto
description: Captura contexto de uma etapa e registra somente texto aprovado por humano em manuais, catalogos e mapas.
user-invocable: true
disable-model-invocation: true
---

# Captura de contexto

Use antes da analise quando faltarem documentos do recorte. Leia
`docs/contrato-papeis.md`, os moldes de modalidade, etapa, mapa e
contexto. Na primeira resposta, diga o que vai investigar, pergunte
somente a primeira lacuna bloqueante e informe qual texto entregara ao
fim do turno. Tela e prototipo revelam fluxo, nunca a origem de uma
regra.

## Contexto guiado com referencias Figma

Quando o pedido incluir leitura Figma, carregue localmente
`consignado-contexto`, `consignado-analise` e `figma-plugin-api`.
Carregue `figma-reconstrucao` somente se tambem precisar resolver IDS,
arvore-alvo ou fontes de composicao. Antes de cada `use_figma`, inclusive
uma chamada subsequente somente de leitura, carregue a skill oficial
`skill://figma/figma-use/SKILL.md`. Uma coleta continua atomica: um
coletor, uma Section e uma parte por chamada; nao use lotes nem wrappers.

Para localizar documentos existentes, leia os caminhos canonicos do
recorte um a um: manual global, modalidade, etapa, mapa e cada
`docs/contextos/<contexto-id>.md` informado ou descoberto nas referencias.
Nao liste diretorios inteiros. Quando nenhum documento preenchido existir,
isso e uma lacuna de contexto, nao autorizacao para inferir regra.

Classifique cada frase do rascunho como `FATO OBSERVADO`, `REGRA
DOCUMENTADA`, `REGRA CONFIRMADA` ou `[CONFIRMAR]`. Estrutura, reacao,
sequencia, timeout e tela existente no Figma sao somente `FATO
OBSERVADO`. Nunca escreva "regra global" ou "regra local" sem fonte
documental ou confirmacao humana identificada. Em particular, retorno
`DIRETO` ou `ACAO_NO_APP`, presenca obrigatoria de confirmacao externa e
tutorial opcional ficam `[CONFIRMAR]` ate essa fonte existir.

Antes de perguntar, recupere manual global, manual da modalidade,
catalogo da etapa, mapa e manuais de contexto que ja existirem.
Descubra o que puder nas referencias e pergunte apenas objetivo,
limite, modalidade, contexto-id, rotulo atual e regra que explica
diferencas. Quando houver confirmacao externa dentro de Formalizacao,
pergunte se ela esta presente e qual e o contrato de retorno ao app:
`DIRETO` ou `ACAO_NO_APP`. Pergunte tambem se a orientacao oferece
tutorial opcional, que deve reencontrar o mesmo direcionamento externo
do caminho direto. Nao pergunte quantidade de acoes externas
para decidir a arquitetura: quantidade, canais e formato sao regra local
do contexto. Mostre em conversa o rascunho do manual global, manual da
modalidade, manual de contexto, catalogo e mapa.

Espere aprovacao humana explicita do texto. So entao crie ou atualize
docs/manual-credito-consignado.md, docs/modalidades/<modalidade>.md,
docs/contextos/<contexto-id>.md, docs/etapas/<etapa>.md e
docs/mapas/<modalidade>.md. O que nao tiver origem aprovada recebe
[CONFIRMAR].
