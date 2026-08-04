# Etapa: simular-e-revisar

## Status da base

- Aprovado por: [CONFIRMAR]
- Atualizado em: 2026-08-04
- Fonte inicial: Explicação oral da pessoa responsável pela curadoria

## Proposito

Capacidade canônica de simular e revisar. [REGRA CONFIRMADA]

## Regras aplicaveis

- No simulador, a pessoa pode editar valor, parcelas e quantidade de parcelas. [CONFIRMAR]
- A pessoa também pode escolher adicionar ou não portabilidade de salário. [CONFIRMAR]
- A pessoa também pode escolher adicionar ou não seguro consignado. [CONFIRMAR]
- Os produtos são opcionais e não podem ser condição para contratar o crédito consignado. [REGRA CONFIRMADA]
- A revisão mostra as condições da operação, inclusive juros, IOF, custos detalhados, convênio ou fonte pagadora e matrícula quando aplicável. [CONFIRMAR]
- A pessoa pode consultar detalhes adicionais antes de seguir. [CONFIRMAR]
- Os efeitos de produtos opcionais e eventuais reduções de taxa podem ser consultados na simulação. [CONFIRMAR]
- O app recalcula o valor efetivo com dados atualizados do empregador. [CONFIRMAR]

## Sinais de produto / objeto de análise

- Portabilidade de salário pode centralizar os recebimentos no Itaú. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Pode existir benefício ou redução na taxa. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Seguro consignado pode ter coberturas de morte e invalidez. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Pode existir cobrança mensal. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Pode haver redução de taxa, descontos em farmácia e outros benefícios. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Os produtos podem aparecer na simulação e na revisão como composição condicional. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**

## Composição condicional da revisão

- Quando houver portabilidade de salário, deve existir um bloco específico com as informações relacionadas à portabilidade. [CONFIRMAR]
- Quando houver seguro consignado, deve existir um bloco específico com as informações relacionadas ao seguro. [CONFIRMAR]
- Quando o produto não for escolhido, o respectivo bloco não deve aparecer como contratado. [CONFIRMAR]
- Os detalhes exatos dos blocos, textos, coberturas, valores, taxas e estados serão investigados pelo Analista nas referências do piloto. [CONFIRMAR]

## Limites

- Inicio: [CONFIRMAR]
- Fim: [CONFIRMAR]
- Fora da etapa: regras estruturais de modalidade e regras locais de contexto.

## Telas e casos de uso

| Tela estavel | Caso de uso | Nivel | Gatilho | Template funcional |
| --- | --- | ---: | --- | --- |
| [CONFIRMAR] | edição de valor, parcelas e produtos | [CONFIRMAR] | simulação | [CONFIRMAR] |
| [CONFIRMAR] | revisão das condições da operação | [CONFIRMAR] | revisão | [CONFIRMAR] |

## Fontes e lacunas

- Regras globais: `docs/manual-credito-consignado.md`.
- Regras por modalidade: `docs/modalidades/<modalidade>.md`.
- [CONFIRMAR]: objetivo, telas e regras específicas por modalidade e contexto.
