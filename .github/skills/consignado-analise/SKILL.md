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

## Escopo de skills

Em coleta tecnica isolada ou laboratorio, leia localmente somente esta
skill `consignado-analise`, `figma-plugin-api`, `AGENTS.md` e o script do
coletor pedido. Nao leia `consignado-contexto`, `figma-reconstrucao`,
manuais, mapas ou artefatos de outra rodada sem necessidade declarada.

Em analise completa, leia tambem `consignado-contexto` e
`figma-reconstrucao`, alem dos documentos logicos exigidos pelo recorte.
Esse modo produz proposta, contrato e manifesto; coleta tecnica isolada
somente devolve fatos tecnicos e a cobertura solicitada.

Leia AGENTS.md, `docs/contrato-papeis.md`, `docs/operacao-analista.md`,
modelo de contextos, manual global, manual da modalidade, catalogo da etapa,
manual de cada contexto usado e o mapa, se ele ja existir na worktree.
Regra documentada na base nao e perguntada novamente. Regra ausente ou
divergente vira `[CONFIRMAR]` somente nos artefatos internos; encaminhe
alteracao de manual para `/consignado-base` quando aplicavel.

Antes de consolidar qualquer proposta, cruze cada achado relevante com a
base aplicavel: manual global, modalidade, etapa e contexto quando existir.
Registre no estado da rodada um confronto com observacao Figma, fontes da
base, situacao e conclusao. No resumo humano, separe `O que a base ja
estabelece` de `O que a referencia traz para decidir`. Nunca use a tela para
confirmar, contradizer ou inventar uma regra de negocio.

## Conversa guiada com a pessoa operadora

Em rodada conduzida pela Kora, aceite `Figma`, `Etapa`, `Momento`, `Telas e
anexos`, `Modalidades`, `Sections` e `Contexto curto`. Gere o
recorte a partir do envio completo: `Figma`, `Sections` e `Contexto curto`
continuam nele, mas nao bastam sozinhos para iniciar uma rodada por momento.
identificador interno da rodada, execute `startAnalystRun.js` e informe em
linguagem humana que recebeu o material. Nao peca node IDs, schemas,
comandos, nomes de arquivo, manuais ou contexto-id. Descubra esses dados
sozinho a partir do Figma e da base.

Na primeira resposta, confirme o material recebido, diga que vai localizar
as Sections e antecipe que entregara uma proposta temporaria para revisao.
So faca pergunta se a referencia informada nao puder ser localizada.

Durante o trabalho, atualize `estado-analista.json` e mostre apenas
progresso breve por Section. Nao exponha `[CONFIRMAR]`, paginacao,
reconciliacao, schema, nome de gate ou JSON na conversa. Quando faltar regra
de negocio, continue a coleta, registre a lacuna internamente e prepare a
melhor proposta possivel. Pergunte somente quando a Section nao existir ou
for ambigua, a ferramenta nao puder concluir a leitura apos recuperacao
limitada, ou uma resposta humana mudar a estrutura, a jornada ou a
aprovacao.

Ao terminar, grave `pacote-analista.md` como proposta temporaria da rodada e
gere `resumo-operador.md` com `renderAnalystStatus.js --write`. O resumo deve
ter: o que encontrou, proposta, no maximo tres decisoes com impacto e
recomendacao, e proximo passo. O resultado do gate e evidencia interna; nao
cole o JSON na resposta. Nunca crie Figma, componente, template, variavel ou
documento oficial nessa fase.

Antes da coleta, crie `.designops/runs/<id>/referencias.json` conforme
`docs/contratos/referencias-rodada.schema.json`. Ele declara a pagina e as
Sections `ref-*` que fazem parte da rodada. A pagina pode conter biblioteca,
variaveis, templates antigos e componentes locais: fora desse recorte tudo
e `IGNORAR`; dentro dele, ativo existente e `EVIDENCIA_APENAS` e nunca e
autorizacao para editar, mover, publicar ou adotar automaticamente.

Leia a pagina para descobrir o recorte e depois somente as Sections
selecionadas em `referencias.json`. Antes de concluir qualquer mapa, leia
`scripts/collectPrototypeReactions.js` e
`scripts/collectReferenceStructure.js`; execute os dois em cada Section
`ref-*`, incluindo todos os descendentes. Registre cobertura, contagens,
reacoes, destinos, arvore, Auto Layout, instancias, destacamentos,
bindings e lacunas no manifesto temporario. Falha de varredura, Section
sem cobertura, estrutura ausente ou destino nao exposto impedem proposta
para aprovacao. Varra tambem screenshots e evidencia IDS. Rascunhos nao
contam como evidencia. Registre cada ativo estrutural relevante em
`evidenciasEstruturais` com `tipoEncontrado` e `decisao`. Componente local,
template existente ou instancia destacada que ja estavam no arquivo so
podem receber `EVIDENCIA_APENAS` ou `CONFIRMAR` nesta fase. Um componente
local que contenha IDS deve ser `COMPONENTE_LOCAL_COM_IDS`, listar as
instancias IDS descendentes com `nodeId` e `componentKey`, e cada IDS
interno tambem deve receber seu proprio registro `INSTANCIA_IDS`.

Logo depois de gravar o recorte, execute:

```sh
node scripts/validateAnalysisRound.js --round <rodada> --stage pre-coleta
```

O JSON precisa ter `passed: true` antes de abrir qualquer coletor. Se
reprovar, corrija somente o estado temporario ou encerre com lacuna
bloqueante. Nunca grave `referencias.json`, `analise.json`, `contexto.json`,
`resolvido.json` ou `componentes-locais.json` diretamente em
`.designops/runs/`: todos pertencem a `.designops/runs/<rodada>/`.

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
`.designops/runs/<id>/resolvido.json` somente quando a proposta declarar
que precisa associar esses IDs a nodes Figma reais.

Componente local exige duas reutilizacoes previstas no contrato. Toda
proposta separa fato, regra global, regra de convenio e [CONFIRMAR].
Grave `referencias.json`, o manifesto temporario em
`.designops/runs/<id>/analise.json`,
o plano em `.designops/runs/<id>/componentes-locais.json` e, quando houver
contrato dependente de IDs, a resolucao temporaria em
`.designops/runs/<id>/resolvido.json`. Sem componente local, o plano continua
obrigatorio com a lista vazia.

Depois da ultima escrita de `analise.json`, leia o arquivo que acabou de
escrever e valide-o sem terminal. Leia as versoes atuais de
`scripts/validateReferenceScopeCore.js`,
`scripts/validateAnalysisManifestCore.js` e
`scripts/reconcileAnalysisManifestFigma.js`, carregue a skill oficial do
Figma e cole os dois scripts com o objeto do manifesto em uma chamada
`use_figma` somente de leitura. A reconciliacao consulta a pagina e as
Sections que existem agora e precisa ser a ultima interacao Figma do turno.
O core sozinho valida apenas a forma do objeto, portanto nao encerra a
rodada. A chamada nao pode criar, editar ou remover nos no Figma. Depois
das funcoes e dos objetos `manifest` e `referenceScope`, a ultima instrucao e:

```js
return await reconcileAnalysisManifestFigma(manifest, referenceScope);
```

So declare o manifesto validado quando a reconciliacao retornar
`passed: true`. Ela confirma alinhamento com o Figma atual, mas nao
substitui o registro unitario das coletas no historico do turno.
Quando a chamada MCP ou a leitura do manifesto falhar, registre
`NAO_VERIFICAVEL` e a lacuna correspondente. O adaptador Node dos cores e
opcional para desenvolvimento local; o gate de rodada abaixo e um
pre-requisito operacional.

Antes de criar mapa, contrato ou pedir aprovacao, grave `contexto.json`,
`componentes-locais.json` mesmo com lista vazia, o recibo de reconciliacao no
manifesto e `resolvido.json` somente quando a proposta depender de IDs.
Execute:

```sh
node scripts/validateAnalysisRound.js --round <rodada> --stage pre-proposta
```

O JSON precisa ter `passed: true`. `ANALISE_INCOMPLETA`,
`PRECISA_CONTEXTO` e `NAO_VERIFICAVEL` exigem lacuna bloqueante e resposta
final sem proposta. Use `PROPOSTA_PARA_APROVACAO` somente quando a coleta
estiver completa e o recibo da reconciliacao MCP da mesma rodada tiver
`status: "APROVADA"` e `report.passed: true`. Esse recibo e evidencia
declarativa, nao substitui a auditoria do historico MCP.

## Pacote final para revisao

Depois do gate favoravel, prepare somente dentro de
`.designops/runs/<rodada>/` o plano logico `plano-variaveis.json` e a pasta
`proposta/`, com mapa de jornada, contrato de tela, contrato de jornada e
mapa IDS temporarios. Em rodada por momento, substitua esse conjunto por
matriz de variacoes, contrato de momento e contratos de tela por modalidade;
mapa de jornada fica para a composicao posterior. Eles continuam sendo rascunhos: nao escreva Figma,
nao crie collection, mode, variavel, componente ou template nesta etapa.

Atualize `estado-analista.json` para `PRONTO_PARA_REVISAO`, com proposta
`PRONTA`, e execute:

```sh
node scripts/createAnalystPackage.js --round <rodada>
node scripts/validateAnalystPackage.js --round <rodada>
node scripts/renderAnalystStatus.js --round <rodada> --write
```

`pacote-analista.json` e o unico recibo de proposta que Kora aceita. Ele
amarra, por hash, o recorte, manifesto e coletas, contexto, plano de
variaveis, plano de componentes, estado humano e os rascunhos de mapa e
contratos. Quando o manifesto exigir resolucao de IDs, o pacote tambem exige
`resolvido.json`. Sem pacote favoravel, a proposta continua interna e nao
pode pedir aprovacao de contrato.

## Momento e variacoes

Quando existir `escopo-momento.json`, trate-o como recorte imutavel da rodada.
Crie `proposta/matriz-variacoes.json`, `proposta/contrato-momento.json` e um
contrato de tela por superficie presente e modalidade em
`proposta/contratos-tela/`. A matriz separa `CONTEUDO`, `ESTRUTURA`,
`COMPORTAMENTO` e `SEM_DIFERENCA`; apenas conteudo pode entrar no plano de
variaveis. Toda diferenca estrutural recebe especializacao ou decisao humana.
PCon, Refin e demais modalidades podem ser comparados na mesma leitura, mas
nunca compartilham template, collection de conteudo ou plano aplicado.

## Formato da resposta final

Devolva somente o resumo humano gerado a partir do pacote final: o que foi concluido,
o que encontrou, proposta temporaria, decisoes pendentes e proximo passo.
Sem evidencia interna favoravel, explique o que o Analista ainda precisa
resolver; nunca entregue JSON, nomes de gate ou rotulos internos. Sem
`passed: true` no gate interno final, o proximo papel nunca e Montador.
