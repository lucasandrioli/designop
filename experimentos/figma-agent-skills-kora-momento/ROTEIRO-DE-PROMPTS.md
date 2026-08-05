# Roteiro de prompts por momento

Use uma skill por mensagem. O contexto de negocio entra nos prompts, nunca nas
skills. Uma rodada corresponde a um momento completo: inventario, arquitetura,
montagem, validacao e decisao humana.

## 0. Abrir a etapa, somente na primeira rodada do chat

Envie sem selecionar telas e sem chamar skill:

```text
Vamos trabalhar na etapa abaixo. Absorva este contexto para esta conversa.
Nao analise telas, nao procure referencias, nao crie nada e nao faca perguntas.

ETAPA: <nome>
OBJETIVO DA ETAPA: <o que a etapa resolve para a pessoa>
MODALIDADES EM QUE EXISTE: <lista>
CONTEXTOS APLICAVEIS: <lista>
REGRAS APROVADAS DA ETAPA:
<cole aqui o panorama de negocio e as regras dos manuais aplicaveis>

Esta conversa sera conduzida por momentos. Em cada momento, eu selecionarei
somente as telas de referencia daquele recorte.

Responda somente: "Contexto da etapa absorvido. Aguardo o primeiro momento."
```

Guarde a resposta no chat como `CARTAO DE CONTEXTO DA ETAPA`.

## 1. Abrir e inventariar um momento

Selecione somente os frames de referencia do momento. Envie:

```text
/analista

MODO: INVENTARIAR
Use o CARTAO DE CONTEXTO DA ETAPA desta conversa.

MOMENTO: <nome humano>
SIGNIFICADO DO MOMENTO: <o que acontece para a pessoa>
MODALIDADES OU RECORTE: <lista>
TELAS DECLARADAS:
- <nome>: PRINCIPAL
- <nome>: DETALHE, aberta por <principal>
- <nome>: AUXILIAR, aberta por <principal ou detalhe>

Os frames atualmente selecionados sao a unica evidencia visual deste momento.
Voce pode consultar a biblioteca conectada somente para identificar a origem
tecnica de elementos desses frames. Nao altere o canvas.
```

## 2. Arquitetar o contrato, sem escrever

Mantenha selecionadas somente as referencias do mesmo momento. Envie:

```text
/analista

MODO: ARQUITETAR
Use o inventario e o CARTAO DE CONTEXTO DA ETAPA desta conversa.
Trabalhe somente o momento ativo. Entregue o contrato de arquitetura completo,
com arvore de composicao, componentes e bibliotecas, matriz de tokens e
bindings, plano de variaveis, composicoes locais, nucleo comum, diferencas por
modalidade e preflight exigido. Nao altere o canvas.
```

Revise o contrato. A montagem so pode comecar depois de aprovacao humana
explicita.

## 3. Aprovar, conferir e montar

Declare a area de verificacao em que o rascunho pode ser criado. Envie:

```text
/montador

APROVACAO HUMANA: MONTAGEM APROVADA
Use o contrato de arquitetura aprovado nesta conversa.
MOMENTO ATIVO: <nome>
UNIDADE DE MONTAGEM: <tela ou recorte aprovado>
MODALIDADE DE EXECUCAO: <preencha se o asset for de uma modalidade>
AREA DE DESTINO: <nome da Section ou area de verificacao>
NOME DO RASCUNHO: <nome aprovado>

Faca o preflight tecnico de todos os componentes, variantes, tokens, variaveis
e bindings. Se todos forem confirmados, monte o rascunho nesta mesma chamada.
Se houver divergencia, nao altere o canvas e devolva IMPASSE_TECNICO.
```

## 4. Revisar um impasse tecnico

Use somente quando o Montador devolver `IMPASSE_TECNICO`. Mantenha selecionadas
as referencias e, se necessario, o item tecnico declarado no contrato. Envie:

```text
/analista

MODO: REVISAR_IMPASSE
Use o contrato aprovado e o IMPASSE_TECNICO desta conversa.
Reavalie somente o item afetado. Preserve o restante do contrato e devolva um
delta claro para nova aprovacao ou uma decisao humana indispensavel. Nao altere
o canvas.
```

Se o delta mudar a arquitetura, aprove-o explicitamente e retorne ao passo 3.

## 5. Validar o rascunho

Selecione os frames de referencia e o rascunho daquele mesmo momento. Envie:

```text
/validador

Use o contrato de arquitetura aprovado e o relatorio de preflight e montagem
desta conversa.
MOMENTO ATIVO: <nome>

Os frames selecionados incluem as referencias e o rascunho a verificar. Releia
o Figma, compare composicao, componentes, tokens, variaveis e bindings com o
contrato. Classifique qualquer divergencia para o Montador ou para o Analista.
Nao corrija, nao publique e nao altere o canvas.
```

Somente depois de `APTO PARA DECISAO DE PUBLICACAO` a pessoa decide como
publicar o rascunho conforme a governanca da biblioteca.

## 6. Abrir o proximo momento no mesmo chat

Troque a selecao pelos frames do novo momento e repita o prompt **1**. O
contexto da etapa permanece no chat; nao leve fatos visuais do momento anterior
para o novo recorte.

## Novo chat

Se abrir uma conversa nova, repita primeiro o prompt **0**. Em seguida, abra
o momento desejado pelo prompt **1**.
