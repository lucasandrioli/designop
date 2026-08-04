# Regras sempre ativas - DesignOps consignado

Este e o documento canonico de regras deste repositorio. Vale para
qualquer agente e ferramenta. Se outra instrucao contradisser esta,
esta vence.

Comece por `COMECE-AQUI.md` se voce nao conhece o projeto.

## O que e este projeto

Uma biblioteca Figma de templates de telas do credito consignado para
orgaos publicos, mantida com ajuda de agentes. E uma ferramenta interna
de DesignOps: o produto final sao bibliotecas, templates e variaveis
consumidos por designers.

FORA DE ESCOPO: geracao de codigo de producao, handoff para
desenvolvimento, Code Connect e export para devs.

## Limite do ambiente

Trabalho de Figma exige MCP conectado. Sem `use_figma` e `get_metadata`,
o agente nao compara telas, monta templates nem declara uma validacao
Figma como executada. Ele pode executar somente trabalho de texto.

## Modelo canonico

- As etapas canonicas sao `consentimento`, `simular-e-revisar` e
  `formalizacao`. Etapa e capacidade reutilizavel, definida uma vez em
  `docs/etapas/<etapa>.md`.
- Uma confirmacao externa pode compor Formalizacao quando o contrato
  aprovado a exigir. Ela nao cria etapa canonica independente. O mapa
  decide apenas se a composicao esta presente e qual e o caminho de
  retorno ao app; quantidade, canais e formato das acoes fora do app
  pertencem a regra local do contexto.
- Uma confirmacao externa com qualquer quantidade de acoes fora do app
  continua sendo a mesma composicao. O que pode alterar a estrutura de
  Formalizacao e o retorno: `DIRETO`, quando a jornada segue apos voltar
  ao app, ou `ACAO_NO_APP`, quando a pessoa precisa concluir uma acao
  interna antes de a jornada seguir. Novo comportamento exige contrato
  aprovado, mas nao cria etapa canonica automaticamente.
- Quando a confirmacao externa tiver orientacao, ela pode oferecer um
  tutorial opcional. O mapa declara se ha apenas caminho direto ou se
  existe tambem o caminho de ajuda; o tutorial sempre reencontra o
  mesmo direcionamento externo. Ele nunca vira etapa canonica separada
  nem e deduzido pela quantidade de acoes externas.
- O molde do Manual do Credito Consignado vive em
  `docs/manual-credito-consignado_template.md`. Em uma rodada concreta,
  o manual global registra regras globais; cada modalidade tem seu manual
  estrutural em `docs/modalidades/<modalidade>.md`, cada etapa tem seu
  catalogo em `docs/etapas/<etapa>.md`, e o mapa junta essas camadas em
  `docs/mapas/<modalidade>.md`.
- Modalidade muda estrutura: cada modalidade possui templates e uma
  collection de conteudo proprios. Modalidade nunca e mode.
- Contexto e o identificador generico do mode. O mapa registra a
  presenca de etapas por contexto; ausencia nunca vira boolean de
  variavel.
- Cada contexto possui um `contexto-id` estavel e um manual em
  `docs/contextos/<contexto-id>.md`. O manual registra rotulo atual,
  origem, modalidades ativas e regras locais por etapa. O rotulo pode
  mudar sem alterar o identificador.
- Referencias cruas e mapas podem carregar `contexto-id`. Asset
  publicado, componente local, variavel e caminho de variavel nao
  carregam rotulo nem identificador de contexto.
- Regra ausente e `[CONFIRMAR]`; nunca inferir regra a partir da tela.
- Leitura Figma produz somente `FATO OBSERVADO`: estrutura, caminho,
  reacao e sinal tecnico. Regra global, regra local, presenca obrigatoria,
  roteiro de tutorial e contrato de retorno exigem fonte documental ou
  confirmacao humana identificada. Sem essa fonte, inclusive `DIRETO` e
  `ACAO_NO_APP` ficam como `[CONFIRMAR]`.
- Contratos logicos de tela e jornada vivem em `docs/contratos/`. Node
  IDs atuais vivem somente em `.designops/runs/<rodada>/resolvido.json`.

## Taxonomia Figma

| Objeto | Convencao |
| --- | --- |
| Template publicado | `<modalidade>/<etapa>/tpl-<tela>` |
| Rascunho | `_rascunho-<modalidade>-<etapa>-<tela>` |
| Referencia crua | `ref-<modalidade>-<tela>-<contexto-id>` |
| Componente local interno | `_componentes-locais/<dominio>/<nome>` |
| Collection de conteudo | `Conteudo - <Modalidade>` |
| Variavel de conteudo | `<etapa>/<tela>/<papel>` |

`tpl-` e conquistado: somente COMPONENT ou COMPONENT_SET, com binding
real, carimbo e veredito favoravel do Validador. Secoes com `_` sao
internas e nao publicadas. Referencia crua nao e componente.

## Componentes e variaveis

- IDS e fonte unica de componentes sempre que cobrir a composicao.
- Um componente local so pode ser criado quando o contrato aprovado
  comprovar reutilizacao da mesma composicao em pelo menos duas telas
  ou casos de uso. Sem essa evidencia, a composicao fica como
  `local-layout` no template.
- Uma Section de jornada usa uma unica collection de conteudo da
  modalidade. Collections estruturais do IDS podem coexistir.
- O mode de contexto e aplicado uma unica vez na Section. Templates e
  descendentes herdam o mode e nao podem fixa-lo explicitamente.
- Evidencias de ambientes externos comprovam o caminho e a regra local,
  mas nao viram templates ou componentes publicados da biblioteca.

## Squad e checkpoints humanos

- O Operador coordena leituras paralelas e grava somente estado
  temporario em `.designops/runs/`. Ele nao escreve no Figma nem em
  documentos oficiais.
- O Analista le referencias, reacoes e documentos, e consolida manual
  de contexto, mapa, contrato de tela, mapa IDS, plano de variaveis e
  proposta de componentes locais. Em `/consignado-contexto`, so grava
  documentos apos aprovacao humana explicita do texto.
- O contrato consolidado exige aprovacao humana antes de o Montador
  criar componentes locais ou templates.
- O Montador escreve em serie: primeiro componentes locais aprovados,
  depois templates. Rascunhos e previews ficam em
  `_verificacao-<etapa>`; clone nao inicia montagem.
- O Validador audita sem corrigir arvore, geometria, IDS, conteudo,
  modes, comportamento e revisao visual. Promocao so ocorre depois de
  veredito favoravel.
- O Aprendiz e comando explicito do Analista e escreve somente em
  `docs/receitas/`.
- A skill `figma-referencias` prepara evidencia apenas por pedido
  explicito. Ela nao participa da montagem nem cria asset publicavel.

## Regras de execucao

- Viewport mobile padrao: `360 x 800`, salvo excecao aprovada.
- O Analista usa Figma somente para leitura e usa apenas `ref-*` como
  evidencia de nova analise. Rascunho nunca e evidencia analitica.
- Antes de qualquer coleta, o Analista redescobre a pagina e as Sections
  `ref-*` por `get_metadata` no arquivo atual. Node IDs de memoria, chat,
  manifesto ou rodada anterior nao podem ser reutilizados. Section exata
  ausente bloqueia a coleta; nunca substitui-la por uma parecida.
- `figma-get_figma_skill` serve somente para recursos oficiais do servidor
  Figma. Skills do projeto em `.github/skills/` sao lidas localmente; o
  Analista nunca consulta `skill://index.json` nem tenta carregar skill
  local por URI `skill://figma/...`.
- Antes de **cada** chamada `use_figma`, inclusive chamadas subsequentes
  somente de leitura, o historico do turno deve mostrar o carregamento da
  skill oficial `skill://figma/figma-use/SKILL.md`. Cada execucao continua
  atomica: nao agrupar Sections, coletores ou partes em "lotes".
  A ordem do historico MCP nao pode ser provada por script no repositorio;
  sem esse registro, a rodada fica `NAO_VERIFICAVEL`.
- Em rodada nova, o Analista nao le `.designops/runs/<outra-rodada>/`.
  Artefato de rodada anterior so pode ser lido quando o pedido disser
  explicitamente para retomar ou comparar uma rodada identificada.
- Toda escrita Figma via `use_figma` exige a skill `figma-plugin-api`.
- Scripts em `scripts/` sao colados na Plugin API a partir da versao
  atual do arquivo. Eles nao executam por caminho dentro do Figma.
- O Analista nao depende de terminal para validar o manifesto. Depois de
  grava-lo, ele relê o objeto e executa `validateAnalysisManifestCore.js`
  junto de `reconcileAnalysisManifestFigma.js` em uma chamada `use_figma`
  somente de leitura. A reconciliacao compara o manifesto com a pagina e
  Sections existentes naquele instante; `validateAnalysisManifestCore.js`
  sozinho valida apenas a forma do objeto. O adaptador
  `validateAnalysisManifest.js` e apoio opcional de desenvolvimento.
- Nenhuma tela e entregue sem validacao completa.
- Skill orienta a sequencia; contratos e validadores decidem se uma
  proposta, montagem ou promocao pode seguir.

## Comunicacao

- Portugues brasileiro, tom direto e sem travessao.
- Relatorios: resumo de negocio primeiro, detalhe tecnico depois.
- Incerteza vira `[VERIFICAR COM DESIGNER]` ou `[CONFIRMAR]`.

## Mapa do repositorio

| Onde | O que e |
| --- | --- |
| `COMECE-AQUI.md` | Entrada e ciclo de trabalho |
| `AGENTS.md` | Regras sempre ativas |
| `.github/agents/` | Papeis dos agentes |
| `.github/skills/` | Metodo detalhado |
| `docs/` | Doutrina e moldes neutros |
| `docs/contratos/` | Schemas e moldes de contratos executaveis |
| `scripts/` | Validacoes reutilizaveis |
