# Preparacao do ciclo

O master distribui somente moldes neutros. Trabalho real acontece em
uma worktree criada a partir do master validado.

## Pre-requisitos da worktree

1. Manual global do credito consignado aprovado.
2. Catalogos das etapas usadas.
3. Um mapa por modalidade em `docs/mapas/<modalidade>.md`.
4. Um manual por contexto usado em `docs/contextos/<contexto-id>.md`.
5. Referencias reais nomeadas como
   `ref-<modalidade>-<tela>-<contexto-id>`.
6. Topologia aprovada e bibliotecas IDS conectadas.

Uma worktree nova nao reutiliza documentos, referencias, contextos ou
evidencias de rodadas anteriores. Ela inicia pelas referencias reais do
recorte aprovado.

## Pagina Figma

Cada etapa mantem referencias cruas em secoes internas e templates
aprovados em secao separada. O Montador trabalha apenas em
`_verificacao-<etapa>`, onde ficam rascunhos, componentes locais e
previews sem prototipo.

Antes de abrir o Montador, o Analista entrega um contrato consolidado e
o designer o aprova explicitamente. Antes de promover, o Validador emite
veredito favoravel.
