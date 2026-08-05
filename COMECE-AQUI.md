# Comece aqui

Este repositorio distribui uma base documental aprovada e um metodo para
manter uma biblioteca Figma de credito consignado. O `master` contem
conhecimento versionado, mas nao contem jornadas concretas, referencias,
IDs, contratos de rodada ou mapas preenchidos.

## Papeis

| Comando | Papel | Responsabilidade |
| --- | --- | --- |
| `Kora` | Pessoa operadora | Conduz uma rodada, evidencia cada passagem e pede somente decisoes humanas legitimas |
| Internos da Kora | Analista, Montador, Validador, Operador, Leitores e Registrador | Executam tarefas especializadas sem exigir troca de agente |

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
5. Abra Kora e informe Figma, etapa, momento, telas e anexos, modalidades,
   Sections e contexto curto. Ela preserva esse recorte, compara as variacoes
   e mostra uma proposta somente quando a evidencia estiver completa.
6. O designer aprova o contrato consolidado. Sem essa aprovacao, Kora nao
   chama o Montador.
7. Kora conduz montagem e validacao. O Validador continua independente e
   nenhum resultado favoravel e inferido sem releitura Figma.
8. Kora pede a aprovacao de promocao apenas depois do veredito favoravel.
   So entao o template pode seguir para `<modalidade>/<etapa>/tpl-<tela>`.
9. Se houver incidente da operacao, Kora interrompe a rodada e prepara o
   encaminhamento para manutencao. Depois da correcao integrada, ela retoma
   somente a fase afetada e repete as verificacoes, sem restaurar aprovacoes.
10. Quando os momentos de uma etapa ja estiverem promovidos, Kora pode montar
    um prototipo de verificacao com as conexoes da etapa em `_verificacao-`.
    Esse prototipo nao cria outro ativo oficial da biblioteca.

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
