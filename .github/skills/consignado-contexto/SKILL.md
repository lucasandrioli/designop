---
name: consignado-contexto
description: Conduz a conversa inicial de uma etapa, transforma apenas afirmacoes aprovadas do designer em catalogo, manuais de convenio e mapa de fluxo, sem inferir regra pelas telas. Use antes de consignado-analise quando os documentos ainda nao existirem.
user-invocable: true
disable-model-invocation: true
---

# Contexto guiado da etapa

Use esta skill quando o designer tiver referencias no Figma, mas ainda
nao tiver os documentos minimos da etapa e dos convenios. Ela reduz o
trabalho de preparar manuais sem relaxar a regra de que documentos
aprovados sao a verdade de negocio.

Esta nao e uma analise de template. Nao propoe variavel, property,
variant, especializacao, arvore-alvo, componente IDS ou montagem.

Nao use esta skill apenas porque a conversa e nova. Primeiro procure o
catalogo, o mapa e os manuais da etapa citada. Se eles existirem, a
rodada deve recuperar esse contexto e seguir no papel pedido. Contexto
guiado e somente a porta para uma etapa ainda nao documentada.

## Limites do modo

- Figma e somente leitura.
- Prototipo e tela mostram fatos, nunca a razao de negocio.
- O designer pode explicar em linguagem comum. Nao peca lista de textos,
  propriedades, componentes ou node IDs.
- O Analista devolve o rascunho primeiro na conversa. Sem aprovacao
  explicita, nao edita arquivo algum.
- Depois da aprovacao, pode escrever somente catalogo de etapa, manuais
  de cluster e mapa de fluxo. Nao cria, edita ou renomeia nada no Figma.
- Ao terminar o registro, encerra esta rodada. A analise comeca depois,
  em `/consignado-analise`.

## Como abrir a conversa

Comece como uma conversa de trabalho. Use o que o designer ja forneceu,
inclusive link e nomes de clusters. Diga que voce vai percorrer as
referencias e que ele nao precisa descrever tela por tela.

Peca somente a primeira informacao que a referencia nao pode revelar.
Normalmente sera o nome e limite da etapa, a modalidade do caminho ou a
regra que explica uma diferenca importante entre convenios. Uma boa
abertura e:

```text
Oi, vamos registrar o contexto da etapa. Eu vou olhar as referencias e
os prototipos para entender o caminho; voce nao precisa me explicar a
interface. Para comecar, me conte em poucas palavras o que esta etapa
resolve para a pessoa e em qual momento da jornada ela comeca e termina.
Depois eu te devolvo um rascunho curto dos manuais para voce aprovar.
```

Se o contexto ja estiver na conversa, nao repita a pergunta. Diga o que
entendeu e faca somente a proxima pergunta necessaria.

## Sequencia

### 1. Ler o que o Figma prova

Antes de fazer qualquer pergunta de negocio, conclua o inventario da
pagina. O criterio minimo e uma lista verificavel de todas as secoes
`_ref-<cluster>` encontradas, com ao menos um caso de uso ou a ausencia
dele para cada secao. Sem essa lista, o contexto ainda esta incompleto.

#### Quando a leitura vier truncada

Uma mensagem como `Output too large` ou `Saved to: <caminho>` nao e
evidencia parcial utilizavel. Ela e um bloqueio de inventario.

1. Use a ferramenta `read` para abrir o artefato salvo pelo retorno do
   Figma e recuperar a estrutura completa da pagina.
2. A partir da lista completa de secoes, leia cada `_ref-<cluster>` por
   node ID e inventarie suas telas e reacoes.
3. Se o artefato nao puder ser lido, faca uma chamada Figma de leitura
   que enumere secoes pelo nome. Se essa chamada tambem nao estiver
   disponivel, pare e informe `NAO VERIFICAVEL: nao foi possivel listar
   todas as secoes da pagina`.

Nunca conclua a pagina pela previa, nunca tente node IDs vizinhos e
nunca afirme que uma secao nao existe sem ter enumerado a pagina
completa. O parametro `m=dev` no link Figma nao invalida a leitura:
ele apenas abre o mesmo arquivo em Dev Mode.

Inventarie, sem interpretar regra:

- secoes `_ref-<cluster>`;
- telas por caso de uso;
- conexoes do prototipo, incluindo idas a canais externos e retornos;
- telas que parecem fronteira com outra etapa;
- diferencas factuais entre os clusters.

Rotule esse material como `Fato observado no Figma`.

### 2. Capturar o que so o designer sabe

Conduza uma pergunta de cada vez. Prioridade:

1. etapa, objetivo, inicio e fim;
2. modalidade e caso de uso do fluxo;
3. quais clusters participam;
4. regra que explica cada diferenca relevante;
5. origem conhecida da regra, quando houver.

Quando o designer nao souber, use `[CONFIRMAR]`. Nao complete com uma
suposicao baseada no nome de tela, no texto ou no numero de passos.

### 3. Mostrar rascunho para aprovacao

Antes de escrever, entregue um rascunho simples, em duas partes.

Primeiro, use linguagem de negocio:

```text
Entendi assim:

- Etapa: <nome e objetivo>.
- Limite: <onde comeca e termina>.
- Modalidade: <valor ou [CONFIRMAR]>.
- <cluster A>: <regra dita pelo designer>.
- <cluster B>: <regra dita pelo designer>.
```

Depois, liste apenas os fatos relevantes que vieram do Figma e as
lacunas `[CONFIRMAR]`. Termine perguntando se o texto representa o que o
designer quis dizer. Nao mostre mecanismo tecnico nesta fase.

### 4. Registrar somente apos aprovacao

Aprovacao precisa ser clara, por exemplo:

```text
APROVO o contexto e o texto dos manuais da etapa <etapa>.
```

Depois dela, crie ou atualize:

1. `docs/etapas/<etapa>.md`, com objetivo, limite e regras
   compartilhadas que o designer aprovou;
2. `docs/clusters/<cluster>.md`, com modalidades ativas, presenca da
   etapa e regras locais aprovadas. Nao transcreva interface;
3. `docs/mapa-fluxo-<escopo>.md`, com os caminhos e presencas que o
   prototipo mostrou, apontando regras pelo identificador do manual.

Regra aprovada pelo designer recebe origem informada por ele. Se a
origem nao foi dada, escreva `Origem: [CONFIRMAR]`, nao invente uma.
Fato de prototipo pode registrar a fonte como `referencia Figma`, mas
nunca como origem de negocio.

## Fechamento

Explique, sem jargao, quais documentos foram registrados e que eles
agora sao a fonte oficial para a proxima rodada. Indique que o proximo
comando e `/consignado-analise`, que vai comparar as referencias sem
pedir novamente as regras ja documentadas.
