# Exemplo de primeira rodada: Formalizacao, momento 4790

Este arquivo e apenas um exemplo preenchido do roteiro generico. Formalizacao
e 4790 nao sao nomes, regras ou valores obrigatorios das skills. A rodada
seleciona uma tela por vez. A tela com checkbox abaixo e a primeira tela deste
exemplo; a tela de detalhes deve abrir outra rodada.

## Contexto da etapa

```text
Vamos trabalhar na etapa de Formalizacao do credito consignado. Apenas absorva
este contexto. Nao analise, busque ou altere o Figma.

Formalizacao conclui a contratacao e pode envolver informacoes importantes,
anuencias, detalhes do contrato, senha e, quando aplicavel, confirmacao externa.
O retorno ao app depende de regra documentada ou confirmacao humana.

Responda somente: "Contexto da etapa de Formalizacao absorvido. Aguardo a tela da rodada."
```

## Inventariar a tela com checkbox

Selecione somente a referencia `Autorizacao de debito em conta`. Envie:

```text
/analista

MODO: INVENTARIAR
ETAPA: Formalizacao
MOMENTO: 4790, Autorizacao de debito em conta
TELA/TEMPLATE_ALVO: Autorizacao de debito em conta
FASE: TEMPLATE_PRIMEIRO

Esta tela mostra contas e tres aceites. Cada aceite tem estados selecionado e
nao selecionado; a acao de detalhes leva a outra tela, fora desta rodada.
Inventarie somente o frame selecionado, incluindo os checkboxes. Registre fatos
visuais/funcionais, preservacoes e recibos de busca na library. Nao invente
texto legal, conta ou regra e nao altere o canvas.
```

## Arquitetar e entregar contrato

Mantenha somente a mesma tela selecionada. Envie primeiro:

```text
/analista

MODO: ARQUITETAR
ETAPA: Formalizacao
MOMENTO: 4790, Autorizacao de debito em conta
TELA/TEMPLATE_ALVO: Autorizacao de debito em conta
FASE: TEMPLATE_PRIMEIRO

Projete um template inteiro, semanticamente correto e visualmente fiel. Use o
checkbox e card selecionado via instancia/configuracao quando isso for
suficiente; nao replique variantes do legado por espelho. Nao componentize
blocos internos por padrao. Reutilize tokens de cor, estilos e variaveis
existentes, criando variaveis somente para valores parametrizaveis. Nao altere
o canvas.
```

Depois, envie:

```text
/analista

MODO: ENTREGAR_CONTRATO
Consolide o contrato leve dessa unica tela no bloco `CONTRATO_LEVE_DA_RODADA`
da conversa. Nao use arquivo JSON externo. Aguarde aprovacao humana para montar
TEMPLATE_PRIMEIRO. Nao altere o canvas.
```

## Montar e validar

Depois de aprovar o contrato, envie:

```text
/montador

APROVACAO HUMANA: TEMPLATE_PRIMEIRO APROVADO
ETAPA: Formalizacao
MOMENTO: 4790, Autorizacao de debito em conta
TELA/TEMPLATE_ALVO: Autorizacao de debito em conta
FASE: TEMPLATE_PRIMEIRO
AREA DE DESTINO: <area experimental de verificacao>

Use o ultimo `CONTRATO_LEVE_DA_RODADA` desta conversa. Repita o preflight. Monte uma nova versao completa sem publicar, alterar a
referencia ou a library oficial. Se uma instancia canonica com overrides
permitidos nao reproduzir a referencia, devolva IMPASSE_TECNICO.
```

Selecione simultaneamente e somente a referencia e a nova versao criada pelo
Montador e envie:

```text
/validador

ETAPA: Formalizacao
MOMENTO: 4790, Autorizacao de debito em conta
TELA/TEMPLATE_ALVO: Autorizacao de debito em conta
FASE: TEMPLATE_PRIMEIRO

Use o ultimo `CONTRATO_LEVE_DA_RODADA` desta conversa. Identifique os dois papeis. Compare Fidelidade Visual entre referencia e nova
versao; verifique Saude Tecnica somente na nova versao, com evidencia de
bindings, estilos, valores soltos, instancias e excecoes. Se houver uma selecao,
mais de duas ou papeis ambiguos, pare e peca correcao. Nao corrija nem publique.
Se ambos forem aptos, aguarde nova aprovacao humana antes de qualquer extracao
seletiva.
```
