---
name: consignado-montagem
description: Monta componentes locais e templates a partir de contrato aprovado, sem iniciar por clone.
user-invocable: true
disable-model-invocation: true
---

# Montagem

Leia AGENTS.md, `docs/contrato-papeis.md`, topologia, manual global,
manual da modalidade, catalogo da etapa, mapa, manuais de contexto e
contrato consolidado. Na primeira resposta, diga o que vai construir,
confirme a aprovacao que esta usando e informe o rascunho que entregara
ao Validador. Pare sem aprovacao humana explicita do contrato ou com
item bloqueante em [CONFIRMAR].

Antes de escrever, execute `validateRound.js` com os contratos logicos,
o manifesto aprovado, `.designops/runs/<rodada>/resolvido.json` e
`.designops/runs/<rodada>/componentes-locais.json`. Antes de construir cada
rascunho, execute `validateCompositionContract.js`.
Se qualquer gate reprovar, explique a evidencia faltante e nao escreva
no Figma.

Fase A: valide a evidencia de duas reutilizacoes previstas e crie
somente componentes locais aprovados em _componentes-locais/<dominio>/
<nome>. IDS tem prioridade. Uso unico fica como local-layout.

Fase B: crie _rascunho-<modalidade>-<etapa>-<tela> em
_verificacao-<etapa>. Use Conteudo - <Modalidade> e variaveis
<etapa>/<tela>/<papel>. Crie previews por contexto-id; somente o
wrapper recebe mode explicito. Cada papel vem do contrato como IDS,
COMPONENTE_LOCAL ou LOCAL_LAYOUT; instancia destacada e imitador local
nunca preenchem um papel por conveniencia.

Nunca insira diretamente em INSTANCE. Conteudo de Slot e permitido apenas
no SlotNode nativo confirmado da instancia IDS, com property publica `SLOT`
declarada no contrato v2. Registre `writtenAt` depois da escrita; a prova
so termina apos releitura MCP, `limitViolations` vazio e relatorio literal
da composicao com `roundId` e IDs reais. Para texto, use
`validateTypographyContract.js`; texto MISTO exige leitura por segmentos.
Modes estruturais do IDS continuam permitidos, mas o mode da collection de
conteudo permanece somente no wrapper de preview.

Depois da escrita e antes de pedir o veredito, salve os relatorios MCP em
`.designops/runs/<rodada>/evidencias-mcp.json` e execute
`validateRound.js --stage pre-promocao --evidence <arquivo>`. Se a
releitura Figma falhar, registre `NAO_VERIFICAVEL`, sem declarar correcao.

Depois de APTO PARA PROMOCAO e validatePromotion aprovado, mova para
a area de templates, renomeie para <modalidade>/<etapa>/tpl-<tela>,
gere carimbo sem contexto e remova previews temporarios.

Antes da publicacao da library, registre para revisao humana que a area
`_componentes-locais` permanece interna. A ferramenta nao trata isso
como prova automatizada.
