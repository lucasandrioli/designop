# Etapa: formalizacao

## Status da base

- Aprovado por: [CONFIRMAR]
- Atualizado em: 2026-08-04
- Fonte inicial: Explicação oral da pessoa responsável pela curadoria

## Proposito

Capacidade canônica de formalização. [REGRA CONFIRMADA]

## Regras aplicaveis

- A formalização começa com a concordância com normativas obrigatórias. [CONFIRMAR]
- A pessoa vê informações importantes sobre as condições da operação. [CONFIRMAR]
- Quando houver portabilidade de salário, deve receber as regras de vigência e a informação de que o empréstimo pode ocorrer mesmo se a portabilidade não se concluir. [CONFIRMAR]
- Quando houver seguro, deve receber regras de cobrança, cancelamento e possíveis efeitos nas condições do empréstimo. [CONFIRMAR]
- A pessoa acessa detalhes do contrato em itens expansíveis e depois informa a senha para concluir a formalização interna. [CONFIRMAR]
- Alguns contextos exigem confirmação externa e a ação pode ocorrer em site ou aplicativo externo. [CONFIRMAR]
- Após informar a senha, a jornada introduz a necessidade de fazer a formalização externa quando aplicável, explica o básico do que a pessoa precisa fazer e oferece uma rota de tutorial opcional com mais detalhes. [CONFIRMAR]
- Os produtos opcionais escolhidos em simular-e-revisar seguem refletidos na formalização. [CONFIRMAR]
- Após a conclusão, a pessoa vê a efetivação: acompanhamento da operação, estado de análise e próximo passo. [CONFIRMAR]
- Na efetivação, a pessoa pode consultar ou sair do contrato e voltar para o home de crédito. [CONFIRMAR]
- A confirmação externa continua sendo uma composição de formalização. O contexto define se o retorno é `DIRETO` ou `ACAO_NO_APP`. [REGRA CONFIRMADA]
- Presença da confirmação externa, canal, regra do convênio, tutorial opcional e contrato de retorno para cada contexto: [CONFIRMAR]

## Sinais de produto / objeto de análise

- Portabilidade de salário pode centralizar os recebimentos no Itaú. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Pode existir benefício ou redução na taxa. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Seguro consignado pode ter coberturas de morte e invalidez. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Pode existir cobrança mensal. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Pode haver redução de taxa, descontos em farmácia e outros benefícios. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**
- Os produtos podem aparecer na formalização e na confirmação externa como continuidade da escolha feita em simular-e-revisar. **SINAL DE PRODUTO / OBJETO DE ANÁLISE**

## Limites

- Inicio: [CONFIRMAR]
- Fim: [CONFIRMAR]
- Fora da etapa: regras estruturais de modalidade e regras locais de contexto.

## Telas e casos de uso

| Tela estavel | Caso de uso | Nivel | Gatilho | Template funcional |
| --- | --- | ---: | --- | --- |
| [CONFIRMAR] | concordância com normativas e checklists | [CONFIRMAR] | formalizacao | [CONFIRMAR] |
| [CONFIRMAR] | detalhes do contrato e senha | [CONFIRMAR] | formalizacao | [CONFIRMAR] |
| [CONFIRMAR] | efetivação após conclusão | [CONFIRMAR] | finalizacao | [CONFIRMAR] |

## Composicoes internas

| Composicao | Ponto da etapa | Presenca por contexto | Roteiro de orientacao | Contrato de retorno | Regra local |
| --- | --- | --- | --- | --- | --- |
| confirmacao-externa | após a senha, quando aplicável | [CONFIRMAR] | tutorial opcional definido por contexto | [CONFIRMAR] | `docs/contextos/<contexto-id>.md` |

Confirmação externa é uma composição de formalização, não uma etapa canônica. A presença, o tutorial opcional e o retorno `DIRETO` ou `ACAO_NO_APP` precisam de fonte documental ou confirmação humana.

## Fontes e lacunas

- Regras globais: `docs/manual-credito-consignado.md`.
- Regras por modalidade: `docs/modalidades/<modalidade>.md`.
- [CONFIRMAR]: telas, composição e regras específicas por contexto.
