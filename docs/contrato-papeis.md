# Contrato de papeis e conversa

Este documento define como os papeis conversam com o designer e como
passam trabalho adiante. Uma rodada comeca com a base documental
aprovada, mas sem estado ou evidencia de rodadas anteriores.

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

## Kora

Kora e a unica agente visivel. Ela recebe Figma, nomes de Sections e contexto
curto; mantem o estado orquestrado; chama papeis internos; e apresenta apenas
progresso, achados, proposta, resultado e decisoes humanas. Kora nao interpreta
regra de negocio, nao altera Figma, nao altera manual aprovado e nao promove.

Cada passagem de papel devolve um recibo verificavel: artefatos esperados,
validacao aplicavel, resultado, lacuna e proximo passo. Kora nao avanca por uma
afirmacao narrativa. Recuperacao tecnica pode ser tentada duas vezes para a
mesma causa; depois a rodada aguarda decisao humana ou fica bloqueada.

Antes de perguntar algo, Kora classifica a falha. Regra, jornada ou aprovacao
viram decisao humana; referencia ainda nao comprovada volta ao papel
responsavel; mecanismo interno defeituoso vira incidente da operacao. Neste
ultimo caso, Kora nao corrige codigo: interrompe a rodada, preserva a evidencia
e entrega somente o bloco **Encaminhar ao Codex** para a manutencao.

Analista, Montador, Validador, Operador, Leitor e Registrador de Auditoria sao
internos. O Registrador publica somente relato sanitizado na trilha de auditoria
e nao acessa Figma nem documentos de negocio.

## Recuperacao de contexto

Em uma conversa nova, o papel procura as camadas nesta ordem:

1. manual global do credito consignado;
2. manual da modalidade;
3. catalogo da etapa;
4. manuais dos contextos aplicaveis;
5. mapa da modalidade, quando ja existir na worktree;
6. manifesto temporario da rodada, quando existir.

Se um manual-base nao existir, o agente aponta falha da base e encaminha
para `/consignado-base`. Regra que nao estiver documentada ou confirmada
vira `[CONFIRMAR]`; uma tela nunca e prova da origem de uma regra.

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

O Analista trabalha em tres momentos distintos.

Em `/consignado-base`, ele atua em worktree dedicada de curadoria, sem
Figma. Recebe explicacoes humanas, classifica regra como documentada,
confirmada ou `[CONFIRMAR]`, apresenta o rascunho consolidado e so escreve
manual, catalogo ou indice depois de aprovacao humana explicita. A pessoa
responsavel revisa e faz o merge manual para o `master`.

Em `/consignado-contexto`, ele conversa com o designer para separar
fato observado de regra de negocio. Le os manuais-base aplicaveis e nao
pergunta novamente regra documentada. Mostra o rascunho do mapa e uma
proposta de curadoria quando houver regra ausente ou divergente.
Quando Formalizacao tiver confirmacao externa, registra no mapa somente a
presenca, o roteiro de orientacao e o contrato de retorno ao app. O
tutorial, quando existir, e opcional e reencontra o mesmo
direcionamento externo. Quantidade, canais e formato das acoes externas
ficam no manual do contexto; evidencias externas nao viram templates
internos.

Em `/consignado-analise`, ele primeiro fixa o recorte em
`.designops/runs/<rodada>/referencias.json`: pagina e Sections `ref-*`
selecionadas. Arquivos reais podem conter biblioteca, variaveis, templates
e componentes locais. Fora do recorte eles sao ignorados; dentro dele sao
evidencia, nunca permissao para adocao automatica. Ele le somente as
referencias cruas selecionadas, reacoes de
prototipo, documentos aprovados e evidencia IDS. Antes de propor mapa,
varre programaticamente cada Section `ref-*` e todos os descendentes com
`collectPrototypeReactions.js` e `collectReferenceStructure.js`. Grava
o manifesto e a resolucao temporaria de IDs em `.designops/runs/`, sem
prender o documento oficial a IDs do Figma. Entrega uma unica proposta
com inventario, prova de reacoes e estrutura, mapa de jornada, contrato
de tela, mapa IDS, plano de variaveis e proposta de componentes locais.
Rascunhos e previews nao sao evidencia analitica. Se um componente local
conter IDS, registra a composicao local e as instancias IDS descendentes
separadamente. Isso prova a estrutura observada, mas nao promove a
composicao local para reutilizacao.

Depois de validar a analise, o Analista consolida esses rascunhos somente em
`.designops/runs/<rodada>/proposta/` e gera `pacote-analista.json`. O pacote
registra hashes das evidencias, plano de variaveis, componentes, mapa e
contratos, e e a unica entrega que Kora pode reconhecer como pronta para
revisao. Ele nao representa aprovacao, montagem ou permissao para alterar a
biblioteca.

Logo depois de gravar o recorte, o Analista executa
`node scripts/validateAnalysisRound.js --round <rodada> --stage pre-coleta`.
Somente `passed: true` autoriza os coletores. Depois da reconciliacao MCP e
antes de criar mapa, contrato ou pedir aprovacao, executa o mesmo comando
com `--stage pre-proposta`. Sem esse segundo resultado favoravel, mapa e
contrato sao rascunhos invalidos, nao entregas.

Antes da primeira coleta, o Analista redescobre a pagina e as Sections
por `figma-get_metadata` no arquivo atual. IDs obtidos em conversa,
manifesto ou rodada anteriores nao podem ser reutilizados. O manifesto
temporario registra o metodo de descoberta e a pagina retornada. Quando
uma Section pedida nao aparece com o nome exato, a coleta nao e
executada e a lacuna e bloqueante.

As skills de papel do repositorio sao lidas localmente. O MCP do Figma e
usado somente para a skill oficial necessaria a `use_figma`; buscar
`skill://index.json` ou uma skill local por URI do Figma e desvio de
procedimento. Uma rodada nova tambem e isolada: arquivos em
`.designops/runs/<outra-rodada>/` nao entram no contexto sem pedido
explicito de retomada ou comparacao. O Analista le somente documentos e
scripts exigidos pelo escopo; laboratorio tecnico nao autoriza leitura
ampla de manuais de negocio.

Em coleta tecnica isolada, as skills locais obrigatorias sao apenas
`consignado-analise` e `figma-plugin-api`; o Analista tambem le
`AGENTS.md` e o script do coletor pedido. Esse modo nao abre contexto de
negocio, nao le `consignado-contexto` nem `figma-reconstrucao` e entrega
somente fatos tecnicos. Analise completa carrega as quatro skills do
papel e os documentos logicos exigidos pelo recorte.

Em contexto guiado com referencias Figma, o conjunto minimo e
`consignado-contexto`, `consignado-analise` e `figma-plugin-api`.
`figma-reconstrucao` so entra quando o pedido inclui IDS, arvore-alvo ou
fontes de composicao. O relatorio separa `FATO OBSERVADO`, `REGRA
DOCUMENTADA`, `REGRA CONFIRMADA` e `[CONFIRMAR]`: o Figma prova caminho e
estrutura, nunca a origem de uma regra. Assim, `DIRETO`, `ACAO_NO_APP`,
presenca obrigatoria de confirmacao externa e tutorial opcional exigem
documento ou confirmacao humana. Antes de cada chamada `use_figma`, ate
uma leitura subsequente, o historico precisa mostrar a skill oficial do
Figma; se esse par nao estiver auditavel, o resultado e
`NAO_VERIFICAVEL`.

Antes de solicitar aprovacao do texto de contexto, o Analista grava o
rascunho temporario em `.designops/runs/<rodada>/contexto.json` e o valida
com `validateContextDraftCore.js` pelo MCP em leitura. Cada afirmacao tem
uma das quatro classificacoes e a fonte correspondente. A validacao impede
que fato Figma seja promovido como regra de negocio e bloqueia
`APROVADO_PARA_REGISTRO` sem aprovacao humana ou com `[CONFIRMAR]`
bloqueante. Somente depois disso a conversa pode pedir aprovacao para
escrever o mapa da rodada ou propor uma curadoria de base.

Depois da ultima escrita do manifesto temporario, o Analista relê ele e
`referencias.json`, e executa `validateReferenceScopeCore.js`,
`validateAnalysisManifestCore.js` junto de
`reconcileAnalysisManifestFigma.js` pelo MCP do Figma sem mutar o
arquivo. A reconciliacao confronta as contagens, paginacao e reacoes
observadas no manifesto com a pagina e as Sections que existem agora.
Essa e a validacao operacional, inclusive em ambientes que nao permitem
terminal. O core sozinho verifica apenas a forma do objeto; o adaptador
Node existe somente para desenvolvimento local. A reconciliacao nao e
prova criptografica da ordem do chat, por isso o historico ainda precisa
mostrar as coletas unitarias antes da escrita. Falha de leitura ou de
execucao resulta em `NAO_VERIFICAVEL`.

O recibo favoravel da reconciliacao e gravado no manifesto. Ele e exigido
pelo gate `pre-proposta`, junto de `contexto.json`,
`componentes-locais.json` e, somente quando houver contrato dependente de
IDs, `resolvido.json` da mesma rodada.

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

Antes da montagem, a topologia da biblioteca precisa estar registrada como
`APROVADO` em `docs/topologia-biblioteca.md`. Enquanto ela estiver pendente,
o Montador faz somente inventario de leitura e apresenta as alternativas para
decisao humana. Ele nao transforma uma recomendacao em collection, variavel,
binding ou rascunho.

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

A entrega tecnica e `pacote-montagem.json` da rodada, com hashes dos
rascunhos, previews, componentes locais, plano de variaveis aplicado,
evidencias MCP e comprovacao da area `_verificacao-<etapa>`. Somente um
pacote favoravel pode ser entregue ao Validador.

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

O resultado nao e apenas uma resposta narrativa. O Validador entrega
`veredito-validador.json` na pasta da rodada e valida o arquivo antes de
encerrar. O recibo amarra por hash a montagem, os contratos, a resolucao,
as evidencias MCP e a pre-promocao. `APTO_PARA_PROMOCAO` exige provas
favoraveis de criacao, conteudo, modes e layout, revisao visual e
releituras independentes de estrutura e interacoes, com resultado por
template e contexto. Depois da aprovacao humana e da escrita autorizada,
o recibo `pacote-promocao.json` prova a promocao, a releitura final e a
ausencia de contexto no nome dos ativos publicados.

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
