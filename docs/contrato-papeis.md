# Contrato de papeis e conversa

Este documento define como os papeis conversam com o designer e como
passam trabalho adiante. Ele vale mesmo quando uma rodada comeca sem
nenhum documento preenchido.

## Conversa guiada

Todo papel abre o turno de forma legivel. Antes de executar, ele deve:

1. dizer qual e seu papel e o que vai investigar ou executar agora;
2. recuperar os documentos que ja existem, em vez de pedir contexto que
   o repositorio ja possui;
3. pedir apenas a primeira lacuna que bloqueia seu trabalho;
4. informar o artefato ou veredito que entregara no fim do turno;
5. explicar naturalmente onde seu escopo termina e qual e o proximo
   papel, sem transferir a responsabilidade dele.

O agente nao transforma a conversa em checklist para o designer. Ele
faz o que consegue por conta propria e interrompe apenas quando uma
decisao, uma regra ou uma evidencia humana for indispensavel.

## Recuperacao de contexto

Em uma conversa nova, o papel procura as camadas nesta ordem:

1. manual global do credito consignado;
2. manual da modalidade;
3. catalogo da etapa;
4. mapa da modalidade;
5. manuais dos contextos citados pelo mapa;
6. manifesto temporario da rodada, quando existir.

Se uma camada nao existir, o agente explica a lacuna e abre contexto
guiado. Regra que nao estiver documentada ou confirmada vira
`[CONFIRMAR]`; uma tela nunca e prova da origem de uma regra.

## Operador

O Operador inicia apenas a Fase 0 documental. Ele cria um Leitor por
etapa, aguarda todos e consolida disponibilidade documental, lacunas e
proximo papel. Pode gravar somente o estado temporario em
`.designops/runs/`.

Ele nao abre Figma, nao escreve documentos oficiais e nao chama os
papeis seguintes. Ao encerrar, deixa claro se a proxima conversa deve
capturar contexto ou analisar referencias.

## Leitor de etapa

O Leitor e subagente interno do Operador. Ele le somente documentos e
devolve um cartao curto: fontes encontradas, ausencias e impedimentos.
Nao abre Figma, nao edita arquivos, nao chama outros agentes e nao
interpreta regras.

## Analista

O Analista trabalha em dois momentos distintos.

Em `/consignado-contexto`, ele conversa com o designer para separar
fato observado de regra de negocio. Mostra o rascunho do manual global,
manual da modalidade, catalogo de etapa, manual de contexto e mapa.
So grava esses documentos depois de aprovacao humana explicita do texto.
Quando Formalizacao tiver confirmacao externa, registra no mapa somente a
presenca, o roteiro de orientacao e o contrato de retorno ao app. O
tutorial, quando existir, e opcional e reencontra o mesmo
direcionamento externo. Quantidade, canais e formato das acoes externas
ficam no manual do contexto; evidencias externas nao viram templates
internos.

Em `/consignado-analise`, ele le somente referencias cruas, reacoes de
prototipo, documentos aprovados e evidencia IDS. Antes de propor mapa,
varre programaticamente cada Section `ref-*` e todos os descendentes com
`collectPrototypeReactions.js` e `collectReferenceStructure.js`. Grava
o manifesto e a resolucao temporaria de IDs em `.designops/runs/`, sem
prender o documento oficial a IDs do Figma. Entrega uma unica proposta
com inventario, prova de reacoes e estrutura, mapa de jornada, contrato
de tela, mapa IDS, plano de variaveis e proposta de componentes locais.
Rascunhos e previews nao sao evidencia analitica.

Antes da primeira coleta, o Analista redescobre a pagina e as Sections
por `figma-get_metadata` no arquivo atual. IDs obtidos em conversa,
manifesto ou rodada anteriores nao podem ser reutilizados. O manifesto
temporario registra o metodo de descoberta e a pagina retornada. Quando
uma Section pedida nao aparece com o nome exato, a coleta nao e
executada e a lacuna e bloqueante.

Depois de gravar o manifesto temporario, o Analista o relê e executa
`validateAnalysisManifestCore.js` pelo MCP do Figma sem mutar o arquivo.
Essa e a validacao operacional, inclusive em ambientes que nao permitem
terminal. O adaptador Node existe somente para desenvolvimento local.
Falha de leitura ou de execucao do validador resulta em
`NAO_VERIFICAVEL`.

Os coletores devolvem a leitura em partes numeradas. O Analista le todas
as partes de cada Section e registra essa prova no manifesto, junto de
`pageSize`, `totalItens` e `itensPorParte`. Uma tela ou um detalhe nao
pode ser omitido porque a resposta ficou grande.

Cada coleta e atomica: um coletor, uma Section e uma parte por execucao
no Figma. O Analista nao cria wrappers que varrem varias Sections ou
misturam reacoes e estrutura em uma unica chamada. O manifesto registra
cada execucao para que o Validador confira a cobertura sem depender de
uma afirmacao textual.

Quando a rodada usar um criterio tecnico temporario, o Analista registra
primeiro o escopo explicito da regra. O resultado so pode ser
`ATENDIDA`, `VIOLADA`, `NAO_APLICAVEL` ou `NAO_VERIFICAVEL`. Uma regra
de IDS, por exemplo, nao se aplica a uma referencia apenas porque ela
nao tem instancia remota: o contrato precisa ter declarado que aquela
Section deveria usar IDS.

O Analista nao monta nem promove. Seu turno termina pedindo aprovacao
do contrato consolidado ao designer, quando nao houver lacuna bloqueante.

## Montador

O Montador recebe somente contrato consolidado aprovado. Ele confirma
essa aprovacao na abertura do turno e para quando houver uma lacuna
bloqueante.

Escreve em serie: primeiro cria componentes locais que tenham duas
reutilizacoes previstas e aprovadas; depois cria rascunhos e templates
com IDS, componentes locais aprovados e `local-layout` declarado. Tudo
fica na verificacao ate o veredito independente.

Antes da primeira escrita, executa o gate da rodada. Antes de montar um
template, executa a validacao de composicao do contrato aprovado. Esses
gates verificam se cada papel sera IDS, componente local reutilizavel ou
`local-layout`; eles nao tomam essa decisao pelo Montador.

O Montador nao valida nem promove por conta propria. Entrega rascunho,
previews, contrato e evidencias para o Validador. Antes da publicacao
da library, deixa o checklist humano de manter `_componentes-locais`
interno.

## Validador

O Validador nao corrige. Ele audita arvore semantica, geometria, IDS,
bindings, colecao de conteudo, heranca de mode, comportamento,
organizacao do canvas e revisao visual. Quando houver uma jornada,
tambem prova o consumo das instancias declaradas na Section.

Ele refaz a coleta de reacoes e estrutura no Figma e compara o resultado
com o manifesto do Analista. Se a evidencia atual divergir, se uma
Section ficar sem cobertura ou se faltar prova para um ponto do contrato,
o veredito e `NAO VERIFICAVEL`, nao uma inferencia favoravel.

Seu turno termina com `APTO PARA PROMOCAO`, `REPROVADO` ou
`NAO VERIFICAVEL`. Somente `APTO PARA PROMOCAO` permite que o Montador
promova o template. A validacao de uma Section nao e pre-requisito para
promover um template isolado que ainda nao participe de jornada completa.

## Aprendiz

O Aprendiz e comando explicito do Analista. Ele observa referencia
humana e pode escrever somente em `docs/receitas/`. Nao deduz regra de
negocio, nao altera Figma e nao altera manuais, mapas ou contratos.

## Sequencia obrigatoria

1. Operador, quando houver leitura paralela de varias etapas.
2. Analista captura contexto e registra somente texto aprovado.
3. Analista consolida a proposta e o contrato.
4. Designer aprova o contrato.
5. Montador cria componentes locais e templates em serie.
6. Validador emite veredito independente.
7. Montador promove somente com veredito favoravel.
