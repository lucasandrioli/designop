# Etapa: <nome-canonico>

## Proposito

<capacidade reutilizavel da jornada>

## Limites

- Inicio: <evento de entrada>
- Fim: <evento de saida>
- Fora da etapa: <limites>

## Telas e casos de uso

| Tela estavel | Caso de uso | Nivel | Gatilho | Template funcional |
| --- | --- | ---: | --- | --- |
| <tela> | <caso> | <1|2> | <gatilho> | <padrao|especializacao> |

## Composicoes internas

| Composicao | Ponto da etapa | Presenca por contexto | Roteiro de orientacao | Contrato de retorno | Regra local |
| --- | --- | --- | --- | --- | --- |
| <confirmacao-externa> | <apos qual tela> | <mapa da modalidade> | <DIRETA|DIRETA_COM_TUTORIAL_OPCIONAL|[CONFIRMAR]> | <DIRETO|ACAO_NO_APP|[CONFIRMAR]> | <manual de contexto e secao> |

Uma confirmacao externa pode conter uma ou mais acoes fora do app. Essa
quantidade nao cria uma tela ou template interno por si so. A estrutura
da etapa muda somente quando o contrato de retorno exigir tela ou acao
interna adicional. Quando houver tutorial, ele e opcional e reencontra
o mesmo direcionamento externo do caminho direto. No modelo atual,
preencha esta secao em Formalizacao; outro uso exige aprovacao
arquitetural explicita.

## Contrato de conteudo

| Tela | Papel | Tipo | Variavel | Binding | Observacao |
| --- | --- | --- | --- | --- | --- |
| <tela> | <papel> | <text|visible> | <etapa>/<tela>/<papel> | <property|node> | <nota> |

## Contrato de composicao

| Composicao | Mecanismo | Reutilizacoes previstas | Decisao |
| --- | --- | ---: | --- |
| <nome> | <IDS|local-component|local-layout> | <numero> | <aprovada|CONFIRMAR> |

Componente local exige duas ou mais reutilizacoes previstas no contrato
aprovado. Uso unico permanece como local-layout.

## Fontes e lacunas

- Regras globais: <manual e secao>
- Regras da modalidade: <manual da modalidade e secao>
- Regras locais: <contexto-id e secao>
- [CONFIRMAR]: <itens pendentes>
