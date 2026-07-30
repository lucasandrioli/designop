# Ciclo visual no Figma

Este documento responde a uma pergunta simples: quando cada agente
trabalha, o que muda na tela que o designer enxerga?

## Antes dos agentes

O designer cria a pagina da etapa, por exemplo `Anuencia`, com duas
coisas apenas:

```text
_ref-gov-sp       referencias e prototipo do Gov SP
_ref-cluster-4    referencias e prototipo do Cluster 4
_templates        vazia no inicio
```

As referencias sao o caminho que existe hoje. O prototipo que voce
ligou nelas e a unica fonte da ordem, dos retornos e dos canais
externos daquela etapa.

## O que acontece em cada fase

| Fase | Quem trabalha | O que ele faz | O que aparece no Figma ao fim |
| --- | --- | --- | --- |
| 1 | Analista da Etapa | inventaria, compara e propoe a parte compartilhada, especializacoes, arvore-alvo, IDS e geometria | nada novo |
| 2 | Designer | aprova ou pede ajuste na proposta unica | nada novo |
| 3 | Montador | registra o contrato aprovado, constroi a arvore-alvo e troca os modes para conferir os clusters | so a pagina `_verificacao-<etapa>` ganha rascunhos e previews |
| 4 | Validador | prova contrato, geometria, IDS e resultado visivel contra as referencias | nada novo |
| 5 | Montador | promove o que passou | o componente sai do rascunho e entra em `_templates`; previews da rodada sao removidos |

O comando do Aprendiz pode registrar uma receita em `docs/receitas/`
depois de uma tela humana. Ele nao cria objeto no Figma.

## O que cada pagina significa

| Onde | O que pode existir | O que nao pode existir |
| --- | --- | --- |
| `Anuencia` | referencias cruas, prototipos de referencia, `_templates` aprovados | rascunhos, previews, screenshots de teste, fluxo duplicado |
| `_verificacao-anuencia` | `_rascunho-*` e previews por cluster, sem conexoes | referencia crua, template aprovado, jornada de apresentacao |
| `Fluxos` | jornada completa com instancias de `tpl-*` aprovados | rascunho, preview, referencia crua, evidencia externa |

## Quando usar Fluxos

Nao use `Fluxos` para testar uma etapa isolada. O seu prototipo de
referencia ja faz isso.

Use `Fluxos` somente quando quiser mostrar uma jornada maior, por
exemplo `Simulacao -> Formalizacao -> Anuencia -> Efetivacao`, e todas
as telas dessa jornada ja tiverem templates aprovados. A montagem e um
pedido separado ao Montador: ela nao acontece durante a criacao de uma
etapa.
