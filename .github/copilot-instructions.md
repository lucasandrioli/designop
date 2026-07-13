# Piloto — Biblioteca Central do Consignado

Projeto de criação e manutenção de uma biblioteca Figma de templates de
telas do crédito consignado (órgãos públicos), consolidando clusters
hoje espalhados em 7+ arquivos, usando agentes + Figma MCP.

Escopo e fronteira do projeto:
- Esta é uma ferramenta de design para design: DesignOps interno do
  time de crédito consignado OP. O produto final são bibliotecas,
  templates e variáveis no Figma, consumidos por designers.
- FORA DE ESCOPO: geração de código de produção, handoff para
  desenvolvimento, Code Connect, export para devs. Não sugira nem
  derive para essas frentes; se o usuário pedir, confirme que é uma
  mudança consciente de escopo antes.

Divisão de trabalho (Camada 1 vigente):
- O DESIGNER constrói as telas de referência (uma por cluster, cruas).
- O agente inventario COMPARA as referências e propõe o schema.
- O designer APROVA o schema.
- O agente variabilizador cria variáveis, binda o template e valida
  equivalência contra as referências.
- O agente validador roda em toda entrega.
- O agente aprendiz roda APÓS cada tela do designer, extraindo receitas
  para docs/receitas/. É o que constrói, ao longo do tempo, a
  capacidade do agente de construir telas no padrão do designer
  (Camada 3, custodiante). Não pule: o conhecimento se perde se as
  telas passarem sem observação.

Regras sempre ativas:
- Antes de construir ou validar um cluster, LEIA docs/clusters/<cluster>.md
  (o manual do convênio): é lá que estão as REGRAS e o PORQUÊ de cada
  divergência. Regra que não está escrita, o agente não conhece: nunca
  infira a razão de uma divergência, pergunte ou marque [CONFIRMAR].
- Taxonomia da lib por etapas macro da jornada (docs/estrutura-lib.md):
  templates publicados como etapa/tpl-nome; seções internas _prefixadas
  (não publicadas); referências cruas sem barra no nome.
- Português brasileiro, tom direto, sem jargão corporativo.
- Nunca usar travessão (em dash) em textos gerados.
- Figma: toda escrita via use_figma exige a skill figma-plugin-api carregada.
  Skills do projeto em .github/skills/ (padrão Agent Skills, funciona
  em Copilot e Claude Code).
- Clusters variam por variáveis (modes); modalidades variam por
  estrutura. Não misturar. O modelo completo (tipos de variação,
  bindings, nomenclatura, validação por mode) está em
  docs/modelo-clusters.md e é NORMATIVO para todos os agentes.
- IDS é fonte única de componentes: nunca recriar o que existe lá.
- Nenhuma tela é entregue sem validação (skill consignado-validacao).
