# Estrutura da lib OP — taxonomia e publicacao

## Etapas macro da jornada (primeiro nivel de tudo)
consentimento | simular-e-contratar | revisar | formalizar
(quatro etapas separadas, confirmado pelo designer)

## Regras de nomenclatura

| Objeto | Convencao | Exemplo | Publicado? |
| --- | --- | --- | --- |
| Template de tela | etapa/tpl-nome | simular-e-contratar/tpl-simulacao | SIM |
| Secao interna | _secoes/nome | _secoes/bloco-ofertas | NAO (prefixo _ bloqueia publish) |
| Frame de referencia cru | ref-nome-cluster (SEM barra) | ref-simulacao-c1-mg | n/a (nao e componente) |
| Pagina da lib | uma por etapa + Referencias + Fluxos | Simular e contratar | n/a |

Barra (/) em nome de COMPONENTE cria hierarquia no painel de assets e
e a convencao correta. Barra em nome de FRAME de referencia quebra o
pareamento do comparador e e proibida. As duas regras coexistem porque
sao objetos diferentes.

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

## Descricao de componente (carimbo padrao)

Todo template publicado recebe descricao no formato fixo, GERADA pelo
Montador a partir dos bindings reais e do mapa (nunca escrita a mao):

    [Etapa] <etapa> | [Clusters] <modes da collection>
    [Variaveis] <lista real extraida dos boundVariables, ordenada>
    [Estados] <variants de estado, ou n/a>
    [Fonte] <arquivo do mapa> | gerado pelo Montador em <data>

Por que existe: a descricao e o UNICO artefato de documentacao que
viaja com o componente ate quem consome a lib (painel de assets e
MCP). Mapa e dossie vivem no repo; a descricao vive no Figma.
Secoes _internas tambem recebem descricao, com [Uso interno] na
primeira linha.
