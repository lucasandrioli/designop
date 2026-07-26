# Etapa: <nome>

Este documento define UMA VEZ o que existe dentro desta etapa da
jornada: quais telas, quais erros, quais comportamentos de campo. Os
manuais de cluster (docs/clusters/<cluster>.md) REFERENCIAM este
arquivo em vez de redescrever a etapa — só documentam lá os VALORES de
variável e as divergências específicas daquele convênio. Se uma etapa
muda aqui, todo cluster que a usa reflete a mudança sem precisar editar
manual nenhum.

Uma etapa não é uma tela. É um CONJUNTO de telas: o caminho feliz, as
variações de erro, e o comportamento dos campos dentro dela. Cada
categoria abaixo só existe de verdade quando há um caso real —
[CONFIRMAR] fica até alguém confirmar, nunca é preenchido por
suposição.

## Identificação
- Nome da etapa: `<slug, ex: simular-e-contratar>`
- Nível na jornada macro: ver docs/estrutura-lib.md

## Telas que compõem esta etapa

### Principal (nível 1, caminho feliz)
Toda etapa tem no mínimo uma. Se tiver mais de uma (ex: uma tela vira
duas por causa de um passo intermediário), liste todas em ordem.

| Template | Componente na lib | Observado em |
| --- | --- | --- |
| <nome> | `<etapa>/tpl-<nome>` | <arquivo, node ID, data> |

### Nível 2 (opcional, alcançável a partir do nível 1)
Telas de apoio/detalhe que o usuário PODE abrir mas não precisa para
avançar (ex: "ver quais dados serão consultados"). Mecanismo = mapa de
fluxo (docs/modelo-clusters.md, eixo 3), gatilho = o elemento que leva
até ela (botão secundário, link, item expansível).

[CONFIRMAR] — sem caso real ainda.

### Erro de regra de negócio (específico desta etapa)
Situações em que a etapa não pode prosseguir por uma regra de PRODUTO
ou do CONVÊNIO — não por falha técnica (ex: valor solicitado fora da
faixa permitida, cliente inelegível para a modalidade). Cada uma vira
candidata a: (a) template próprio `<etapa>/tpl-erro-<nome>`, ou (b) um
estado/variant dentro do template principal — a decisão depende de
quanto a tela muda estruturalmente, não é automática.

[CONFIRMAR] — sem caso real ainda.

### Erro de sistema (genérico — pode não pertencer só a esta etapa)
Falhas técnicas: indisponibilidade, timeout, erro de integração.
Candidato forte a ser uma tela COMPARTILHADA entre várias etapas (não
uma por etapa) — decisão de arquitetura em aberto, não duplicar sem
essa decisão estar confirmada.

[CONFIRMAR] — inclusive se compartilhado ou por etapa.

## Comportamento de campo
Não é tela nova — é VARIANT/estado de um componente dentro da tela
principal (ex: `campo-texto` no Mini DS já tem Estado=padrão/erro).
Para cada campo editável desta etapa:

| Campo | Componente IDS | Estados possíveis | Regra de quando cada estado aparece |
| --- | --- | --- | --- |
| <nome> | <componente> | <lista> | [CONFIRMAR] |

## Componentes do IDS tipicamente usados
<lista, vem do plano de componentização do inventário>

## Variáveis que esta etapa espera (contrato)
Nome + tipo, SEM valor — o valor é por cluster (docs/clusters/<cluster>.md
e a collection real no Figma). Ver docs/modelo-clusters.md para a
doutrina de nomenclatura (grupo/nome-kebab).

| Variável | Tipo | Obrigatória se etapa ativa |
| --- | --- | --- |

## Histórico
- <data>: <o que mudou e por quê>
