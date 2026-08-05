# Prompts: Formalizacao

## Contexto da etapa

```text
Vamos trabalhar na etapa de Formalizacao do credito consignado. Apenas absorva
este contexto para esta conversa. Nao analise frames, nao procure telas, nao
crie nada e nao faca perguntas neste momento.

Formalizacao e a etapa em que a pessoa confirma as condicoes da operacao e
conclui a contratacao. Ela pode envolver informacoes importantes, anuencias,
detalhes do contrato, senha para a formalizacao interna e, quando aplicavel,
formalizacao externa.

Na formalizacao externa, a pessoa pode precisar seguir para um site ou
aplicativo externo. Depois da senha, a jornada explica o que deve ser feito e
pode oferecer um tutorial opcional. O retorno ao app pode ser direto ou pode
exigir uma acao adicional dentro do app, conforme o contexto.

Produtos opcionais escolhidos antes da Formalizacao continuam aparecendo
somente quando tiverem sido selecionados. A etapa termina com a efetivacao da
operacao, seu acompanhamento e os proximos passos.

Vamos trabalhar por momentos. Em cada momento, eu vou selecionar somente as
telas de referencia daquele recorte. Nao use uma tela para inventar regra de
negocio e nao misture fatos de um momento com outro.

Nesta abertura, nao preciso de analise, sugestao, decisao, pergunta ou acao no
canvas. Responda somente: "Contexto da etapa de Formalizacao absorvido. Aguardo
o primeiro momento."
```

## Autorizacao de debito em conta

Selecione somente a tela principal e a tela de mais detalhes desse momento.

```text
/analista

MODO: INVENTARIAR

Agora vamos trabalhar o momento 4790, Autorizacao de debito em conta, dentro
da etapa de Formalizacao.

Este momento garante que a pessoa esteja ciente de que autoriza o debito das
parcelas do credito consignado em outras contas, caso o desconto no salario
nao seja possivel.

Esse momento e obrigatorio quando a operacao exige essa garantia: sem ele, a
contratacao nao pode ser concluida. Ele nao pertence a uma modalidade
especifica. Pode aparecer em nova concessao, refinanciamento, portabilidade
com refin de ataque e portabilidade com refin de retencao, sempre que a
operacao exigir a autorizacao de debito em outras contas.

Ele tem duas telas:

- Autorizacao de debito em conta: tela principal.
- Mais detalhes sobre autorizacao de debito: tela secundaria, aberta pela tela
  principal.

Na tela principal, a pessoa ve as contas e precisa dar tres aceites. Cada
aceite possui estado selecionado e nao selecionado. A tela de mais detalhes
explica por que essa autorizacao e necessaria.

Trate 4790 como um momento unico e transversal da jornada. Nao o classifique
como tela de PCon ou de Refin e nao crie diferencas por modalidade sem que elas
aparecam nas referencias ou sejam declaradas por mim. Mais adiante, quando
falarmos de templates e variaveis, identifique o que e comum a 4790 e deixe
separado somente o que realmente variar por modalidade.

Leia somente os frames atualmente selecionados. Inventarie os textos reais, as
contas, os tres aceites, os estados dos checkboxes e a acao de abrir detalhes.
Nao invente texto legal, contas, comportamentos ou regras que nao estejam neste
contexto ou nas telas. Nao altere o canvas.
```

## Arquitetar a 4790

Mantenha selecionadas somente as duas telas de referencia. Envie:

```text
/analista

MODO: ARQUITETAR
Use o inventario da 4790 e o contexto de Formalizacao desta conversa.

Produza o contrato de arquitetura de montagem para as duas telas. Primeiro,
defina o nucleo comum da 4790. Depois, separe apenas diferencas reais que as
referencias ou eu tiver declarado. Nao gere PCon/4790, Refin/4790 ou outra
variacao apenas por convencao de nome.

O mapa de entregaveis desta rodada tem obrigatoriamente dois TEMPLATE_ALVO:

- Autorizacao de debito em conta: template da tela principal.
- Mais detalhes sobre autorizacao de debito: template da tela secundaria.

Crie um rascunho previsto e um nome logico de template para cada um. Esses sao
os dois templates que o Montador devera criar. Componentes locais, se existirem,
sao somente blocos internos: nao substituem, reduzem ou aumentam a quantidade
de templates. Um componente local visto na referencia nao e automaticamente
reutilizavel; decida entre reutilizar existente, criar componente local, local
layout interno (`LOCAL_LAYOUT_INTERNO`) ou pendencia de preflight.

Para cada tela, declare a arvore de composicao, os componentes e bibliotecas,
a matriz de tokens e bindings, o plano de variaveis e o que e local-layout ou
candidato a componente local. Quando uma instancia por modalidade for
necessaria para montar um template, explicite essa instancia sem transformar o
momento em uma modalidade. As referencias podem nao ter binding algum: isso e
divida tecnica, nao modelo para copia. Projete os dois templates como COMPONENT
ou COMPONENT_SET, com textos vinculados a variaveis e espacamentos, cores,
tipografia, raios e demais propriedades tokenizaveis ligados a tokens ou estilos
semanticos. Antes de propor `CRIAR`, procure nas bibliotecas instaladas os
componentes, variantes, propriedades de binding, tokens, estilos, variaveis,
collections e modos ja disponiveis. Nao altere o canvas.
```

## Montar a 4790 aprovada

Use somente depois de aprovar o contrato de arquitetura e definir o alvo de
montagem. Envie:

```text
/montador

APROVACAO HUMANA: MONTAGEM APROVADA
MOMENTO ATIVO: 4790, Autorizacao de debito em conta
MODALIDADE DE EXECUCAO: <preencha somente se o template exigir uma instancia>
AREA DE DESTINO: <area de verificacao>

Use o contrato de arquitetura aprovado nesta conversa. Confirme no preflight
os componentes, tokens, variaveis, bindings e os dois TEMPLATE_ALVO. Se todos
existirem e puderem ser aplicados como declarados, crie os dois rascunhos nesta
chamada como componentes e aplique os bindings, tokens, estilos e variantes do
contrato. Crie os itens tecnicos que o contrato marcar como `CRIAR`; nao copie
as ausencias tecnicas das referencias. Antes de criar, procure e use os recursos
das bibliotecas instaladas, inclusive propriedades de binding. Se algum item
divergir, nao altere o canvas e devolva IMPASSE_TECNICO.
```

## Revisar impasse da 4790

Use somente se o Montador devolver `IMPASSE_TECNICO`. Envie:

```text
/analista

MODO: REVISAR_IMPASSE
Reavalie somente o item da 4790 apontado no IMPASSE_TECNICO desta conversa.
Preserve o restante do contrato, devolva o delta de arquitetura e nao altere o
canvas.
```

## Validar a 4790

Selecione as duas referencias e os dois rascunhos da 4790. Envie:

```text
/validador

MOMENTO ATIVO: 4790, Autorizacao de debito em conta
Use o contrato de arquitetura aprovado e o relatorio de preflight e montagem.
Compare a referencia e o rascunho, incluindo composicao, componentes, tokens,
variaveis e bindings. Verifique que existem dois templates em COMPONENT ou
COMPONENT_SET, que os textos estao vinculados e que propriedades tokenizaveis
nao ficaram em valor bruto. Se houver divergencia, encaminhe-a ao Montador ou
ao Analista. Nao corrija, nao publique e nao altere o canvas.
```
