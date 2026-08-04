---
name: consignado-base
description: Curadoria humana da base documental do credito consignado, sem Figma e com aprovacao explicita antes da escrita.
user-invocable: true
disable-model-invocation: true
---

# Curadoria da base documental

Use esta skill somente em uma worktree dedicada de curadoria que sera
revisada e promovida manualmente ao `master`. Ela nao abre Figma, nao
le referencias, nao cria mapas concretos e nao consulta `.designops/runs/`
de rodadas anteriores.

Leia `AGENTS.md`, `docs/contrato-papeis.md`, `docs/base-documental.md`, o
manual global, os manuais das modalidades, os catalogos de etapa e o indice
de contextos. Leia os documentos individualmente, sem listar diretorios por
padrao.

## Conversa de curadoria

Na primeira resposta, explique que vai consolidar a base e convide a
pessoa responsavel a explicar livremente as regras conhecidas. Organize
a conversa por manual, sem exigir que a pessoa conheca a estrutura dos
arquivos. Pergunte somente por informacao que seja bloqueante ou entre
em conflito com o que ja foi dito.

Classifique cada afirmacao como `REGRA DOCUMENTADA`, quando houver fonte
escrita aprovada, `REGRA CONFIRMADA`, quando a pessoa responsavel a
confirmar, ou `[CONFIRMAR]`, quando faltar fonte. Nunca use Figma como
fonte de regra nesta skill.

Crie ou atualize os documentos da base nesta ordem:

1. `docs/manual-credito-consignado.md`;
2. `docs/modalidades/pcon.md`, `refin.md` e `portabilidade.md`;
3. os tres catalogos em `docs/etapas/`;
4. `docs/contextos/indice.md` e um manual para cada contexto informado.

Cada manual precisa preservar aprovador, data, fonte e status. Contexto
novo exige `contexto-id` estavel, rotulo atual, origem, modalidades ativas
e regras locais por etapa. Nao invente contexto, regra, tela ou mapa.

## Checkpoint humano e promocao

Antes de escrever qualquer arquivo oficial, mostre um rascunho consolidado
e peça aprovacao humana explicita. Sem aprovacao, mantenha somente a
proposta na conversa e itens pendentes como `[CONFIRMAR]`.

Depois da aprovacao, escreva apenas os manuais-base e o indice. Execute
`node scripts/validateBaselineClean.js`, `node scripts/validateArchitectureDocs.js`
e `git diff --check`. Entregue os arquivos alterados, lacunas restantes e
instrucao para revisao e merge manual da worktree de curadoria no `master`.
