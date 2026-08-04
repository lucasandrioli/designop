# Contratos executaveis

Os documentos oficiais usam nomes logicos estaveis. Node IDs pertencem
somente a `.designops/runs/<rodada>/resolvido.json` e nunca a este
contrato, ao mapa ou aos manuais.

## Contrato de tela

Crie `docs/contratos/<modalidade>-<etapa>-<tela>.json` conforme
`tela.schema.json`.

Ele declara:

- viewport, rolagem e filhos fixos;
- papeis semanticos e sua origem (`IDS`, `COMPONENTE_LOCAL` ou
  `LOCAL_LAYOUT`);
- bindings de conteudo esperados;
- interacoes `ON_CLICK` ou `AFTER_TIMEOUT`, com destino `NODE`, `URL`,
  `BACK` ou `CLOSE`;
- evidencia aprovada para componentes locais.

Um contrato de tela descreve a arvore-alvo. Ele nao copia a arvore da
referencia e nao recebe `contexto-id` no nome de template, variavel ou
componente.

## Contrato de jornada

Crie `docs/contratos/<modalidade>-jornada.json` conforme
`jornada.schema.json`.

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

## Resolucao temporaria

O Analista grava `.designops/runs/<rodada>/resolvido.json` conforme
`resolucao.schema.json`. O arquivo associa os IDs logicos aprovados aos
node IDs atuais de referencias, previews e Sections de jornada.

O Validador reconstroi a evidencia no Figma e reprova quando a
resolucao temporaria nao corresponde mais ao arquivo.

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

Em operacao sem terminal, a validacao do manifesto usa a funcao pura em
`scripts/validateAnalysisManifestCore.js`, colada com o objeto do
manifesto em uma chamada MCP somente de leitura. O adaptador Node tem o
mesmo resultado, mas serve apenas para desenvolvimento local.
