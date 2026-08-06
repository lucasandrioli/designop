# Roteiro de prompts da Kora por etapa, momento e tela

Uma rodada trata uma unica tela selecionada. Etapa e momento sao parametros.
A referencia orienta fidelidade visual e funcional, nunca a arquitetura tecnica.
Use uma skill por mensagem e mantenha o bloco `CONTRATO_LEVE_DA_RODADA` na
conversa. Nao anexe, crie nem consulte arquivo JSON externo. O bloco e interno:
em toda resposta, a skill mostra somente um cartao curto com tela, acao atual,
resultado e proxima acao da pessoa. Nao deve exibir JSON ou checklist tecnico,
salvo explicacao simples de um impasse.

## 0. Abrir a etapa

Envie uma vez por conversa, sem selecionar tela:

```text
Absorva somente este contexto da etapa. Nao analise, busque ou altere o Figma.

ETAPA: <nome>
REGRAS APROVADAS: <fonte ou resumo>

Responda somente: "Contexto da etapa absorvido. Aguardo a tela da rodada."
```

## 1. Inventariar uma tela

Selecione somente a referencia da tela. Envie:

```text
/analista

MODO: INVENTARIAR
ETAPA: <nome>
MOMENTO: <identificador e nome humano>
TELA/TEMPLATE_ALVO: <nome da unica tela selecionada>
FASE: TEMPLATE_PRIMEIRO

Use o contexto da etapa desta conversa. A referencia selecionada e a evidencia
visual e funcional. Registre preservacoes, origem das instancias ou estruturas,
e recibos de busca nas libraries. Nao altere o canvas.
```

## 2. Arquitetar o mapa tecnico

Mantenha somente a mesma referencia selecionada. Envie:

```text
/analista

MODO: ARQUITETAR
ETAPA: <nome>
MOMENTO: <identificador e nome humano>
TELA/TEMPLATE_ALVO: <nome>
FASE: TEMPLATE_PRIMEIRO

Use o inventario desta conversa. Projete um TEMPLATE_ALVO inteiro e fiel,
reutilizando a library quando compativel. Nao componentize toda a tela e nao
proponha componentes locais de library nesta fase. Declare bindings, estilos,
tokens existentes, valores soltos excepcionais, overrides permitidos e impasses.
Nao altere o canvas.
```

## 3. Entregar e aprovar o contrato

```text
/analista

MODO: ENTREGAR_CONTRATO
Use o inventario e o mapa tecnico da mesma tela. Mantenha internamente o bloco
`CONTRATO_LEVE_DA_RODADA`; nao o mostre na resposta. Aguarde aprovacao humana
para montar o TEMPLATE_PRIMEIRO. Nao altere o canvas.
```

Revise o contrato. A montagem somente pode comecar depois de aprovacao humana
explicita para esse template.

## 4. Montar o template inteiro

```text
/montador

APROVACAO HUMANA: TEMPLATE_PRIMEIRO APROVADO
ETAPA: <nome>
MOMENTO: <identificador e nome humano>
TELA/TEMPLATE_ALVO: <nome>
FASE: TEMPLATE_PRIMEIRO
AREA DE DESTINO: <area experimental de verificacao>

Use o ultimo `CONTRATO_LEVE_DA_RODADA` desta conversa. Repita o preflight e os
recibos de busca. Monte uma
nova versao completa da tela. Use a instancia canonica e somente overrides
permitidos; se nao reproduzir a referencia, devolva IMPASSE_TECNICO. Nao
publique, nao altere referencia ou library oficial.
```

## 5. Validar o template primeiro

Selecione simultaneamente e somente duas telas: a referencia e a nova versao
criada pelo Montador. Envie:

```text
/validador

ETAPA: <nome>
MOMENTO: <identificador e nome humano>
TELA/TEMPLATE_ALVO: <nome>
FASE: TEMPLATE_PRIMEIRO

Use o ultimo `CONTRATO_LEVE_DA_RODADA` desta conversa. Primeiro identifique referencia e nova versao. Compare Fidelidade Visual entre
elas; verifique Saude Tecnica somente na nova versao, com evidencia de bindings,
estilos, valores soltos, instancias e excecoes. Se a selecao nao tiver
exatamente essas duas telas identificaveis, pare e peca correcao. Nao altere ou
publique nada.
```

Se ambos forem `APTO`, a pessoa decide encerrar ou aprovar explicitamente a
extracao seletiva de candidatas. Sem essa aprovacao, nenhuma componentizacao
adicional pode comecar.

## 6. Extracao seletiva, somente quando aprovada

Repita os passos 2 a 5 com `FASE: EXTRACAO_SELETIVA`, incluindo a evidencia de
reutilizacao comprovada ou manutencao/variacao independente para cada
candidata. O Montador recompõe nova versao e preserva a anterior; o Validador
verifica as duas. A pessoa aprova a adocao depois dos dois veredictos aptos.

## 7. Revisar impasse

```text
/analista

MODO: REVISAR_IMPASSE
ETAPA: <nome>
MOMENTO: <identificador e nome humano>
TELA/TEMPLATE_ALVO: <nome>
FASE: <fase ativa>

Use somente o IMPASSE_TECNICO desta rodada. Preserve o restante, entregue o
delta e retorne a ENTREGAR_CONTRATO se houver mudanca que exija nova aprovacao.
Nao altere o canvas.
```
