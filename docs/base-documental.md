# Governanca da base documental

## Finalidade

O `master` distribui conhecimento aprovado do credito consignado e seus
moldes. Uma rodada nasce sem referencias, IDs, manifestos, contratos ou
mapas concretos, mas consulta os manuais-base antes de abrir uma lacuna.

## Conteudo distribuido

- Manual global em `docs/manual-credito-consignado.md`.
- Manuais das modalidades PCon, refin e portabilidade.
- Manuais dos produtos opcionais em `docs/produtos/`.
- Catalogos das tres etapas canonicas.
- Indice e manuais individuais dos clusters conhecidos.

Mapas concretos permanecem em worktrees de rodada. Nenhum documento do
`master` guarda node IDs, file keys, referencias `ref-*` ou estado de
`.designops/runs/`.

## Curadoria e atualizacao

Use `/consignado-base` em uma worktree de curadoria. A conversa humana
e fonte de `REGRA CONFIRMADA`; uma fonte escrita aprovada vira `REGRA
DOCUMENTADA`. O agente apresenta o rascunho completo e so escreve a
base depois de aprovacao humana explicita. A pessoa responsavel revisa
e faz o merge manual para o `master`.

Uma rodada pode propor mudanca de regra, mas nao atualiza a base por
conta propria. A proposta volta para uma curadoria aprovada.

## Finalidade dos manuais de produto

Os manuais em `docs/produtos/` registram os produtos opcionais do
credito consignado como familia documental oficial. Eles servem para
organizar sinais de produto, pendencias e lacunas de analise sem criar
novas etapas, modalidades, contextos ou regras de producao.

## Classificacao exploratoria

`SINAL DE PRODUTO / OBJETO DE ANÁLISE` e uma classificacao exploratoria
usada na fase de piloto para manter o tema documentado durante a
investigacao. Ela nao e regra de producao, nao fecha comportamento final
e nao bloqueia a analise quando faltarem detalhes formais.
