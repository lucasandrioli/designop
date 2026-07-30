# Comece aqui

Este repo instala tres agentes que cuidam da parte repetitiva de manter
uma biblioteca de etapas do consignado que se adapta por convenio.

Ele chega **vazio de conteudo e cheio de metodo**. Os manuais de
convenio, os docs de etapa e o mapa de fluxo comecam em branco, so com
os moldes (`_template.md`). Isso e proposital: os agentes tem proibicao
explicita de inventar regra de negocio, e a checagem inicial do
Analista PARA e pede o que falta em vez de comecar sem.

O repositorio chega vazio de regras de negocio de proposito. Os agentes
trabalham somente com o que estiver documentado em `docs/` e marcado
como verdadeiro pelo time responsavel.

## Os tres agentes

| Comando | Nome | O que faz |
| --- | --- | --- |
| `/consignado-analise` | Analista da Etapa | Inventaria, compara e entrega uma unica proposta de arvore-alvo, IDS, variaveis e especializacoes. Somente leitura |
| `/montador` | O Montador | Transforma a tela aprovada em template que se adapta por convenio |
| `/validador` | O Revisor | Confere cada entrega: layout quebrado, texto cortado, conteudo faltando |

`/consignado-aprendizado` e um comando opcional do Analista. Ele observa
uma referencia criada por pessoa designer e escreve somente em
`docs/receitas/`.

---

## Ordem de instalacao

Cada passo protege o seguinte. Nao pule.

### Passo 1 — Ambiente. ~1h

1. Baixar este repo e abrir a pasta no VS Code.
2. O servidor Figma ja esta declarado em `.vscode/mcp.json`. Rode
   `MCP: List Servers`, inicie `figma` e autentique com a conta Figma
   do Itau quando abrir o navegador. Em VS Code antigo que nao le o
   arquivo, use `MCP: Add Server` > HTTP >
   `https://mcp.figma.com/mcp` > id `figma`.
3. Rode `Chat: Open Customizations` e confira os tres agentes: analista,
   montador e validador. Em Chat Diagnostics, nao pode haver erro de
   agente ou skill.
4. Em Configure Tools, confirme que o MCP Figma esta visivel. Mantenha
   a permissao em `Ask` durante os testes.
5. Teste de vida: "liste as bibliotecas conectadas neste arquivo Figma",
   passando o link de um arquivo do consignado. Se responder, conectou.

Se travar: o seat do Figma precisa ser Dev ou Full. View/Collab tem
limite de 6 chamadas por MES, inviavel. Resolva isso antes de tudo.

### Passo 2 — Bateria de fumaca. ~3h

NAO construa nada ainda. Rode os 10 itens de `docs/runbook-banco.md`
num arquivo Figma descartavel. E o que prova que o ambiente do banco se
comporta como o fluxo espera.

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
3. Criar uma pagina por etapa. Exemplo: `Anuencia`. Nao crie nem peca
   `Fluxos` nesta preparacao: ele e uma demonstracao posterior da
   jornada completa, nao a fonte do fluxo da etapa.
4. Na pagina da etapa, criar uma secao interna por cluster. Cada secao
   recebe todas as referencias cruas daquele cluster: caminho feliz,
   erros e desdobramentos que pertencem a etapa. Instancie componentes
   do IDS, sem variaveis e sem componentizar.
5. Na mesma pagina, reservar uma secao interna para os templates
   aprovados. Referencias e templates nunca se misturam.
6. **Ligar as telas por prototipo, na ordem, e nomear o ponto de
   partida pelo caso de uso ("Caso feliz").** Cada cluster tem seus
   proprios pontos de partida dentro da pagina da etapa.

O passo 6 nao e opcional e nao e para apresentacao: o prototipo e a
FONTE do mapa de fluxo. O Analista extrai dele quais telas existem,
em que ordem, o que bifurca e o que volta — e sem isso ele consegue
dizer o que MUDA dentro de cada tela, mas nao consegue dizer o que
existe num convenio e nao no outro. E aí que os convenios mais divergem.
Cada ponto de partida nomeado vira um caso de uso comparavel. Se a etapa
tem uma tela so, nao ha o que ligar.

Nao se preocupe com nomenclatura nem com organizacao. Voce declara ao
agente "estas telas sao da etapa X, esta e do convenio A" e ele
normaliza. Tela bagunçada (componente destacado, camada sem nome, sem
auto layout) e esperada e tolerada: auditar isso e trabalho do agente.
O que nao e tolerado e nao existir tela.

---

## O ciclo de trabalho

Daqui em diante isso se repete por etapa e por convenio novo.

Cada agente faz somente a propria etapa, mesmo que a conversa carregue
o contexto dos anteriores. Antes de agir, ele explica o que precisa, o
que vai fazer, o que voce recebera e qual sera o proximo passo. Pedido
fora do papel deve parar e indicar o handoff correto, nunca ser
resolvido "para ajudar". Veja `docs/contrato-papeis.md`.

1. Selecione `Analista da Etapa` e rode `/consignado-analise` para ler
   a pagina inteira. Ele entrega inventario, matriz, nucleo,
   classificacao, arvore-alvo, mapa IDS e contrato geometrico em uma
   unica proposta.
2. **VOCE REVISA e aprova a proposta consolidada.** Checkpoint
   obrigatorio, nao pule mesmo que pareca obvio. Este e o momento de
   decidir se uma diferenca e regra real, qual componente IDS usar e
   qual geometria precisa ser preservada.
3. Antes de montar pela primeira vez, decida a topologia em
   `docs/topologia-biblioteca.md`: arquivo unico ou arquivo por etapa.
   O agente nao escolhe isso por voce.
4. Clique em `Montar apos aprovacao` somente depois de escrever a
   aprovacao explicita na conversa. O prompt inicia
   `/consignado-montagem`.
5. Confira a abertura do Montador. Antes de alterar o Figma, ele deve
   dizer o que precisa, o que vai montar, o que voce recebera e o que
   acontecera depois. O detalhe de skills, scripts e bloqueios vem em
   seguida como apoio.
6. O Montador registra o contrato tecnico aprovado no catalogo e cria a
   pagina temporaria `_verificacao-<etapa>`. Nela ele monta a arvore-alvo
   aprovada, sem clonar a tela inteira, e gera `_rascunho-*` e previews
   por cluster. Esses previews nao sao fluxo nem recebem conexoes.
7. Clique em `Validar rascunho`, revise o prompt e envie. O Validador
   confere arvore, IDS, geometria, layout, conteudo, modes, referencias,
   mapa e screenshots de todos os convenios. Ele devolve `APTO PARA
   PROMOCAO`, `REPROVADO` ou `NAO VERIFICAVEL`.
8. Somente quando estiver apto, clique em `Promover rascunho validado`.
    O Montador roda o portao final, gera o carimbo, move o componente
    para `_templates`, renomeia para `etapa/tpl-*` e remove os previews
    temporarios daquela rodada.
9. Quando houver uma jornada inteira aprovada, voce pode pedir
    separadamente `Montar Fluxos`. O Montador usa somente instancias de
    `tpl-*` aprovados e o mapa. Isso nao recria os prototipos das
    referencias.
10. Publicar a lib (acao manual, nao tem API).

### Depois: a manutencao, onde o investimento se paga

- Mudou um texto num convenio? Edite a celula na tabela de variaveis do
  Figma. So isso.
- Entrou convenio novo? Adicione o mode, escreva o manual da jornada,
  coloque referencias nas paginas das etapas usadas e rode a analise da
  analise. Nao copie uma etapa para dentro do cluster.
- O IDS mudou? Rode `/validador`: ele varre o impacto em tudo.

---

## O que NAO fazer

- Nao use arquivo de exemplo, conversa anterior ou tela semelhante como
  regra de negocio. O agente so pode usar os documentos reais em
  `docs/`.
- Nao peca ao agente para criar telas do zero (ainda). Ele nao sabe
  como voce constroi. Isso e o Bloco 3, e depende de `docs/receitas/`
  acumular material via aprendiz.
- Nao comece com 1 convenio so. Sem comparacao o Analista nao tem o
  que fazer.
- Nao construa a lib inteira de uma vez. Uma etapa por vez, validando.
- Nao pule a bateria de fumaca. Serio.

---

## Mapa do repo

| Onde | O que e | Muda no banco? |
| --- | --- | --- |
| `AGENTS.md` | Regras sempre ativas, lidas por todo agente | Nao |
| `.github/agents/` | Definicao dos 3 agentes visiveis | Nao |
| `.github/skills/` | Metodo detalhado que os agentes seguem | Nao |
| `scripts/validateReconstructionContract.js` | Checagem de arvore, geometria e IDS contra o contrato aprovado | Nao |
| `docs/modelo-clusters.md` | Doutrina: convenio = mode, doutrina de binding | Nao |
| `docs/estrutura-lib.md` | Nomenclatura, carimbo, o que publica | Nao |
| `docs/instalacao.md` | O que precisa existir antes de rodar agente | Nao |
| `docs/runbook-banco.md` | A bateria de fumaca | Nao |
| `docs/clusters/` | Manuais de convenio | **Voce preenche** |
| `docs/etapas/` | Definicao de cada etapa | **Voce preenche** |
| `docs/mapa-fluxo-*.md` | Quais telas existem em cada convenio | **Voce preenche** |
| `docs/receitas/` | Como voce constroi | O aprendiz preenche |
