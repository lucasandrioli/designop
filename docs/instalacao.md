# Instalacao: o que precisa existir antes de um agente rodar

Este documento responde uma pergunta so: **estou comecando do zero, o
que preciso ter pronto antes de pedir qualquer coisa a um agente?**

Ele existe porque os agentes deste projeto assumem contexto. O
montador manda ler `docs/clusters/<cluster>.md`; o validador
confere as regras ATIVAS desse manual; o comparador cruza cada
divergencia contra ele. Se esses arquivos nao existirem, os agentes NAO
travam com erro claro — eles fazem pior: marcam `[CONFIRMAR]` em tudo e
produzem ruido que parece trabalho.

## A regra que evita paralisia: pre-requisito e INCREMENTAL

O erro de leitura mais provavel deste doc e achar que precisa
documentar 5 convenios e 4 etapas antes de comecar. Nao precisa. O
conjunto minimo para produzir UM template e pequeno, e depois disso o
processo se repete.

### kit minimo

Para fechar o primeiro ciclo completo (comparar -> aprovar -> bindar ->
validar) voce precisa de exatamente isto:

1. Ambiente conectado e bateria de fumaca PASSOU (bloco 1 abaixo)
2. **1 etapa** escolhida
3. **2 clusters** — nunca 1. Com um cluster so nao existe comparacao, e
   sem comparacao nao ha variacao a descobrir: o comparador nao tem o
   que fazer
4. Manual desses 2 clusters, **apenas as regras que tocam essa etapa**
   (nao o convenio inteiro)
5. Telas de referencia cruas dessa etapa, uma por cluster, construidas
   pelo designer
6. Arquivo consumidor criado, com as bibliotecas do IDS habilitadas

Fora do kit minimo, tudo o mais e crescimento: cluster novo = uma coluna no
mapa + um mode + preencher celulas. Etapa nova = um doc de etapa +
telas novas. Nenhum dos dois exige refazer o que ja existe.

---

## Bloco 1 — AMBIENTE (bloqueia tudo)

Dono: voce + TI/plataforma. Nada funciona sem isto.

| # | Item | Como verificar | Se falhar |
| --- | --- | --- | --- |
| 1.1 | Figma MCP conectado na IDE | pedir "liste as bibliotecas deste arquivo" passando um link | reconectar; ver COMECE-AQUI.md |
| 1.2 | Seat Figma Dev ou Full | `whoami` no MCP retorna o tier | View/Collab tem limite de 6 chamadas/MES: inviavel. Resolver ANTES de tudo |
| 1.3 | Skills e agentes visiveis | `/skills` no chat lista as skills do repo | repo nao esta aberto na pasta certa |
| 1.4 | Bateria de fumaca | rodar `docs/runbook-banco.md`, os 10 itens | item 5 falhando = PARE. O desenho do binding muda |
| 1.5 | Limite de modes do plano | criar 5+ modes numa collection, PUBLICAR e consumir noutro arquivo | ver docs/modelo-clusters.md: se travar em 4 com 5+ clusters, o eixo cluster=mode precisa de plano B |

Sobre 1.5: um teste via `addMode` criou 8 modes sem erro no lab, mas a
Plugin API NAO aplica o limite documentado. "Funcionou via API" nao e
evidencia de que o plano suporta — a restricao pode estar no publish ou
no consumo. A verificacao real e criar, publicar e consumir.

## Bloco 2 — CONHECIMENTO (bloqueia por etapa/cluster, incremental)

Dono: voce + produto + juridico. E o que SO o humano sabe, e o que os
agentes tem proibicao explicita de inventar.

| # | Item | Arquivo | Minimo para o kit minimo |
| --- | --- | --- | --- |
| 2.1 | Quais clusters entram no escopo, e o nome do mode de cada | (declarado ao agente + docs/clusters/) | os 2 do piloto |
| 2.2 | Quais modalidades entram | docs/estrutura-lib.md | 1 (modalidade multiplica TEMPLATE, ver modelo-clusters) |
| 2.3 | Manual de cada cluster | docs/clusters/<cluster>.md (usar `_template.md`) | so as regras que tocam a etapa escolhida |
| 2.4 | Definicao da etapa | docs/etapas/<etapa>.md (usar `_template.md`) | a etapa escolhida |
| 2.5 | Mapa de fluxo | docs/mapa-fluxo-<escopo>.md | pode ser rascunho; o comparador gera do prototipo (Modo Fluxos) |

Regra de ouro da bloco 2: **regra que nao esta escrita, o agente nao
conhece — e ele vai perguntar, nao adivinhar.** Isso e proposital. Se um
agente propuser a razao de uma divergencia sem que ela esteja
documentada, isso e bug, nao feature.

O manual do cluster NAO precisa estar completo. Precisa estar HONESTO:
`[CONFIRMAR]` no que ainda nao foi validado com produto/juridico e
melhor que uma regra inventada que parece certa.

## Bloco 3 — ARTEFATO FIGMA (bloqueia por etapa)

Dono: voce. E o material concreto no arquivo.

| # | Item | Minimo para o kit minimo |
| --- | --- | --- |
| 3.1 | Arquivo consumidor da lib, separado do IDS | 1 arquivo |
| 3.2 | Bibliotecas do IDS habilitadas nesse arquivo | as 4 do IDS |
| 3.3 | Collection de conteudo, com um mode por cluster | 1 collection, 2 modes |
| 3.4 | Telas de referencia cruas, 1 por cluster, da etapa escolhida | 2 telas |
| 3.5 | (opcional) prototipo ligando as telas | so se a etapa tiver mais de uma tela |

Sobre 3.1: NUNCA construa referencia, template ou binding dentro do
arquivo do IDS. O IDS e catalogo publicado; telas de consumo vivem no
arquivo consumidor. Isso ja foi errado uma vez neste projeto e teve que
ser desfeito.

Sobre 3.4: as telas podem chegar BAGUNCADAS — componente destacado,
camada sem nome, sem auto layout. Isso e tolerado e esperado (ver Testes
13 e 14): o comparador audita e reporta, a normalizacao e trabalho do
agente. O que NAO e tolerado e nao existir tela nenhuma: sem referencia,
nao ha especificacao de variacao, e o agente nao constroi tela do zero
(Bloco 3 do projeto, ainda nao destravada).

---

## Ordem de execucao (dia 0 em diante)

    Bloco 1 completa
        v
    escolher 1 etapa + 2 clusters
        v
    Bloco 2 minima (manual dos 2 clusters, doc da etapa)  <-- so o humano faz
        v
    Bloco 3 minima (arquivo, libs, collection, 2 telas cruas)  <-- so o designer faz
        v
    /comparador  -> checklist de aprovacao
        v
    VOCE aprova o schema (checkpoint obrigatorio, nao pule)
        v
    /montador -> template bindado + carimbo
        v
    /validador -> passou/reprovou
        v
    publicar a lib (acao manual, nao tem API)
        v
    repetir para a proxima etapa, ou adicionar cluster

## O que os agentes checam sozinhos

A checagem inicial do comparador (skill `consignado-comparador`) verifica os
pre-requisitos antes de comparar qualquer coisa, e RECUSA comecar se
faltar item da bloco 2 ou 3 — devolvendo a lista do que falta em
linguagem de negocio, nao em nome de arquivo. Isso existe porque
documento sozinho nao e cumprido: quem cobra e o agente.

O que os agentes NAO checam: bloco 1. Ambiente e responsabilidade
humana e a bateria de fumaca do runbook e manual por natureza (envolve
publicar biblioteca, aceitar update, coisas sem API).

## Historico
- 2026-07-25: criado a partir da pergunta "os aprendizados estao
  enraizados o suficiente pros agentes comecarem a operar do zero?". A
  resposta era nao: tres agentes referenciavam arquivos que nao
  existiriam no dia 0, e nada cobria qual conhecimento precisa existir
  antes de rodar o primeiro agente.
