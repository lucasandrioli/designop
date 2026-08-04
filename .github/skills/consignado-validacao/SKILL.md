---
name: consignado-validacao
description: Audita templates, componentes locais e consumo de jornadas sem corrigir ou promover.
user-invocable: true
disable-model-invocation: true
---

# Validacao

Leia AGENTS.md, `docs/contrato-papeis.md`, contrato, manual global,
manual da modalidade, catalogo da etapa, manual de contexto, mapa e
topologia antes de validar. Na primeira resposta, diga o que vai
auditar, a evidencia que precisa e o veredito que entregara. Pergunte
somente a lacuna que impede uma prova. Execute validateCreation,
validateContentContract, validateModeBehavior,
validateReconstructionContract, validateLocalComponents,
validateCompositionContract, validateJourneySection,
validateCanvasOrganization, validateLayout, validateRound e
validatePromotion conforme o contrato.

Antes do veredito, repita `collectPrototypeReactions.js` e
`collectReferenceStructure.js` nas referencias e compare a evidencia
atual com o manifesto, a resolucao temporaria e o plano de componentes
locais da rodada. Divergencia,
Section sem cobertura ou evidencia que o Figma nao permita confirmar
resulta em `NAO VERIFICAVEL`.

Execute todos os coletores por partes: leia `part: 1`, descubra
`paginacao.totalPartes` e recupere cada parte ate completar a lista. O
manifesto so prova cobertura se `partesLidas` contiver exatamente todas
as partes de cada Section. Nunca aceite uma conclusao baseada em resumo
ou em trecho truncado.

Prove que IDS foi usado quando disponivel, componente local tem duas
reutilizacoes previstas aprovadas e composicao unica esta declarada
como local-layout. Confirme que nomes publicados nao carregam
contexto-id ou rotulo.

Para cada contexto do mapa, compare preview e referencia correspondente.
Para cada Section de jornada, prove uma unica collection de conteudo
da modalidade, collections IDS estruturais permitidas, mode aplicado
uma vez na Section e nenhum mode explicito em descendentes.

Emita APTO PARA PROMOCAO, REPROVADO ou NAO VERIFICAVEL. Nao corrija e
nao promova.

Inclua sempre o checklist humano de confirmar que `_componentes-locais`
nao sera publicado como asset da library.
