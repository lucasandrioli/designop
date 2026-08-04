---
name: consignado-analise
description: Analisa referencias reais por contexto e entrega contrato consolidado para aprovacao humana. Somente leitura.
user-invocable: true
disable-model-invocation: true
---

# Analise de etapa

As skills deste projeto vivem em `.github/skills/` e sao lidas localmente.
Nao tente descobri-las com `figma-get_figma_skill`: nunca chame
`skill://index.json` e nunca use URI `skill://figma/...` para uma skill
local. Pelo MCP, carregue apenas a skill oficial `figma-use` antes de cada
`use_figma`.

Em rodada nova, comece pelo escopo pedido, `AGENTS.md` e as skills
necessarias. Leia somente documentos e scripts exigidos por esse escopo;
nao liste diretorios inteiros por padrao. Laboratorio tecnico nao pede
manual de negocio. Nao leia `.designops/runs/<outra-rodada>/`, a menos que
o pedido diga expressamente para retomar ou comparar a rodada identificada.

Leia AGENTS.md, `docs/contrato-papeis.md`, modelo de contextos, manual
global, manual da modalidade, catalogo da etapa, mapa e manual de cada
contexto usado. Na primeira resposta, diga o que vai investigar, peca
somente a lacuna bloqueante e informe a proposta que entregara antes de
qualquer escrita. Sem manual ou regra necessaria, registre [CONFIRMAR]
e pare se a lacuna for bloqueante.

Leia a pagina inteira e somente referencias ref-<modalidade>-<tela>-
<contexto-id>. Antes de concluir qualquer mapa, leia
`scripts/collectPrototypeReactions.js` e
`scripts/collectReferenceStructure.js`; execute os dois em cada Section
`ref-*`, incluindo todos os descendentes. Registre cobertura, contagens,
reacoes, destinos, arvore, Auto Layout, instancias, destacamentos,
bindings e lacunas no manifesto temporario. Falha de varredura, Section
sem cobertura, estrutura ausente ou destino nao exposto impedem proposta
para aprovacao. Varra tambem screenshots e evidencia IDS. Rascunhos nao
contam como evidencia.

Antes de executar qualquer coletor, descubra novamente a pagina no
arquivo atual com `figma-get_metadata` sem `nodeId`, e depois leia com
`figma-get_metadata` a pagina retornada. Localize cada Section pelo nome
exato nessa leitura. Use somente os `nodeId` devolvidos nessa descoberta
da rodada. Nunca use IDs de memoria, de conversa, de relatorio anterior
ou de uma rodada anterior. Se a Section exata nao existir, nao substitua
por uma parecida: nao execute o coletor, registre a lacuna bloqueante e
pare a analise. No manifesto, registre
`fontes.figma.descoberta.metodo: "figma-get_metadata"` e o
`paginaNodeId` retornado.

Todo contrato de interacao deve nascer da saida do coletor: copie nomes,
origens, destinos e raiz de validacao observados. A raiz escolhida deve
conter a acao declarada. Nome vindo de memoria, de documento ou de plano
nao substitui a evidencia Figma.

Antes de cada `use_figma`, carregue somente a skill oficial com
`figma-get_figma_skill` em `skill://figma/figma-use/SKILL.md`; a skill
local `figma-plugin-api` nao a substitui. Cada chamada de coleta deve
executar exatamente um coletor, uma Section e uma parte. Nao envolva
duas Sections, dois coletores ou varias partes no mesmo script
`use_figma`. Para cada coletor, comece na `part: 1`, leia
`paginacao.totalPartes` e execute todas as partes restantes da mesma
Section, uma por vez. Registre no
manifesto `totalPartes`, `pageSize`, `totalItens`, `itensPorParte` e a
lista ordenada `partesLidas`, alem de uma entrada em `execucoesColeta`
para cada coletor, Section e parte; uma Section so recebe `COBERTA`
quando todas as partes estao completas. No relatorio final, mostre esses
mesmos numeros para cada coleta, para que a cobertura possa ser auditada. Se a resposta for
salva em arquivo temporario pelo cliente, recupere a parte correspondente
ou reduza `pageSize` e rode novamente aquela parte. Nunca complete uma
lacuna por "padrao semelhante": marque a varredura como `FALHOU` e
mantenha a lacuna bloqueante ate recuperar a evidencia.

`boundVariableFields` vazio significa somente "nenhum binding observado
nos campos lidos". Uma propriedade visual com valor e sem binding
observado tambem e apenas um fato bruto. Nao escreva "manual", "errado" ou "sem token" sem
comparar o contrato aplicavel. O coletor apresenta sinais tecnicos; a
classificacao pertence ao contrato e ao Validador.

No relatorio, preserve literalmente os nomes de campos devolvidos pelos
coletores. Em especial, use
`propriedadesVisuaisComValorSemBindingObservado`; nunca o renomeie para
`camposVisuaisSemBindingObservado`. Caso o nome tecnico prejudique a
leitura, explique-o em portugues ao lado, sem alterar o identificador
original. Esse sinal continua sendo observacao bruta, nao defeito.

Uma regra tecnica temporaria so pode produzir `VIOLADA` quando seu
escopo foi declarado explicitamente para a Section avaliada. Registre
cada regra em `verificacoesTecnicas` com as Sections a que ela se aplica
e use somente `ATENDIDA`, `VIOLADA`, `NAO_APLICAVEL` ou
`NAO_VERIFICAVEL`. Ausencia de instancia IDS, Auto Layout ou binding
nunca basta para concluir que a regra se aplica.

Entregue inventario, reacoes, mapa, contrato de tela, mapa IDS, plano
de variaveis e proposta de composicao. Para confirmacao externa dentro
de Formalizacao, registre presenca e contrato de retorno (`DIRETO` ou
`ACAO_NO_APP`), alem da orientacao direta ou do tutorial opcional, no
mapa e no contrato de jornada. Quando existir tutorial, prove a
bifurcacao e o reencontro no mesmo direcionamento externo. As telas e a cadeia do
ambiente externo sao evidencias de caminho, nao templates internos; sua
quantidade, canais e formato so podem ser registrados como regra local
do contexto. Quando houver componente local,
registre tambem o plano temporario com aprovacao, duas reutilizacoes
previstas e contextos conhecidos. Classifique cada diferenca como
regra de negocio, defeito estrutural, variavel, property, variant,
local-layout ou componente local. O contrato usa IDs logicos; grave em
`.designops/runs/<id>/resolvido.json` somente a resolucao temporaria
desses IDs para os node IDs reais.

Componente local exige duas reutilizacoes previstas no contrato. Toda
proposta separa fato, regra global, regra de convenio e [CONFIRMAR].
Grave somente o manifesto temporario em `.designops/runs/<id>/analise.json`,
a resolucao temporaria em `.designops/runs/<id>/resolvido.json` e o plano
em `.designops/runs/<id>/componentes-locais.json`. Sem componente local,
o plano continua obrigatorio com a lista vazia.

Depois da ultima escrita de `analise.json`, leia o arquivo que acabou de
escrever e valide-o sem terminal. Leia as versoes atuais de
`scripts/validateAnalysisManifestCore.js` e
`scripts/reconcileAnalysisManifestFigma.js`, carregue a skill oficial do
Figma e cole os dois scripts com o objeto do manifesto em uma chamada
`use_figma` somente de leitura. A reconciliacao consulta a pagina e as
Sections que existem agora e precisa ser a ultima interacao Figma do turno.
O core sozinho valida apenas a forma do objeto, portanto nao encerra a
rodada. A chamada nao pode criar, editar ou remover nos no Figma. Depois
das funcoes e do objeto `manifest`, a ultima instrucao e:

```js
return await reconcileAnalysisManifestFigma(manifest);
```

So declare o manifesto validado quando a reconciliacao retornar
`passed: true`. Ela confirma alinhamento com o Figma atual, mas nao
substitui o registro unitario das coletas no historico do turno.
Quando a chamada MCP ou a leitura do manifesto falhar, registre
`NAO_VERIFICAVEL` e a lacuna correspondente. O comando Node e opcional
para desenvolvimento local e nunca e pre-requisito operacional.
