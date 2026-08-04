# Comece aqui

Este repositorio distribui uma base documental aprovada e um metodo para
manter uma biblioteca Figma de credito consignado. O `master` contem
conhecimento versionado, mas nao contem jornadas concretas, referencias,
IDs, contratos de rodada ou mapas preenchidos.

## Papeis

| Comando | Papel | Responsabilidade |
| --- | --- | --- |
| `/consignado-base` | Analista | Cura a base documental em worktree dedicada, sem Figma |
| `/consignado-contexto` e `/consignado-analise` | Analista | Usa a base, analisa referencias e consolida proposta da rodada |
| `/montador` | Montador | Cria componentes locais e templates aprovados |
| `/validador` | Validador | Audita e emite veredito |
| `operador` | Operador | Coordena leituras paralelas e estado temporario |
| `/consignado-aprendizado` | Aprendiz | Registra receitas observadas |
| `/figma-referencias` | Preparador de evidencia | Cria referencias cruas somente por pedido explicito |

## Ordem de trabalho

1. Confirme que o MCP Figma esta conectado. Sem ele, trabalhe apenas nos
   documentos.
2. Valide a base documental do master com os scripts do repositorio.
3. Quando for atualizar conhecimento, crie uma worktree de curadoria e
   execute `/consignado-base`. O agente so escreve manuais-base depois de
   aprovacao humana; a promocao ao master e manual.
4. Para uma rodada, crie uma worktree nova a partir do master. Ela recebe
   os manuais aprovados, mas nao recebe artefatos, mapas, referencias,
   IDs ou evidencias de rodadas anteriores.
5. Na worktree da rodada, adicione referencias reais e inicie
   `/consignado-contexto` somente para lacunas, conflito ou proposta de
   mapa. Ele nao reescreve os manuais-base.
6. Execute `/consignado-analise`. O Analista entrega prova de reacoes
   e estrutura, mapa, contratos logicos, mapa IDS, plano de variaveis
   e proposta de componentes locais.
7. O designer aprova o contrato consolidado. Sem essa aprovacao, o
   Montador nao cria componente local nem template.
8. O Montador cria primeiro componentes locais que tenham evidencia de
   reutilizacao aprovada em duas ou mais telas ou casos. Composicao de
   uso unico fica como `local-layout`.
9. O Montador resolve IDs temporarios, roda `validateRound` e cria
   rascunhos em `_verificacao-<etapa>`. Depois gera previews temporarios.
   Nao inicia tela por clone.
10. O Validador audita arvore, IDS, geometria, bindings, modes,
    comportamento e visual. Para contrato v2, ele prova Slot e tipografia
    no MCP, guarda relatorios literais da rodada e roda `validateRound` de
    pre-promocao. Sem releitura Figma, o veredito e `NAO_VERIFICAVEL`.
11. Somente um veredito favoravel permite promover para
    `<modalidade>/<etapa>/tpl-<tela>`.

## Documentos da base e da worktree

- `docs/manual-credito-consignado.md`: regras globais aprovadas da base.
- `docs/modalidades/<modalidade>.md`: regras estruturais aprovadas da base.
- `docs/etapas/<etapa>.md`: definicao canonica aprovada da base.
- `docs/contextos/indice.md` e `docs/contextos/<contexto-id>.md`: clusters
  conhecidos, rotulo atual, origem, modalidades ativas e regras locais.
- `docs/mapas/<modalidade>.md`: etapa, tela, caso de uso, presenca por
  contexto, reacao/caminho, template selecionado, mecanismo da diferenca
  e origem da regra. Existe somente na worktree da rodada.
- `docs/contratos/`: contratos logicos de tela e jornada. Node IDs da
  rodada ficam em `.designops/runs/`, nunca nesses documentos.

Referencias seguem `ref-<modalidade>-<tela>-<contexto-id>`.
Templates, variaveis e componentes locais nao carregam contexto no nome.

O mapa combina as quatro camadas anteriores. Ele nao substitui manual
global, manual da modalidade, catalogo da etapa ou manual de contexto.

## Validacao de consumo

Uma Section de jornada usa uma unica collection de conteudo da
modalidade, aplica o mode de contexto uma vez e deixa os templates
descendentes herdarem. Collections estruturais do IDS podem coexistir.

## O que nao fazer

- Nao registrar regra de negocio sem aprovacao humana ou evidencia
  documental.
- Nao criar mapa concreto, referencia, contrato de rodada ou estado em
  `.designops/runs/` no master.
- Nao usar referencia como motivo de regra local.
- Nao criar componente local sem duas reutilizacoes previstas no
  contrato aprovado.
- Nao promover sem veredito favoravel do Validador.
- Nao inserir diretamente em `INSTANCE`. Conteudo adicional so entra em
  `SlotNode` nativo confirmado, com property publica `SLOT` declarada e
  `limitViolations` vazio.
