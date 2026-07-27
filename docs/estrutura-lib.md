# Estrutura da lib OP — taxonomia e publicacao

## Etapas da jornada (primeiro nivel de tudo)

Exemplos: anuencia | consentimento | simular-e-contratar | revisar |
formalizar. A lista real cresce pelo catalogo em `docs/etapas/`; uma
etapa representa uma capacidade reutilizavel, nao um cluster.

Cada etapa e definida UMA VEZ em docs/etapas/<etapa>.md: quais telas a
compoem (principal, nivel 2 opcional, erro de regra de negocio, erro
de sistema), o comportamento dos campos, e o contrato de variaveis que
ela espera. Os manuais de cluster (docs/clusters/<cluster>.md)
referenciam essas etapas e so documentam regras locais que justificam
divergencias especificas — nunca redescrevem a etapa. Editar uma etapa
aqui reflete em todo cluster que a usa, sem editar manual nenhum.

## Regras de nomenclatura

| Objeto | Convencao | Exemplo | Publicado? |
| --- | --- | --- | --- |
| Template de tela (modalidade padrao) | etapa/tpl-nome | simular-e-contratar/tpl-simulacao | SIM |
| Template de tela (outra modalidade) | etapa/modalidade/tpl-nome | simular-e-contratar/refin/tpl-simulacao | SIM |
| Template especializado | etapa/tpl-nome-funcional | anuencia/tpl-confirmacao-com-matricula | SIM |
| Secao interna | _secoes/nome | _secoes/acao-rodape | NAO (prefixo _ bloqueia publish) |
| Frame de referencia cru | ref-nome-cluster (SEM barra) | ref-simulacao-c1-mg | n/a (nao e componente) |
| Frame de referencia cru, outra modalidade | ref-nome-modalidade-cluster | ref-simulacao-refin-c1-mg | n/a |
| Pagina da lib | uma por etapa + Fluxos | Anuencia | n/a |

Barra (/) em nome de COMPONENTE cria hierarquia no painel de assets e
e a convencao correta. Barra em nome de FRAME de referencia quebra o
pareamento do comparador e e proibida. As duas regras coexistem porque
sao objetos diferentes.

## Modalidade na nomenclatura (decidido em 2026-07-25)

MODALIDADE multiplica TEMPLATE, nunca mode (ver
docs/modelo-clusters.md). Por isso ela entra no NOME do componente, como
nivel intermediario de hierarquia:

    simular-e-contratar/tpl-simulacao          <- primeira concessao
    simular-e-contratar/refin/tpl-simulacao    <- refinanciamento

A modalidade padrao (primeira concessao) NAO ganha segmento proprio —
fica em dois niveis, como sempre foi. So as demais modalidades ganham o
segmento. Motivo: evita renomear tudo que ja existe, e o painel de
assets agrupa as excecoes numa pasta so, que e o comportamento
desejado.

Cluster NUNCA entra no nome do componente — cluster e mode. Uma
especializacao estrutural recebe um nome funcional, como
`anuencia/tpl-confirmacao-com-matricula`, e a selecao por cluster fica
somente no mapa de fluxo. Se voce escreveu o nome de um convenio num
nome de template, algo esta errado no modelo.

## Consumo
Quem instala a lib ve APENAS os templates de tela, organizados por
etapa. Secoes _prefixadas existem para manutencao granular (editar o
master da secao propaga aos templates) mas nao aparecem no consumo.

## Pagina da etapa e referencias

O designer trabalha uma pagina por etapa. Dentro dela, cada secao
interna `_ref-<cluster>` contem todas as referencias cruas daquele
cluster para a etapa, agrupadas por caso de uso e conectadas por
prototipo. A secao `_templates` contem apenas os resultados aprovados.
Os prototipos locais descrevem a navegacao dentro da etapa; a pagina
`Fluxos` monta a jornada completa por cluster com instancias dos
templates.

Ao entregar a pagina, o designer declara somente a etapa e quais
secoes representam cada cluster. O Leitor normaliza o inventario; o
designer nao precisa memorizar convencoes de camada.

## O prefixo `tpl-` e CONQUISTADO, nao assumido

Um objeto so pode se chamar `tpl-` se cumprir as TRES condicoes:

1. E COMPONENT ou COMPONENT_SET (nunca FRAME);
2. Passou por variabilizacao (tem bindings reais para a collection de
   conteudo, ou declara explicitamente que nao varia por cluster);
3. Tem a descricao/carimbo preenchida.

Frame com `tpl-` no nome e uma MENTIRA no arquivo: promete um template
publicavel e entrega um rascunho. Enquanto nao cumprir as tres, o nome
correto e `ref-nome-cluster` (referencia crua). Isso ja aconteceu de
verdade neste projeto: 9 frames foram construidos a mao com prefixo
`tpl-` sem serem componentes nem terem passado pelo montador, e
so foram pegos numa auditoria manual — o validador nao checava isso.
Agora checa (secao 8 da skill consignado-validacao).

## Descricao de componente (carimbo padrao)

Todo template publicado recebe descricao no formato fixo, GERADA pelo
Montador a partir dos bindings reais e do mapa (nunca escrita a mao):

    [Etapa] <etapa> | [Modalidade] <primeira-concessao|refin|...> | [Nivel] <1|2>
    [Especializacao] <padrao|id funcional>
    [Clusters] <modes da collection>
    [Variaveis] <lista real extraida dos boundVariables, ordenada>
    [Estados] <variants de estado, ou n/a>
    [Gatilho] <como se chega nesta tela; obrigatorio se Nivel 2, n/a se Nivel 1>
    [Fonte] <arquivo do mapa> | gerado pelo Montador em <data>

`[Modalidade]`, `[Nivel]` e `[Gatilho]` entraram em 2026-07-25: sem
modalidade a descricao nao distingue dois templates que agora coexistem
(ver "Modalidade na nomenclatura"), e sem nivel/gatilho quem consome a
lib nao sabe se aquela tela e obrigatoria no fluxo ou um desdobramento
opcional — informacao que hoje so existe no mapa de fluxo e nao viaja
com o componente.

`[Especializacao]` e obrigatorio para todo template: use `padrao` para
o nucleo da etapa ou o ID funcional registrado no catalogo. Isso permite
ao Validador diferenciar um template reutilizavel de uma excecao
estrutural sem olhar o nome de nenhum cluster.

Por que existe: a descricao e o UNICO artefato de documentacao que
viaja com o componente ate quem consome a lib (painel de assets e
MCP). Mapa e dossie vivem no repo; a descricao vive no Figma. E o
canal pelo qual um agente futuro (inclusive o aprendiz, que le telas
que nao construiu) entende a INTENCAO de um template, nao so a
estrutura dele.
Secoes _internas tambem recebem descricao, com [Uso interno] na
primeira linha.
