# Mapa de fluxo: <escopo, ex: piloto>

Este documento responde: **quais telas existem em cada convenio, em que
ordem?** E o unico lugar onde mora a composicao do fluxo. Uma etapa que
existe num convenio e nao noutro se resolve AQUI, nunca com variavel
booleana no Figma.

Renomeie o arquivo para `mapa-fluxo-<escopo>.md`.

## Escopo
- Modalidade: <primeira concessao | refinanciamento>
- Caso: <caminho feliz | ramo de excecao: qual>
- Convenios cobertos: <lista>

## Tabela

Uma linha por etapa/tela, uma coluna por convenio. Preencha com:
`sim` (existe), `nao` (nao existe), `opcional` (nivel 2, abre de dentro
de outra), ou `[CONFIRMAR]`.

| # | Etapa / tela | Nivel | <convenio A> | <convenio B> |
| --- | --- | --- | --- | --- |
| 1 | <ex: consentimento> | 1 | sim | nao |
| 2 | <ex: simulacao> | 1 | sim | sim |
| 3 | <ex: detalhe do seguro> | 2 | opcional | nao |

Nivel 1 = etapa obrigatoria do fluxo. Nivel 2 = tela de apoio, abre de
dentro de uma etapa de nivel 1 (detalhe, saiba mais, edicao).

## Ordem
Se a ordem das etapas diverge entre convenios, descreva aqui. A tabela
acima diz o QUE existe; esta secao diz em que SEQUENCIA.

- <convenio A>: 1 -> 2 -> 4
- <convenio B>: 2 -> 3 -> 4

## Divergencias e o porque
Para cada `nao` ou diferenca de ordem, aponte a regra do manual do
convenio que explica. Divergencia sem regra correspondente e
`[CONFIRMAR]`, nunca uma razao inventada.

| Divergencia | Regra que explica |
| --- | --- |
| <ex: consentimento nao existe em A> | <ex: manual do convenio A, regra R1> |

## Historico
- <data>: <o que mudou e por que>
