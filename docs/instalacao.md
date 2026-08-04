# Preparacao do ciclo

O master distribui manuais-base aprovados e moldes. Trabalho de jornada
acontece em uma worktree criada a partir do master validado.

## Pre-requisitos da worktree

1. Leia o manual global, modalidade, etapa e contexto aplicaveis no master.
2. Crie um mapa por modalidade em `docs/mapas/<modalidade>.md` na worktree.
3. Confirme um manual por contexto usado em `docs/contextos/<contexto-id>.md`.
4. Adicione referencias reais nomeadas como
   `ref-<modalidade>-<tela>-<contexto-id>`.
5. Confirme topologia aprovada e bibliotecas IDS conectadas.

Uma worktree nova reutiliza somente a base documental aprovada. Ela nao
reutiliza mapas, referencias, node IDs, manifestos, contratos ou
evidencias de rodadas anteriores.

## Pagina Figma

Cada etapa mantem referencias cruas em secoes internas e templates
aprovados em secao separada. O Montador trabalha apenas em
`_verificacao-<etapa>`, onde ficam rascunhos, componentes locais e
previews sem prototipo.

Antes de abrir o Montador, o Analista entrega um contrato consolidado e
o designer o aprova explicitamente. Antes de promover, o Validador emite
veredito favoravel.
