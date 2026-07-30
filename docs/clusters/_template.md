# Manual do convenio: <nome do cluster>

Este documento descreve a JORNADA deste convenio e as regras locais que
justificam suas diferencas. Ele nao descreve telas nem redefine etapas:
uma etapa existe uma unica vez em `docs/etapas/<etapa>.md`.

## Identificacao
- Cluster: <id, ex: c4>
- Mode no contexto da etapa: <ex: c4-federais>
- Orgao/convenio: <nome>
- Modalidades ativas: <primeira concessao | refinanciamento | ambas>
- Mapa de fluxo: `docs/mapa-fluxo-<escopo>.md`

## Jornada por etapa

Esta tabela responde somente se o convenio usa a etapa. Ordem, casos de
uso e template selecionado pertencem ao mapa de fluxo.

| Etapa | Usa? | Regra local que explica | Documento da etapa |
| --- | --- | --- | --- |
| <ex: anuencia> | <sim ou nao> | <R1 ou n/a> | `docs/etapas/<etapa>.md` |

## Regras locais por etapa

Formato: voce preenche somente (1) o que e verdade neste convenio e
(2) a origem. O Analista propoe o mecanismo olhando as telas e a
regra. Nao descreva texto, item de tela, visibilidade, property ou
template neste manual.

### R1. <titulo curto>
- Etapa: `<slug>`
- Regra: <o que e verdade neste convenio>
- Origem: <convenio | regulacao | decisao de produto | restricao tecnica>
- Status: [ATIVA | EM REVISAO | REVOGADA em <data>]

### R2. ...

## Implementacao aprovada (preenchido pelo Montador)

Esta secao nasce da proposta aprovada do Analista. Nao preencha
antes da analise.

| Regra | Mecanismo aplicado | Evidencia no Figma |
| --- | --- | --- |
| <R1> | <variavel, property, variant, mapa ou especializacao> | <componente, node ID, data> |

## Regras que nao se aplicam aqui

<regras de etapas usadas por outros clusters e deliberadamente ausentes
neste. Isso evita que alguem trate a ausencia como esquecimento.>

## Historico
- <data>: <o que mudou e por que>
