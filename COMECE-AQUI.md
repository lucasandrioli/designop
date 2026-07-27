# Comece aqui

Este repo instala tres agentes que cuidam da parte repetitiva de manter
uma biblioteca de telas do consignado que se adapta por convenio.

Ele chega **vazio de conteudo e cheio de metodo**. Os manuais de
convenio, os docs de etapa e o mapa de fluxo comecam em branco, so com
os moldes (`_template.md`). Isso e proposital: os agentes tem proibicao
explicita de inventar regra de negocio, e a checagem inicial do
comparador PARA e pede o que falta em vez de comecar sem.

O conteudo do laboratorio esta em `laboratorio/`, fora do caminho de
leitura dos agentes. Serve de exemplo e de evidencia. Nao copie de la
para `docs/`: sao convenios ficticios com regras inventadas.

## Os tres agentes

| Comando | Nome | O que faz |
| --- | --- | --- |
| `/comparador` | O Comparador | Le as telas de exemplo de cada convenio e aponta o que muda entre eles. Somente leitura |
| `/montador` | O Montador | Transforma a tela aprovada em template que se adapta por convenio |
| `/validador` | O Revisor | Confere cada entrega: layout quebrado, texto cortado, conteudo faltando |

Um quarto agente, o `aprendiz`, roda depois de cada tela que voce
desenha e vai anotando como voce constroi, em `docs/receitas/`. Ele nao
entrega nada hoje; ele acumula para o Bloco 3.

---

## Ordem de instalacao

Cada passo protege o seguinte. Nao pule.

### Passo 1 — Ambiente. ~1h

1. Baixar este repo e abrir a pasta no VS Code.
2. Conectar o Figma:
   Cmd/Ctrl+Shift+P > "MCP: Add Server" > HTTP >
   URL: https://mcp.figma.com/mcp > id: figma
3. Autenticar com a conta Figma do Itau quando abrir o navegador.
4. Conferir no chat: `/skills` deve listar as skills deste repo, e os
   agentes comparador, montador e validador devem aparecer.
5. Teste de vida: "liste as bibliotecas conectadas neste arquivo Figma",
   passando o link de um arquivo do consignado. Se responder, conectou.

Se travar: o seat do Figma precisa ser Dev ou Full. View/Collab tem
limite de 6 chamadas por MES, inviavel. Resolva isso antes de tudo.

### Passo 2 — Bateria de fumaca. ~3h

NAO construa nada ainda. Rode os 10 itens de `docs/runbook-banco.md`
num arquivo Figma descartavel. E o que prova que o ambiente do banco se
comporta como o laboratorio.

O item 5 (binding em componente complexo do IDS) e o critico:
- PASSOU: siga em frente.
- FALHOU: pare. O desenho do binding muda e precisamos conversar antes
  de construir qualquer coisa.

Anote PASSOU/FALHOU de cada item. Isso vira o anexo tecnico da sua
proposta interna.

### Passo 3 — Escolher o kit minimo

O erro mais provavel aqui e achar que precisa documentar 5 convenios e
4 etapas antes de comecar. Nao precisa. Escolha:

- **1 etapa** (ex: simular e contratar)
- **2 convenios** — nunca 1. Com um so nao existe comparacao, e sem
  comparacao nao ha variacao a descobrir

Detalhe completo do que precisa existir: `docs/instalacao.md`.

### Passo 4 — Preencher o conhecimento (so o humano faz)

Copie os moldes e preencha, **so as regras que tocam a etapa
escolhida** — nao o convenio inteiro:

- `docs/clusters/_template.md` -> `docs/clusters/<convenio>.md`, um por convenio
- `docs/etapas/_template.md` -> `docs/etapas/<etapa>.md`
- `docs/mapa-fluxo-_template.md` -> `docs/mapa-fluxo-<escopo>.md`

Nao precisa estar completo. Precisa estar HONESTO: `[CONFIRMAR]` no que
ainda nao foi validado com produto e juridico e melhor que uma regra
inventada que parece certa. Regra que nao esta escrita, o agente nao
conhece — e ele vai perguntar, nao adivinhar.

### Passo 5 — Preparar o Figma (so o designer faz)

1. Criar o arquivo novo e limpo: "Consignado OP — Lib" (vazio).
2. Adicionar nele as 4 bibliotecas do IDS (Assets > Libraries).
3. Criar as paginas: Referencias, Fluxos, e uma por etapa.
4. Construir as telas cruas da etapa escolhida para o convenio A, na
   pagina Referencias. Instanciando componentes do IDS. Sem variaveis,
   sem componentizar. So a tela, como ela e hoje.
5. Construir as MESMAS telas do convenio B, ao lado.
6. Linkar com prototipo e nomear o starting point ("Caso feliz").

Nao se preocupe com nomenclatura nem com organizacao. Voce declara ao
agente "estas telas sao da etapa X, esta e do convenio A" e ele
normaliza. Tela bagunçada (componente destacado, camada sem nome, sem
auto layout) e esperada e tolerada: auditar isso e trabalho do agente.
O que nao e tolerado e nao existir tela.

---

## O ciclo de trabalho

Daqui em diante isso se repete por etapa e por convenio novo.

1. `/comparador compare as referencias dos dois convenios na etapa X`
   Ele devolve uma tabela: o que muda entre convenios, com o conteudo
   real de cada tela lado a lado, e a proposta de variaveis.
2. **VOCE REVISA e aprova.** Checkpoint obrigatorio, nao pule mesmo que
   pareca obvio. Este e o momento de decisao humana: o agente acha a
   diferenca, mas so voce sabe se ela e regra de convenio ou descuido.
3. `/montador componentize e binde conforme o schema aprovado`
   Ele cria as variaveis, componentiza a tela, conecta tudo e carimba a
   descricao do componente.
4. `/validador valide`
   Layout quebrado, texto cortado, conexoes faltando, consistencia com
   o mapa, em TODOS os convenios.
5. Publicar a lib (acao manual, nao tem API).

### Depois: a manutencao, onde o investimento se paga

- Mudou um texto num convenio? Edite a celula na tabela de variaveis do
  Figma. So isso.
- Entrou convenio novo? Adicione o mode, escreva o manual dele, rode o
  comparador no material novo, preencha os valores.
- O IDS mudou? Rode `/validador`: ele varre o impacto em tudo.

---

## O que NAO fazer

- Nao copie nada de `laboratorio/` para `docs/`. Sao convenios
  ficticios; o agente vai tratar como regra real.
- Nao peca ao agente para criar telas do zero (ainda). Ele nao sabe
  como voce constroi. Isso e o Bloco 3, e depende de `docs/receitas/`
  acumular material via aprendiz.
- Nao comece com 1 convenio so. Sem comparacao o comparador nao tem o
  que fazer.
- Nao construa a lib inteira de uma vez. Uma etapa por vez, validando.
- Nao pule a bateria de fumaca. Serio.

---

## Mapa do repo

| Onde | O que e | Muda no banco? |
| --- | --- | --- |
| `.github/agents/` | Definicao dos 4 agentes | Nao |
| `.github/skills/` | Metodo detalhado que os agentes seguem | Nao |
| `.claude/commands/` | Os slash commands | Nao |
| `scripts/validateLayout.js` | Checagem automatica de quebra visual | Nao |
| `docs/modelo-clusters.md` | Doutrina: convenio = mode, doutrina de binding | Nao |
| `docs/estrutura-lib.md` | Nomenclatura, carimbo, o que publica | Nao |
| `docs/instalacao.md` | O que precisa existir antes de rodar agente | Nao |
| `docs/runbook-banco.md` | A bateria de fumaca | Nao |
| `docs/clusters/` | Manuais de convenio | **Voce preenche** |
| `docs/etapas/` | Definicao de cada etapa | **Voce preenche** |
| `docs/mapa-fluxo-*.md` | Quais telas existem em cada convenio | **Voce preenche** |
| `docs/receitas/` | Como voce constroi | O aprendiz preenche |
| `laboratorio/` | Evidencia dos 16 testes + exemplos ficticios | So leitura |
