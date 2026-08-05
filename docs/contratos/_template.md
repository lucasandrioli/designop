# Contratos executaveis

Os documentos oficiais usam nomes logicos estaveis. Node IDs pertencem
somente a `.designops/runs/<rodada>/resolvido.json` e nunca a este
contrato, ao mapa ou aos manuais.

## Contrato de tela

Crie `docs/contratos/<modalidade>-<etapa>-<tela>.json` conforme
`tela.schema.json`.

Ele declara:

- viewport, rolagem e filhos fixos;
- papeis semanticos e sua origem (`IDS`, `COMPONENTE_LOCAL`,
  `LOCAL_LAYOUT`, `TEXTO` ou `ASSET`);
- Slots nativos declarados por papel hospedeiro IDS, nome do Slot,
  propriedade publica `SLOT` e papeis de conteudo; nunca registrar node IDs;
- tipografia de cada papel textual como `UNICO` ou `MISTO`, com origem
  `IDS_STYLE`, `IDS_COMPONENT` ou `LOCAL_APPROVED`;
- bindings de conteudo esperados;
- interacoes `ON_CLICK` ou `AFTER_TIMEOUT`, com destino `NODE`, `URL`,
  `BACK` ou `CLOSE`;
- evidencia aprovada para componentes locais.

Um contrato de tela descreve a arvore-alvo. Ele nao copia a arvore da
referencia e nao recebe `contexto-id` no nome de template, variavel ou
componente.

`tela.schemaVersion: 2` e obrigatorio para rodada nova. Contrato v1 e
legado: pode ser lido, mas nao e interpretado para montagem ou promocao sem
migracao explicita. A migracao nao inventa Slots, estilo tipografico nem
aprovacao humana. O script marca o resultado como
`PENDENTE_REVISAO_HUMANA`; a rodada so prossegue depois de declarar
`REVISAO_HUMANA_CONCLUIDA` com `approvalId`.

## Contrato de momento

Uma rodada por momento usa `escopo-momento.json` como recorte humano imutavel,
`proposta/matriz-variacoes.json` para comparar cada modalidade, e
`proposta/contrato-momento.json` para registrar telas, cobertura e conexoes
observadas. Cada superficie presente recebe contrato de tela proprio; detalhe
ou auxiliar nao e fundido ao template principal. Apenas diferencas de conteudo
podem entrar no plano de variaveis. Estrutura e comportamento viram
especializacao, conexao ou decisao humana.

## Contrato de jornada

Crie `docs/contratos/<modalidade>-jornada.json` conforme
`jornada.schema.json`.

Esse contrato e preparado na rodada posterior de composicao da etapa, nao e
pre-requisito para aprovar um momento isolado.

Ele declara a collection de conteudo, os contexts/modes e, para cada
contexto, quais telas estao presentes ou ausentes. Ausencia e uma
selecao `presente: false`, sem template escondido por variavel.

Quando uma etapa contem confirmacao externa, o contrato usa
`composicoesInternas` para declarar a presenca por contexto e o contrato
de retorno: `DIRETO` ou `ACAO_NO_APP`. Tambem declara o roteiro de
orientacao: `DIRETA` ou `DIRETA_COM_TUTORIAL_OPCIONAL`. O tutorial e
uma rota de ajuda que retorna ao mesmo direcionamento externo. O contrato nao registra nem
deduz a quantidade de acoes fora do app. Essa quantidade pertence ao
manual de contexto e as evidencias de referencia.

## Plano de componentes locais

Crie `.designops/runs/<rodada>/componentes-locais.json` conforme
`componentes-locais.schema.json`, mesmo quando a lista `componentes` estiver
vazia. Ele e a decisao explicita da rodada: documenta quais componentes
locais foram aprovados, suas duas reutilizacoes previstas e os contextos
conhecidos que nao podem aparecer em nomes ou carimbos.

Um papel com origem `COMPONENTE_LOCAL` no contrato de tela precisa apontar
para um `componentId` presente nesse plano. Sem plano aprovado, a composicao
fica como `LOCAL_LAYOUT`.

## Rascunho temporario de contexto

Antes de pedir aprovacao para criar documentos oficiais, o Analista grava
`.designops/runs/<rodada>/contexto.json` conforme
`contexto-rodada.schema.json`. Ele nao e documento oficial e registra cada
afirmacao com escopo, classificacao e fonte.

As classificacoes permitidas sao `FATO_OBSERVADO`, `REGRA_DOCUMENTADA`,
`REGRA_CONFIRMADA` e `CONFIRMAR`. Fato observado exige Section Figma de
origem e nao pode declarar regra de negocio, presenca obrigatoria, roteiro
de orientacao ou retorno `DIRETO`/`ACAO_NO_APP`. Esses valores exigem
documento, confirmacao humana ou `[CONFIRMAR]`.

Em ambiente sem terminal, o Analista le o arquivo recem-gravado e executa
`validateContextDraftCore.js` com o objeto em `use_figma` somente de
leitura. Somente um rascunho aprovado pelo core pode ser mostrado para
aprovacao humana; `APROVADO_PARA_REGISTRO` exige registro dessa aprovacao e
nenhuma lacuna bloqueante.

`contexto.json` declara tambem `rodada`, igual ao identificador do diretorio
que o contem. O plano `componentes-locais.json` declara o mesmo campo. Isso
permite ao gate impedir mistura acidental de artefatos de rodadas distintas.

## Resolucao temporaria

Quando a proposta temporaria tiver contrato que dependa de IDs logicos, o
Analista grava `.designops/runs/<rodada>/resolvido.json` conforme
`resolucao.schema.json`. O arquivo associa os IDs logicos aprovados aos
node IDs atuais de referencias, previews e Sections de jornada. Uma leitura
que ainda nao declarou contrato dependente de IDs nao cria esse arquivo.

O Validador reconstroi a evidencia no Figma e reprova quando a
resolucao temporaria nao corresponde mais ao arquivo.

## Recorte temporario de referencias

Antes das coletas, o Analista cria
`.designops/runs/<rodada>/referencias.json` conforme
`referencias-rodada.schema.json`. Ele fixa a pagina e as Sections `ref-*`
que sao evidencia da rodada. O arquivo pode conter componentes locais,
variaveis, templates e biblioteca pre-existentes. Fora do recorte eles sao
ignorados; dentro dele sao classificados como evidencia, nunca adotados de
forma automatica.

No manifesto, cada ativo relevante recebe `tipoEncontrado` e `decisao`.
Uma composicao local com IDS interno registra a propria composicao e todas
as instancias IDS descendentes com suas `componentKey`. Isso permite
reconstruir a tela com IDS quando aplicavel sem tratar o componente local
original como ativo aprovado.

## Evidencia MCP de Slots e tipografia

Depois da escrita, o Montador e o Validador registram
`.designops/runs/<rodada>/evidencias-mcp.json` conforme
`evidencias-mcp.schema.json`. Cada evidencia repete o `roundId`, IDs reais
do host, Slot e conteudo ou dos textos examinados, `writtenAt`, `readAt` e o
relatorio literal do validador MCP. A evidencia de Slot tambem registra key
completa da property publica `SLOT`, biblioteca e `limitViolations`.
O arquivo tambem registra `referencesConsulted`: referencia oficial,
motivo e simbolos de API consultados. `figma-use` entra em toda chamada
MCP; gotchas, patterns, indice e `.d.ts` so entram quando a operacao os
exigiu. Isso e evidencia declarada, nao prova automatica de leitura.

`readAt` posterior a `writtenAt` demonstra a sequencia declarada. A ligacao
entre aquela releitura e os nos e demonstrada pelo relatorio literal, que
repete o mesmo `roundId` e os mesmos IDs. Se nao for possivel reler o Figma,
registre `NAO_VERIFICAVEL`; nunca marque a correcao como concluida apenas
porque a nova escrita nao devolveu erro.

## Criterios tecnicos de uma rodada

Uma regra tecnica temporaria deve declarar explicitamente a quais
Sections de referencia ela se aplica. O relatorio registra esse escopo e
um dos quatro resultados: `ATENDIDA`, `VIOLADA`, `NAO_APLICAVEL` ou
`NAO_VERIFICAVEL`.

Por exemplo, a exigencia de instancia remota so pode ser cobrada de uma
Section que o contrato da rodada declarou como composicao IDS. A falta
dessa declaracao nao e violacao. Ela exige `NAO_APLICAVEL` ou
`NAO_VERIFICAVEL`, conforme exista ou nao evidencia suficiente para
definir o escopo.

O manifesto tambem lista cada coleta de forma unitaria: um coletor, uma
Section e uma parte por execucao. Ele nao aceita uma chamada combinada
que esconda quais partes foram realmente lidas.

Antes dessas execucoes, o Analista descobre novamente a pagina e as
Sections no arquivo atual por `figma-get_metadata`. IDs de conversas ou
rodadas anteriores nao sao entrada valida para coleta. O manifesto
registra essa descoberta em `fontes.figma.descoberta`.

Em operacao sem terminal, a verificacao final usa
`scripts/validateReferenceScopeCore.js`,
`scripts/validateAnalysisManifestCore.js` junto de
`scripts/reconcileAnalysisManifestFigma.js`, colados com o objeto do
manifesto em uma chamada MCP somente de leitura. A reconciliacao compara
o objeto com o Figma atual e precisa retornar `passed: true`; o core
sozinho verifica apenas a forma do manifesto. O adaptador Node tem o
mesmo resultado estrutural, mas serve apenas para desenvolvimento local.

O gate local `scripts/validateAnalysisRound.js` une o recorte e os artefatos
temporarios: `--stage pre-coleta` valida o recorte antes do Figma e
`--stage pre-proposta` exige manifesto, contexto, plano de componentes,
recibo declarativo da reconciliacao MCP e resolucao apenas quando a proposta
declarou dependencia de IDs. Esse recibo registra o resultado literal
favoravel, mas nao substitui a auditoria do historico MCP.
