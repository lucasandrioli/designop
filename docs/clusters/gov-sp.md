# Manual do convenio: gov-sp

Este documento descreve a jornada deste convenio e as regras locais que
justificam suas diferencas. Ele nao redefine a etapa.

## Identificacao
- Cluster: `gov-sp`
- Mode no contexto da etapa: `Gov SP`
- Orgao/convenio: Governo de Sao Paulo
- Modalidades ativas: primeira concessao, refinanciamento e portabilidade de saldo
- Mapa de fluxo: `docs/mapa-fluxo-anuencia-piloto.md`

## Jornada por etapa

| Etapa | Usa? | Regra local que explica | Documento da etapa |
| --- | --- | --- | --- |
| anuencia | sim | R1, R2 | `docs/etapas/anuencia.md` |

## Regras locais por etapa

### R1. Validacao externa do gov-sp
- Etapa: `anuencia`
- Regra: no fluxo atual, apos o direcionamento externo, ha 2 validacoes externas exigidas pelo convenio.
- Origem: decisao do orgao/convenio
- Status: ATIVA

### R2. Canal externo usado
- Etapa: `anuencia`
- Regra: o caminho externo observado para o gov-sp e Sou SP.
- Origem: informado pelo designer nesta conversa
- Status: ATIVA

### R3. Duvidas frequentes na orientacao
- Etapa: `anuencia`
- Regra: a orientacao apresenta quatro itens de duvidas frequentes, com
  conteudo proprio deste convenio. Os itens nao sao iguais aos do
  cluster-4.
- Origem: confirmado pelo designer nesta conversa
- Status: ATIVA

### R4. Segundo canal externo e prova de vida
- Etapa: `anuencia`
- Regra: depois da confirmacao no Sou SP, a pessoa conclui a prova de
  vida no gov.br antes de retornar ao app Itau.
- Origem: confirmado pelo designer nesta conversa
- Status: ATIVA

## Regras que nao se aplicam aqui

- Regra de 1 validacao externa como desenho atual do cluster-4 nao se aplica ao fluxo atual de gov-sp.

## Historico
- 2026-07-30: rascunho inicial de contexto guiado para anuencia.
