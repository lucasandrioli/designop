# Estrutura da lib OP — taxonomia e publicacao

## Etapas macro da jornada (primeiro nivel de tudo)
consentimento | simular-e-contratar | revisar | formalizar
(quatro etapas separadas, confirmado pelo designer)

Cada etapa e definida UMA VEZ em docs/etapas/<etapa>.md: quais telas a
compoem (principal, nivel 2 opcional, erro de regra de negocio, erro
de sistema), o comportamento dos campos, e o contrato de variaveis que
ela espera. Os manuais de cluster (docs/clusters/<cluster>.md)
referenciam essas etapas e so documentam valores por convenio e
divergencias especificas — nunca redescrevem a etapa. Editar uma etapa
aqui reflete em todo cluster que a usa, sem editar manual nenhum.

## Regras de nomenclatura

| Objeto | Convencao | Exemplo | Publicado? |
| --- | --- | --- | --- |
| Template de tela (modalidade padrao) | etapa/tpl-nome | simular-e-contratar/tpl-simulacao | SIM |
| Template de tela (outra modalidade) | etapa/modalidade/tpl-nome | simular-e-contratar/refin/tpl-simulacao | SIM |
| Secao interna | _secoes/nome | _secoes/acao-rodape | NAO (prefixo _ bloqueia publish) |
| Frame de referencia cru | ref-nome-cluster (SEM barra) | ref-simulacao-c1-mg | n/a (nao e componente) |
| Frame de referencia cru, outra modalidade | ref-nome-modalidade-cluster | ref-simulacao-refin-c1-mg | n/a |
| Pagina da lib | uma por etapa + Referencias + Fluxos | Simular e contratar | n/a |

Barra (/) em nome de COMPONENTE cria hierarquia no painel de assets e
e a convencao correta. Barra em nome de FRAME de referencia quebra o
pareamento do comparador e e proibida. As duas regras coexistem porque
sao objetos diferentes.

## Modalidade na nomenclatura (decidido em 2026-07-25)

MODALIDADE multiplica TEMPLATE, nunca mode (ver docs/modelo-clusters.md
e o Teste 16 em docs/fila-de-testes.md). Por isso ela entra no NOME do
componente, como nivel intermediario de hierarquia:

    simular-e-contratar/tpl-simulacao          <- primeira concessao
    simular-e-contratar/refin/tpl-simulacao    <- refinanciamento

A modalidade padrao (primeira concessao) NAO ganha segmento proprio —
fica em dois niveis, como sempre foi. So as demais modalidades ganham o
segmento. Motivo: evita renomear tudo que ja existe, e o painel de
assets agrupa as excecoes numa pasta so, que e o comportamento
desejado.

Cluster NUNCA entra no nome do componente — cluster e mode. Se voce
escreveu o nome de um convenio num nome de template, algo esta errado
no modelo.

## Consumo
Quem instala a lib ve APENAS os templates de tela, organizados por
etapa. Secoes _prefixadas existem para manutencao granular (editar o
master da secao propaga aos templates) mas nao aparecem no consumo.

## Contexto de etapa (declaracao do designer)
Ao construir telas cruas, o designer declara ao agente: "estas telas
sao da etapa X". A partir dai o agente: normaliza nomes de camada
contra o padrao, posiciona na pagina correta, marca as linhas da
matriz e do mapa com a etapa, e gera os nomes finais dos componentes
com o prefixo da etapa na componentizacao. O designer nunca precisa
memorizar a convencao.

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
`tpl-` sem serem componentes nem terem passado pelo variabilizador, e
so foram pegos numa auditoria manual — o validador nao checava isso.
Agora checa (secao 8 da skill consignado-validacao).

## Descricao de componente (carimbo padrao)

Todo template publicado recebe descricao no formato fixo, GERADA pelo
Montador a partir dos bindings reais e do mapa (nunca escrita a mao):

    [Etapa] <etapa> | [Modalidade] <primeira-concessao|refin|...> | [Nivel] <1|2>
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

Por que existe: a descricao e o UNICO artefato de documentacao que
viaja com o componente ate quem consome a lib (painel de assets e
MCP). Mapa e dossie vivem no repo; a descricao vive no Figma. E o
canal pelo qual um agente futuro (inclusive o aprendiz, que le telas
que nao construiu) entende a INTENCAO de um template, nao so a
estrutura dele.
Secoes _internas tambem recebem descricao, com [Uso interno] na
primeira linha.
