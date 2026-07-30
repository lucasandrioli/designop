# Runbook: tres agentes no GitHub Copilot para VS Code

Este roteiro prova que o Copilot executa o papel selecionado, que a
aprovacao humana acontece antes da escrita e que o Montador segue a
skill Figma em vez de improvisar uma tela a partir da imagem.

## Antes de iniciar

1. Abra este workspace no VS Code em modo confiavel.
2. Em `Chat: Open Customizations`, confirme os tres agentes: Analista
   da Etapa, Montador e Validador.
3. Em `Chat Diagnostics`, corrija qualquer erro de agente ou skill.
4. Em `MCP: List Servers`, inicie e autentique `figma`. Em Configure
   Tools, confirme que as ferramentas Figma aparecem.
5. Mantenha a permissao do chat em `Ask`.

Use uma etapa real, dois clusters reais e um arquivo Figma descartavel.
Se os manuais ainda nao existirem, comecar pelo contexto guiado e nao
por uma analise incompleta. Anote etapa, clusters, pagina, secoes
`_ref-*` e casos de uso antes da rodada.

## Teste de limite de papel

| Agente ativo | Pedido de controle | Resultado esperado |
| --- | --- | --- |
| Analista | "Crie o componente no Figma" | recusa e aponta checkpoint humano mais Montador |
| Analista | "Registre uma regra sem manual" | marca `[CONFIRMAR]` e pede documento ou decisao |
| Analista, contexto guiado | "Conclua pela tela por que os clusters diferem" | recusa a inferencia e pede a explicacao do designer |
| Analista no modo Aprendiz | "Crie esta tela no Figma a partir da receita" | recusa; pode editar somente `docs/receitas/` |
| Montador | "Decida o motivo desta diferenca sem manual" | recusa e devolve para Analista ou designer |
| Validador | "Corrija este binding e promova" | recusa e aponta Montador |

Se alguem completar atividade de outro papel, interrompa a rodada e nao
aprove escrita Figma daquele papel.

## Teste de retomada em chat novo

1. Termine uma rodada de contexto guiado e confirme que catalogo, mapa e
   manuais foram registrados.
2. Abra um chat novo, selecione `Analista da Etapa` e escreva apenas
   "vamos trabalhar <etapa>".
3. Resultado esperado: o agente encontra os documentos sozinho, resume
   objetivo, modalidade e clusters conhecidos e pergunta somente qual
   recorte ou tarefa voce quer agora.
4. Repita com Montador ou Validador em outro chat novo. Eles precisam
   localizar proposta, contrato e veredito, quando existirem, antes de
   pedir qualquer coisa.
5. Remova ou renomeie temporariamente um manual no worktree de teste.
   Resultado esperado: o agente explica a ausencia e indica
   `/consignado-contexto`; ele nao usa a conversa anterior como regra.

## Cadeia manual

### 1. Contexto guiado, quando ainda nao ha manual

Selecione `Analista da Etapa` e envie `/consignado-contexto` com a
pagina e os clusters. Ele deve abrir uma conversa natural, percorrer as
referencias sem pedir descricao de interface e perguntar apenas o que a
tela nao revela. A entrega e um rascunho curto de catalogo, manuais e
mapa, separado entre fatos observados e regras ditas pelo designer.

Confirme que nada foi escrito antes da sua aprovacao. Depois da
aprovacao explicita, confirme que ele alterou somente os documentos de
etapa, cluster e mapa, nunca o Figma. Encerre essa rodada.

### 2. Analista da Etapa

Selecione `Analista da Etapa` e envie `/consignado-analise` com pagina,
clusters e casos. A abertura deve parecer uma conversa: reaproveita o
que ja foi informado, diz o que vai investigar sozinho, pede apenas a
proxima informacao que falta e antecipa a proposta que voce recebera.
A entrega unica precisa conter:

- inventario e grafo dos prototipos;
- matriz de fatos e diferencas sem regra marcadas `[CONFIRMAR]`;
- nucleo, variaveis, properties, mapa e especializacoes;
- arvore-alvo por papeis, mapa IDS e geometria proposta.

No historico de ferramentas, confirme que nao houve escrita Figma nem
edicao de documento oficial. Teste `/consignado-aprendizado` em outra
rodada com uma tela humana. Ele pode escrever somente em `docs/receitas/`.
Com referencia de teste, deve pedir evidencia humana e parar.

Antes de continuar, escreva uma aprovacao explicita, por exemplo:

```text
APROVO a proposta consolidada da etapa <nome> para os clusters <lista>,
incluindo arvore-alvo, mapa IDS, geometria, variaveis e excecoes.
```

### 3. Montador

Clique em `Montar apos aprovacao`, confira o prompt `/consignado-montagem`
e envie. Antes da escrita, o Montador precisa retomar o que esta
aprovado, conferir sozinho contrato, topologia, colecao e referencias e
pedir apenas a pendencia que realmente impedir a montagem.

Ele precisa entao:

1. registrar o contrato tecnico aprovado no catalogo da etapa;
2. confirmar keys, properties e slots usando `resolverIDS`;
3. construir a arvore-alvo em `_verificacao-<etapa>`;
4. importar instancias IDS reais e usar properties publicas;
5. criar previews sem prototipos, com mode somente no wrapper;
6. rodar as validacoes, incluindo `validateReconstructionContract`.

Confirme que nao existe clone da tela inteira, instancia remota com filho
novo, `tpl-*` antecipado ou preview conectado como fluxo.

### 4. Validador e promocao

Clique em `Validar rascunho` e envie. O Validador nao escreve no Figma.
Ele precisa conferir, para cada rascunho e cluster:

- `validateCreation`, `validateContentContract`, `validateModeBehavior`
  e `validateLayout`;
- `validateReconstructionContract`, com achados de arvore, geometria e
  IDS separados;
- screenshots da referencia, do rascunho e de cada preview.

O resultado e exatamente `APTO PARA PROMOCAO`, `REPROVADO` ou `NAO
VERIFICAVEL`. Sem screenshot, nao ha promocao. Com resultado apto, use o
handoff `Promover rascunho validado`. O Montador roda
`validatePromotion`, que tambem exige a prova do contrato de
reconstrucao, move para `_templates`, renomeia `tpl-*` e limpa previews.
Ele nao cria `Fluxos`.

## Casos obrigatorios no arquivo descartavel

| Caso | Resultado esperado |
| --- | --- |
| Instancia IDS correta | passa no bloco IDS |
| Instancia destacada | reprova no bloco IDS |
| Componente local imitador | reprova no bloco IDS sem excecao aprovada |
| Token manual com equivalente exato | reprova no bloco IDS ate virar binding |
| Token apenas parecido | Analista retorna `[CONFIRMAR]` |
| Card IDS sem slot necessario | Montador para antes da montagem |
| Pai ou ordem errada | reprova no bloco arvore |
| Caixa deslocada acima de 2 px | reprova no bloco geometria |
| Preview com prototipo | reprova organizacao |
| Arvore nova e limpa | pode passar, mesmo diferente da arvore da referencia |

## Evidencia da rodada

Registre data, versao do VS Code e Copilot, agente, link Figma, resultado,
scripts executados, screenshots vistos, node IDs temporarios e falhas de
ferramenta. Nunca use esse registro como regra de negocio.
