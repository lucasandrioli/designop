# Roteiro de prompts por momento

Use uma skill por mensagem. O contexto de negocio entra nos prompts, nunca nas
skills. Uma rodada corresponde a um momento completo: analise, montagem,
validacao e decisao humana.

## 0. Abrir a etapa, somente na primeira rodada do chat

Envie sem selecionar telas e sem chamar skill:

```text
Vamos trabalhar na etapa abaixo. Este e o contexto estavel desta conversa.

ETAPA: <nome>
OBJETIVO DA ETAPA: <o que a etapa resolve para a pessoa>
MODALIDADES EM QUE EXISTE: <lista>
CONTEXTOS APLICAVEIS: <lista>
REGRAS APROVADAS DA ETAPA:
<cole aqui o panorama de negocio e as regras dos manuais aplicaveis>

Esta conversa sera conduzida por momentos. Nao analise telas, nao crie nada e
nao procure referencias agora. Apenas confirme o entendimento do contexto da
etapa e apresente, em no maximo tres pontos, somente lacunas de regra que
impediriam trabalhar um momento futuro.
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
MODALIDADES: <lista do momento>
TELAS DECLARADAS:
- <nome>: PRINCIPAL
- <nome>: DETALHE, aberta por <principal>
- <nome>: AUXILIAR, aberta por <principal ou detalhe>

Os frames atualmente selecionados sao a unica evidencia visual deste momento.
Nao leia telas de outros momentos e nao altere o canvas.
```

## 2. Propor o contrato, sem escrever

Mantenha selecionadas somente as referencias do mesmo momento. Envie:

```text
/analista

MODO: PROPOR
Use o inventario e o CARTAO DE CONTEXTO DA ETAPA desta conversa.
Trabalhe somente o momento ativo. Mostre o contrato para montagem, as
diferencas por modalidade e o que precisa de confirmacao. Nao altere nada no
canvas.
```

Revise a proposta. Se precisar ajustar uma regra, responda no chat e rode este
mesmo prompt novamente. Se aprovar, siga para a montagem.

## 3. Aprovar e montar

Declare a area de verificacao em que o rascunho pode ser criado. Envie:

```text
/montador

APROVACAO HUMANA: MONTAGEM APROVADA
Use o contrato para montagem aprovado nesta conversa.
MOMENTO ATIVO: <nome>
MODALIDADE: <nome>
AREA DE DESTINO: <nome da Section ou area de verificacao>
NOME DO RASCUNHO: <nome aprovado>

Monte somente o que o contrato declara. Nao copie referencias, nao altere a
biblioteca conectada e nao publique nada.
```

## 4. Validar o rascunho

Selecione os frames de referencia e o rascunho daquele mesmo momento. Envie:

```text
/validador

Use o contrato aprovado e o pacote de montagem desta conversa.
MOMENTO ATIVO: <nome>
MODALIDADE: <nome>

Os frames selecionados incluem as referencias e o rascunho a verificar. Releia
o Figma, compare com o contrato e entregue um veredito. Nao corrija, nao
publique e nao altere o canvas.
```

Somente depois de `APTO PARA DECISAO DE PUBLICACAO` a pessoa decide como
publicar o rascunho conforme a governanca da biblioteca.

## 5. Abrir o proximo momento no mesmo chat

Troque a selecao pelos frames do novo momento e repita o prompt **1**. O
contexto da etapa permanece no chat; nao leve fatos visuais do momento anterior
para o novo recorte.

## Novo chat

Se abrir uma conversa nova, repita primeiro o prompt **0**. Em seguida, abra
o momento desejado pelo prompt **1**.
