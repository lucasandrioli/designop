# Regras sempre ativas — DesignOps consignado

Este e o documento canonico de regras deste repositorio. Vale para
qualquer agente, em qualquer ferramenta (Codex, Copilot, Claude Code).
Se outra instrucao contradisser esta, esta vence.

Comece por `COMECE-AQUI.md` se voce nao conhece o projeto.

## O que e este projeto

Uma biblioteca Figma de templates de telas do credito consignado
(orgaos publicos), que se adapta por convenio, mantida com ajuda de
agentes. Consolida telas hoje espalhadas em 7+ arquivos.

E uma ferramenta de design para design: DesignOps interno. O produto
final sao bibliotecas, templates e variaveis no Figma, consumidos por
designers.

FORA DE ESCOPO: geracao de codigo de producao, handoff para
desenvolvimento, Code Connect, export para devs. Nao sugira nem derive
para essas frentes; se o usuario pedir, confirme que e uma mudanca
consciente de escopo antes.

## Onde este agente esta rodando (leia antes de planejar)

O trabalho deste projeto se divide em dois tipos, e nem todo ambiente
faz os dois.

**Trabalho de Figma** (comparar telas, montar template, validar):
exige o MCP do Figma conectado. Se voce nao tem as ferramentas
`use_figma` / `get_metadata` disponiveis, voce NAO consegue fazer este
tipo de trabalho. Nao simule, nao descreva o que faria como se tivesse
feito, nao invente node ID. Diga que o ambiente nao tem Figma e ofereca
o trabalho de texto.

**Trabalho de texto** (escrever manual de convenio, doc de etapa, mapa
de fluxo, revisar doutrina, mexer nas skills e nos agentes): funciona
em qualquer ambiente, sem Figma.

No Codex em nuvem so o segundo tipo funciona: o container nao tem o MCP
do Figma e a internet fica desligada apos a configuracao.

## Divisao de trabalho

- O DESIGNER trabalha uma ETAPA por vez. Na pagina da etapa, constroi
  referencias cruas em uma secao por cluster e liga todas as telas de
  cada caso de uso por prototipo.
- O LEITOR inventaria fatos da pagina completa da etapa: telas, casos
  de uso e conexoes. Somente leitura.
- O COMPARADOR pareia as referencias entre clusters e registra as
  divergencias, sem inferir a razao. Somente leitura.
- O GENERALIZADOR identifica o nucleo reutilizavel da etapa, o
  template-base e os candidatos a variavel. Somente leitura.
- O ESPECIALIZADOR classifica o que nao cabe no nucleo: variavel,
  property, variant, mapa de fluxo ou template especializado. Somente
  leitura.
- O designer APROVA a proposta consolidada. Checkpoint obrigatorio,
  nunca pulado.
- O agente MONTADOR cria variaveis, bindings, secoes e previews em um
  `_rascunho-*`, preservando a referencia crua. Ele so promove para
  `tpl-*` depois do veredito independente e de `validatePromotion`.
- O agente VALIDADOR roda em todo rascunho: prova estrutura, conteudo,
  modes, layout e revisao visual, mas nao corrige nem promove.
- O agente APRENDIZ roda apos cada tela do designer, extraindo receitas
  para `docs/receitas/`. Nao pule: o conhecimento se perde se as telas
  passarem sem observacao.

Definicao de cada um em `.github/agents/`. O metodo detalhado esta nas
skills em `.github/skills/`.

## Regras sempre ativas

### Conhecimento de negocio

- Antes de construir ou validar um cluster, LEIA
  `docs/clusters/<cluster>.md` (o manual do convenio): e la que estao as
  REGRAS e o PORQUE de cada divergencia. Regra que nao esta escrita, o
  agente nao conhece: nunca infira a razao de uma divergencia, pergunte
  ou marque `[CONFIRMAR]`.

- A unica fonte de conhecimento de negocio e `docs/`: catalogo da
  etapa, manual do cluster e mapa de fluxo. Se
  `docs/clusters/<cluster>.md` nao existir, o manual NAO EXISTE: pare e
  peca. Nunca use arquivos de exemplo, conversas anteriores ou telas
  semelhantes como substitutos de uma regra documentada.

### Modelo

- Clusters variam por VARIAVEIS (modes); modalidades variam por
  ESTRUTURA (templates separados). Nao misturar. O modelo completo esta
  em `docs/modelo-clusters.md` e e NORMATIVO.
- Uma ETAPA representa uma capacidade reutilizavel do produto. Ela e
  definida uma unica vez em `docs/etapas/<etapa>.md`. O cluster so
  declara que a usa na jornada e documenta regras que justificam
  especializacoes locais. Nunca duplicar a definicao da etapa em um
  manual de cluster.
- Especializacao e uma decisao documentada, nao uma camada solta no
  Figma. Toda diferenca precisa ter mecanismo verificavel: variavel,
  property, variant, mapa de fluxo ou template estrutural especializado.
  Template especializado recebe nome funcional, nunca nome de cluster.
- Composicao de fluxo (etapa existe ou nao num convenio) vive no mapa
  de fluxo, nunca em variavel booleana.
- IDS e fonte unica de componentes: nunca recriar o que existe la.
- Taxonomia em `docs/estrutura-lib.md`: templates publicados como
  `etapa/tpl-nome`; secoes internas com prefixo `_` (nao publicadas);
  referencias cruas sem barra no nome. O prefixo `tpl-` e CONQUISTADO:
  so depois de ser COMPONENT, ter binding e ter carimbo.

### Execucao

- Figma: toda escrita via `use_figma` exige a skill `figma-plugin-api`
  carregada antes.
- Montagem tem dois estados obrigatorios: `ref-*` e fonte humana
  intocavel; clone em trabalho e `_rascunho-*`; so a promocao aprovada
  pode criar `etapa/tpl-*`. Nao use `ref-*` para nomear copia ou
  componente.
- Os scripts em `scripts/` NAO rodam pelo caminho. Nao ha `require` nem
  acesso a disco dentro da Plugin API: leia o arquivo, cole o corpo da
  funcao dentro do script do `use_figma` e chame no fim. Sempre a versao
  atual do arquivo, nunca reescrita de memoria.
- Nenhuma tela e entregue sem validacao (skill `consignado-validacao`).

### Comunicacao

- Portugues brasileiro, tom direto, sem jargao corporativo.
- Nunca usar travessao (em dash) em textos gerados.
- Relatorio sempre em duas partes: primeiro o resumo em linguagem de
  negocio, depois o detalhe tecnico como apoio. O designer le a
  primeira parte.
- Incerteza vira `[VERIFICAR COM DESIGNER]` ou `[CONFIRMAR]`, nunca uma
  conclusao mais forte do que a evidencia sustenta.

## Mapa do repositorio

| Onde | O que e |
| --- | --- |
| `COMECE-AQUI.md` | Ponto de entrada. Ordem de instalacao e ciclo de trabalho |
| `AGENTS.md` | Este arquivo. Regras sempre ativas |
| `.github/agents/` | Definicao dos 7 agentes |
| `.github/skills/` | Metodo detalhado que os agentes seguem |
| `.claude/commands/` | Slash commands (so Claude Code) |
| `docs/` | Doutrina + moldes `_template.md` a preencher |
| `scripts/` | Validacao de layout e de estrutura |

## Sincronizacao

`.github/copilot-instructions.md` aponta para este arquivo, porque o
Copilot carrega aquele caminho automaticamente. Mudou regra aqui, nao
precisa mexer la — mas se voce ADICIONAR uma regra critica de
seguranca, confira se aquele arquivo continua apontando para ca.
