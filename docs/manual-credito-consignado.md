# Manual do Credito Consignado

## Status da base

- Aprovado por: [CONFIRMAR]
- Atualizado em: 2026-08-04
- Fonte inicial: Explicação oral da pessoa responsável pela curadoria
- Escopo: regras globais das modalidades PCon, refin e portabilidade

## Regras globais

| Regra | Etapas afetadas | Resultado visual ou de caminho | Evidencia | Status |
| --- | --- | --- | --- | --- |
| A base documental é organizada em manual global, modalidades, etapas canônicas e contextos. | todas | Estrutura documental da base. | AGENTS.md, docs/base-documental.md | CONFIRMADA POR FONTE FORMAL |
| PCon, refin e portabilidade existem como nomes documentais da base. | modalidades | Organização documental. | AGENTS.md, docs/base-documental.md | CONFIRMADA POR FONTE FORMAL |
| Contextos representam clusters ou convênios e exigem identificador estável, rótulo, origem, modalidades ativas e regras locais. | contextos | Estrutura de cadastro de contexto. | AGENTS.md, docs/contextos/indice.md | CONFIRMADA POR FONTE FORMAL |
| Nenhuma regra pode ser inferida a partir de uma tela. | todas | Bloqueio de inferência. | AGENTS.md | CONFIRMADA POR FONTE FORMAL |
| Nenhum contexto concreto deve ser criado sem identificação formal. | contextos | Bloqueio de criação. | AGENTS.md, docs/contextos/indice.md | CONFIRMADA POR FONTE FORMAL |
| Seguro consignado e portabilidade de salário são produtos opcionais e não podem ser condição para contratar o crédito consignado. | simular-e-revisar, formalizacao | Não bloqueiam a contratação do consignado. | Diretriz metodológica aprovada nesta revisão | REGRA CONFIRMADA |
| A escolha de seguro consignado e portabilidade de salário acontece em simular-e-revisar e a revisão mostra composição condicional conforme a escolha da pessoa. | simular-e-revisar | A seleção e a composição da tela são condicionais à escolha da pessoa. | Diretriz metodológica aprovada nesta revisão | REGRA CONFIRMADA |

## Sinais de produto / objeto de análise

> Os itens marcados como SINAL DE PRODUTO / OBJETO DE ANÁLISE orientam a investigação do Analista nas referências do piloto. Eles não representam contrato final, regra universal ou especificação pronta para produção. Quando a fonte não for suficiente, manter [CONFIRMAR] sem remover o tema da análise.

- Portabilidade de salário pode centralizar os recebimentos no Itaú. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Pode existir benefício ou redução na taxa. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Seguro consignado pode ter coberturas de morte e invalidez. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Pode existir cobrança mensal. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Pode haver redução de taxa, descontos em farmácia e outros benefícios. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Os produtos podem aparecer na simulação, revisão e formalização como composição condicional. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**

## Itens excluidos da base por ausencia de fonte formal

| Item excluido | Motivo |
| --- | --- |
| referencia fixa de 30% | sem fonte formal aprovada |
| uso obrigatorio de conta do Itaú | sem fonte formal aprovada |
| busca de pagamento em contas mantidas no banco | sem fonte formal aprovada |

## Pendencias mantidas

- Regras especificas de seguro consignado: [CONFIRMAR]
- Regras especificas de portabilidade de salario: [CONFIRMAR]

## Limites

Regras estruturais pertencem a `docs/modalidades/<modalidade>.md`.
Capacidades reutilizáveis pertencem a `docs/etapas/<etapa>.md`. Regras
locais de cluster pertencem a `docs/contextos/<contexto-id>.md`. Uma
referência visual nunca preenche uma regra ausente nesta base.
