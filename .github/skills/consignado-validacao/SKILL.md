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
validateTypographyContract, validateCanvasOrganization, validateLayout, validateRound e
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
as partes de cada Section. Registre tambem `pageSize`, `totalItens` e
`itensPorParte` para provar o tamanho de cada leitura. Nunca aceite uma conclusao baseada em resumo
ou em trecho truncado.

Prove que IDS foi usado quando disponivel, componente local tem duas
reutilizacoes previstas aprovadas e composicao unica esta declarada
como local-layout. Confirme que nomes publicados nao carregam
contexto-id ou rotulo.

Para cada contexto do mapa, compare preview e referencia correspondente.
Para cada Section de jornada, prove uma unica collection de conteudo
da modalidade, collections IDS estruturais permitidas, mode aplicado
uma vez na Section e nenhum mode explicito em descendentes.

Para contratos v2, `validateRound` confere a coerencia dos arquivos e
evidencias; ele nao prova a tela real. Rode no MCP
`validateCompositionContract` para cada Slot declarado e
`validateTypographyContract` para cada alvo textual. O primeiro confirma
instancia IDS remota, SlotNode, property `SLOT`, conteudo e
`limitViolations`; o segundo usa segmentos reais para texto UNICO ou
MISTO. Guarde os relatorios literais com `roundId`, IDs verificados,
`writtenAt` e `readAt` em `.designops/runs/<rodada>/evidencias-mcp.json`.
Depois rode `validateRound --stage pre-promocao --evidence ...`.

Se nao for possivel reler o Figma ou executar o validador correspondente,
o resultado e `NAO_VERIFICAVEL`, mesmo que uma tentativa de correcao nao
tenha retornado erro. Modes estruturais e variaveis tipograficas do IDS
sao permitidos; so o mode da collection de conteudo de contexto e proibido
no template e descendentes.

Emita APTO PARA PROMOCAO, REPROVADO ou NAO VERIFICAVEL. Nao corrija e
nao promova.

## Recibo verificavel

Antes de encerrar, grave
`.designops/runs/<rodada>/veredito-validador.json` e execute
`validateValidatorVerdict.js --round <rodada>`. O veredito referencia,
por caminho e hash, a montagem, contrato, resolucao, evidencias MCP e
o resultado pre-promocao. Para `APTO_PARA_PROMOCAO`, todos os resultados
por template e contexto devem ser favoraveis e o recibo precisa conter:

- `CRIACAO`, `CONTEUDO`, `MODES`, `LAYOUT` e `PRE_PROMOCAO` favoraveis;
- releituras independentes de estrutura e interacoes;
- revisao visual favoravel, registrada por template e contexto.

Depois da aprovacao humana e da promocao executada pelo papel
autorizado, confira o `pacote-promocao.json` com
`validatePromotionPackage.js --round <rodada>`. Esse segundo recibo
exige a aprovacao ja registrada pela Kora, `validatePromotion`
favoravel, releitura apos a promocao e nomes publicados no formato
`<modalidade>/<etapa>/tpl-<tela>`, sem contexto.

Inclua sempre o checklist humano de confirmar que `_componentes-locais`
nao sera publicado como asset da library.
