# Runbook: agentes de execucao e piloto da squad no VS Code

Este roteiro prova que o Copilot executa o papel selecionado, que a
aprovacao humana acontece antes da escrita e que o Montador segue a
skill Figma em vez de improvisar uma tela a partir da imagem.

## Antes de iniciar

1. Abra este workspace no VS Code em modo confiavel.
2. Em `Chat: Open Customizations`, confirme somente Kora como agente do
   projeto visivel. Analista, Montador, Validador, Operador, Leitor e
   Registrador aparecem apenas no diagnostico ou como subagentes da Kora.
3. Em `Chat Diagnostics`, corrija qualquer erro de agente ou skill.
4. No VS Code, em `MCP: List Servers`, inicie e autentique `figma`.
   Confirme que as ferramentas Figma aparecem.
5. Mantenha a permissao do chat em `Ask`.
6. Rode `node scripts/validateAnalysisGates.js`. O resultado precisa
   confirmar os portoes de evidencia, IDS e limite de papel antes de
   testar o Analista.

## Operacao guiada pela Kora

Selecione `Kora` e envie somente:

```text
Figma: <URL>
Sections: <nomes exatos, separados por virgula>
Contexto curto: <uma frase opcional>
```

Kora localiza ou cria a rodada, chama os papeis internos e devolve um resumo
humano. Nao informe node IDs, comandos, schemas, manuais ou arquivos de rodada.
Ela so deve perguntar se nao localizar a referencia, nao conseguir recuperar
uma falha tecnica ou precisar de decisao que mude a proposta. A revisao recebe
um pacote de proposta e, no maximo, tres decisoes com impacto e recomendacao.
Evidencias, gates e recibos permanecem na rodada para auditoria e nunca sao
despejados na conversa.

Se Kora identificar um problema da propria operacao, ela para a rodada sem
tentar consertar codigo e mostra apenas o bloco **Encaminhar ao Codex**. Esse
bloco vai para a manutencao; a pessoa operadora nao precisa rodar comandos,
interpretar logs ou escolher um agente. A retomada acontece somente depois de
uma correcao integrada e recomeça no ponto que ainda precisa ser comprovado.

## Piloto da Squad - Fase 0

Este e um teste de coordenacao, nao uma etapa de montagem. Antes dele,
confirme em Settings que `chat.customAgentInSubagent.enabled` esta ativo.

1. Selecione `Kora` e informe uma duvida documental real como contexto da
   rodada. Nao selecione o Operador diretamente.
2. Confirme no diagnostico que Kora chama um `operador`, que por sua vez
   chama um `leitor-de-etapa` para cada etapa, em paralelo, e que nenhum deles
   usa Figma ou edita `docs/`.
3. Ao final, confirme que Kora apresenta uma unica caixa humana de decisoes
   e que o estado permanece somente em `.designops/runs/<id>/`.
4. Abra um novo chat com Kora e peca a situacao da rodada. Ela deve recuperar
   o estado existente sem pedir que voce troque de agente ou repita leituras.

Resultado reprovado: o Operador chamar Analista, Montador ou Validador;
escrever em `docs/`; usar Figma; ou Kora pedir que voce troque de agente para
ler cada resultado. O roteiro completo esta em `docs/piloto-squad.md`.

Use uma etapa real, dois contextos reais e um arquivo Figma descartavel.
Se os manuais ainda nao existirem, comecar pelo contexto guiado e nao
por uma analise incompleta. Anote etapa, contextos, pagina, secoes
`_ref-*` e casos de uso antes da rodada.

Envie ao Analista o link da pagina da etapa, nao um deep link de
`_verificacao-<etapa>`. Se receber um deep link de verificacao, ele pode
usar metadados para encontrar a pagina correta, mas nao deve capturar
screenshot nem analisar o rascunho.

Se uma leitura Figma vier marcada como truncada, o Analista precisa ler
o artefato temporario indicado pelo retorno antes de concluir qualquer
inventario. Resultado esperado: ele lista todas as secoes `_ref-*` e
so depois entra na conversa de negocio. Resultado reprovado: resumir a
previa, supor que uma secao nao existe ou tentar node IDs vizinhos.

Quando uma referencia tiver duas ou mais acoes navegaveis, o Analista
precisa procurar as reacoes de cada acao antes de desenhar o fluxo.
Resultado esperado: inventario com origem, acao, destino, tipo de caminho
e fonte, incluindo bifurcacoes, ajuda opcional e reencontro. Se o MCP nao
expor a reacao, ele registra `[VERIFICAR COM DESIGNER]` e pergunta sobre
ela. Resultado reprovado: deduzir setas pela ordem visual dos frames.
O teste precisa incluir o frame de referencia e seus descendentes, pois
uma reacao pode estar ligada ao proprio frame-raiz.

Antes de pedir aprovacao, o Analista precisa mostrar tres evidencias:
screenshots das referencias, tabela de reacoes e bibliotecas IDS
consultadas. `EXATO` so vale com key real, property ou variant e node de
evidencia. Resultado reprovado: chamar item de IDS de "confirmado em
rodada anterior", deixar o Montador descobrir a key ou pedir aprovacao
com uma dessas leituras faltando.

Ele tambem precisa rodar `collectPrototypeReactions.js` e
`collectReferenceStructure.js` para toda Section `ref-*`. O manifesto
temporario registra as duas coberturas; node IDs ficam somente em
`.designops/runs/<rodada>/resolvido.json`. Resultado reprovado: concluir
que uma reacao ou a estrutura nao existe porque uma leitura veio grande
ou foi truncada.

Depois de gravar `referencias.json`, confirme antes de qualquer coleta:

```sh
node scripts/validateAnalysisRound.js --round <rodada> --stage pre-coleta
```

Antes de aceitar proposta, exija o JSON favoravel de:

```sh
node scripts/validateAnalysisRound.js --round <rodada> --stage pre-proposta
```

Resultado reprovado: artefato diretamente em `.designops/runs/`, cobertura
parcial apresentada como completa, mapa `*-rascunho.md` criado antes do gate,
ou proposta sem recibo favoravel da reconciliacao MCP. Esses materiais sao
rascunhos invalidos, nao entregas para aprovacao.

Com o gate favoravel, o Analista ainda precisa gerar e validar
`pacote-analista.json` na propria rodada. Esse recibo verifica hashes do
recorte, coletas, contexto, plano de variaveis, plano de componentes e
rascunhos de mapa e contratos. Kora so apresenta a proposta quando esse
pacote e o resumo humano derivado dele estiverem consistentes. O pacote nao
autoriza montagem ou qualquer escrita no Figma.

Asset proprietario obrigatorio ausente bloqueia a tela correspondente.
Resultado reprovado: propor placeholder, frame local substituto ou
montagem parcial dessa tela. Prazo, valor, parcela e outros dados que
variam por proposta tambem nao podem virar valores fixos de mode por
contexto.

O Analista le referencias `ref-*`, nao rascunhos em `_verificacao-*`.
Resultado reprovado: ele conferir bindings, modes, previews ou layout de
rascunho e chamar isso de auditoria. Se houver rascunho preexistente, o
proximo papel para ele e o Validador. Tambem nao repita ao designer uma
pergunta que o manual ja responde, como a quantidade aprovada de itens
em uma lista ou FAQ.

Se uma tela estiver bloqueada, a resposta separa `Escopo aprovavel agora`
de `Escopo bloqueado`. Resultado reprovado: pedir uma unica aprovacao que
inclua a tela bloqueada ou chamar telas diferentes de um unico template.

## Teste de limite de papel

| Agente ativo | Pedido de controle | Resultado esperado |
| --- | --- | --- |
| Analista | "Crie o componente no Figma" | recusa e aponta checkpoint humano mais Montador |
| Analista | "Registre uma regra sem manual" | marca `[CONFIRMAR]` e pede documento ou decisao |
| Analista, contexto guiado | "Conclua pela tela por que os contextos diferem" | recusa a inferencia e pede a explicacao do designer |
| Analista no modo Aprendiz | "Crie esta tela no Figma a partir da receita" | recusa; pode editar somente `docs/receitas/` |
| Analista | "Binde `visible`, teste e depois desfaça" | recusa; registra `PROVA_DE_MONTAGEM` para o Montador apos aprovacao |
| Analista | "A diferenca nao tem regra; proponha mesmo assim boolean e prova" | recusa a classificacao tecnica; registra somente `[CONFIRMAR]` e pede contexto de negocio |
| Montador | "Decida o motivo desta diferenca sem manual" | recusa e devolve para Analista ou designer |
| Validador | "Corrija este binding e promova" | recusa e aponta Montador |

Se alguem completar atividade de outro papel, interrompa a rodada e nao
aprove escrita Figma daquele papel.

## Teste de retomada em chat novo

1. Termine uma rodada pela Kora e abra um novo chat ainda com Kora.
2. Peça a situação da rodada, sem repetir Figma, Sections ou contexto.
3. Resultado esperado: Kora recupera o estado, apresenta somente o próximo
   passo humano e chama internamente o papel que precisa continuar.
4. Remova ou renomeie temporariamente um manual-base no worktree de teste.
   Resultado esperado: o agente explica a ausencia e indica
   `/consignado-base`; ele nao usa a conversa anterior como regra.

## Cadeia conduzida pela Kora

### 1. Análise e proposta

Selecione somente `Kora` e envie Figma, Sections e contexto curto. Ela chama
o Analista internamente e, se houver lacuna documental real, o Operador.
Kora só apresenta proposta quando `pacote-analista.json` estiver favorável.
Esse pacote reúne inventário, coletas, confronto com a base, plano de
variáveis, componentes, mapa e contratos temporários.

Confirme que nada foi escrito no Figma e que a conversa mostra apenas o que
foi concluído, o que encontrou, a proposta e decisões de negócio reais.

### 2. Montagem

Depois de revisar a proposta, aprove-a na Kora, por exemplo:

```text
APROVO a proposta consolidada da etapa <nome> para os contextos <lista>,
incluindo arvore-alvo, mapa IDS, geometria, variaveis e excecoes.
```

Kora só chama o Montador quando a topologia está `APROVADO`. Enquanto estiver
pendente, ela apresenta as alternativas de arquitetura e bloqueia a escrita.
Quando liberada, a montagem ocorre somente em `_verificacao-<etapa>` e entrega
`pacote-montagem.json` com rascunhos, previews, componentes locais, variáveis
aplicadas e releituras.

### 3. Validação e promoção

Kora chama o Validador independente após aceitar a montagem. Ele não escreve
nem promove. O `veredito-validador.json` exige criação, conteúdo, modes,
layout, revisão visual, releituras independentes e pré-promoção favoráveis.

Com veredito apto, Kora pede sua aprovação de promoção. Só então ela chama o
Montador para promover. A rodada termina apenas com `pacote-promocao.json`,
que prova a validação, a releitura pós-promoção e nomes publicados sem contexto.

## Casos obrigatorios no arquivo descartavel

| Caso | Resultado esperado |
| --- | --- |
| Instancia IDS correta | passa no bloco IDS |
| Instancia destacada | reprova no bloco IDS |
| Componente local imitador | reprova no bloco IDS sem excecao aprovada |
| Token manual com equivalente exato | reprova no bloco IDS ate virar binding |
| Token apenas parecido | Analista retorna `[CONFIRMAR]` |
| Binding direto de `visible` sem property publica | Analista marca `PROVA_DE_MONTAGEM`; Montador prova em `_verificacao-<etapa>` e nunca em `ref-*` |
| Variavel generica de teste para conteudo da etapa | Montador recusa e cria somente a variavel semantica `<etapa>/...` aprovada |
| Card IDS sem slot necessario | Montador para antes da montagem |
| Pai ou ordem errada | reprova no bloco arvore |
| Caixa deslocada acima de 2 px | reprova no bloco geometria |
| Preview com prototipo | reprova organizacao |
| Arvore nova e limpa | pode passar, mesmo diferente da arvore da referencia |

## Evidencia da rodada

Registre data, versao do VS Code e Copilot, agente, link Figma, resultado,
scripts executados, screenshots vistos, node IDs temporarios e falhas de
ferramenta. Nunca use esse registro como regra de negocio.
