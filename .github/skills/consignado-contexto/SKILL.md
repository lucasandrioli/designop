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

Antes de perguntar, recupere manual global, manual da modalidade,
catalogo da etapa, mapa e manuais de contexto que ja existirem.
Descubra o que puder nas referencias e pergunte apenas objetivo,
limite, modalidade, contexto-id, rotulo atual e regra que explica
diferencas. Mostre em conversa o rascunho do manual global, manual da
modalidade, manual de contexto, catalogo e mapa.

Espere aprovacao humana explicita do texto. So entao crie ou atualize
docs/manual-credito-consignado.md, docs/modalidades/<modalidade>.md,
docs/contextos/<contexto-id>.md, docs/etapas/<etapa>.md e
docs/mapas/<modalidade>.md. O que nao tiver origem aprovada recebe
[CONFIRMAR].
