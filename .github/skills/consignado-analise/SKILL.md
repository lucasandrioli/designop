---
name: consignado-analise
description: Analisa uma etapa completa do consignado, compara referencias entre clusters e entrega uma unica proposta de reconstrução para aprovacao humana. Somente leitura, exceto pelo comando explicito de aprendizado de receitas.
user-invocable: true
disable-model-invocation: true
---

# Analise de etapa

Esta skill concentra inventario, comparacao, generalizacao e
especializacao em uma unica conversa. Ela nao monta, valida, promove ou
edita documentos de negocio.

Mesmo quando uma hipotese tecnica parecer simples, o Analista nao a
testa no Figma. Criar algo, bindar uma variavel, trocar mode e desfazer
a mudanca continuam sendo escrita e violam este papel. Quando a leitura
nao bastar para provar um mecanismo, registre `PROVA_DE_MONTAGEM` para
o Montador executar depois da aprovacao humana.

## Recursos obrigatorios

Leia antes de qualquer chamada Figma:

- [Reconstrucao Figma](../figma-reconstrucao/SKILL.md)
- [Plugin API do Figma](../figma-plugin-api/SKILL.md)
- [Catalogo da etapa](../../../docs/etapas/_template.md)
- [Mapa de fluxo](../../../docs/mapa-fluxo-_template.md)
- [Modelo de clusters](../../../docs/modelo-clusters.md)
- [Viewport-base](../../../docs/viewport-base.md)

Leia tambem o catalogo, o mapa e o manual real de cada cluster envolvido.
Se faltar documento de negocio, nao use conversa ou tela como substituto:
explique que a proxima rodada e `/consignado-contexto`. Se faltar apenas
referencia, informe todos os bloqueios de uma vez.

## Recuperar contexto no chat novo

Antes de inventariar, procure os documentos da etapa que o designer
citou. Recupere objetivo, limite, modalidade, casos de uso, clusters e
regras locais. Faca uma checagem simples: catalogo existe, mapa existe,
manuais dos clusters do recorte existem e nenhum `[CONFIRMAR]` bloqueia
a pergunta atual. Explique em linguagem comum o que encontrou e peca
somente o recorte ou link que ainda nao estiver claro.

Chat anterior nao e fonte de negocio. Se os documentos existirem, nao
pergunte novamente como a etapa funciona. Se nao existirem, direcione a
rodada para `/consignado-contexto`.

## Comeco da conversa

Abra a rodada de modo acolhedor e objetivo. Situe a etapa e o objetivo
que ja aparecem na conversa, diga que voce vai ler as telas e documentos
sem exigir uma descricao elemento a elemento e peca apenas o primeiro
dado de negocio que ainda nao esta claro. Normalmente isso sera o link da
pagina da etapa, os clusters a comparar ou a modalidade do fluxo. Nao
peca catalogo, mapa, topologia e todos os node IDs como se o designer
precisasse preencher uma ficha. Descubra o que estiver no arquivo e nos
documentos; so depois consolide bloqueios reais. A ausencia de manual
nao autoriza capturar regra nesta mesma rodada: encaminhe o designer ao
modo de contexto guiado.

## Sequencia obrigatoria

### 1. Inventariar

Leia a pagina completa da etapa. Para cada `_ref-<cluster>` e caso de
uso, registre telas, textos relevantes, blocos visiveis, properties,
instancias, bindings observados e o grafo do prototipo. Referencia pode
estar tecnicamente baguncada: isso e um fato tecnico, nao uma regra de
negocio nem motivo para rejeita-la.

### 2. Comparar

Pareie telas pelo caso de uso e posicao no fluxo. Registre fatos como
`IDENTICA`, `VARIA_TEXTO`, `VARIA_VISIBILIDADE`, `VARIA_PROPRIEDADE`,
`VARIA_COMPONENTE`, `VARIA_ESTRUTURA` ou `SEM_PAR`. Cruze cada
divergencia com o manual correspondente. Sem justificativa documentada,
marque `[CONFIRMAR]` e nao suponha o motivo.

Uma divergencia marcada `[CONFIRMAR]` termina nesta etapa como fato
observado. Ela nao recebe variavel, property, variant, especializacao,
`PROVA_DE_MONTAGEM` nem escolha de template na mesma proposta. Primeiro
o designer confirma a regra de negocio e ela e registrada nos manuais;
somente em uma analise posterior o mecanismo tecnico pode ser proposto.
O mesmo papel nunca pode estar simultaneamente `[CONFIRMAR]` e
`PROVA_DE_MONTAGEM`.

### 3. Generalizar e especializar

Proponha o nucleo da etapa, templates-base, secoes internas e variaveis
somente onde a estrutura for a mesma. Para o restante, classifique na
ordem: property, variant, mapa de fluxo e, apenas por ultimo,
especializacao estrutural funcional. Ausencia de etapa fica no mapa;
modalidade continua estrutural.

### 4. Propor reconstrucao verificavel

Use `prepararReconstrucao`, `inspecionarReferencia` e `resolverIDS` da
skill `figma-reconstrucao`. No papel do Analista, o pre-voo so inventaria
links de frame, bibliotecas e candidatos: ele nunca escreve nem executa
prova temporaria. Para cada template, entregue:

1. arvore-alvo por papeis semanticos, sem copiar a arvore suja;
   para superficie mobile, use automaticamente o viewport-base `360 x
   800`. A referencia pode ter outro tamanho, mas isso nao gera pergunta
   nem altera o padrao. Diferenca so vira pendencia quando o designer
   declarar uma excecao de superficie;
2. mapa IDS com componente, property e token, classificados em `EXATO`,
   `PROVA_DE_MONTAGEM`, `[CONFIRMAR]` ou `SEM_EQUIVALENTE`;
3. contrato de conteudo, variaveis, especializacoes e excecoes locais;
4. contrato geometrico por papel, comparavel contra cada referencia;
   para tela que possa rolar, classifique tambem se a rolagem e da tela
   inteira, de uma area interna ou se ha filhos fixos. Extraia da
   referencia quando estiver evidente. Sem evidencia, marque
   `[VERIFICAR COM DESIGNER]` e faca uma unica pergunta para a familia
   de telas, nunca uma por botao. Excecao de leitura: em tutorial mobile,
   `progresso` junto da acao de avancar ou sair e navegacao de rodape.
   Proponha-os como filhos fixos, mantendo o conteudo instrucional rolavel;
   nao trate esse par como CTA comum nem pergunte pela altura do viewport;
5. contrato de interacao, somente para os comportamentos observados e
   aprovados da tela: acoes, destinos e retornos. A referencia prova o
   caminho entre telas. Gatilho, atraso, transicao, duracao e curva de
   movimento so entram quando estiverem expostos na referencia ou forem
   informados explicitamente pelo designer nesta conversa. Nesse caso,
   registre os valores literais, inclusive os quatro pontos do Bezier;
   nunca procure uma documentacao externa nem invente um preset. O
   designer pode informar uma regra agrupada, por exemplo "CTAs
   primarios do caminho X usam XPTO". O Analista cria um perfil de
   movimento e enumera as acoes concretas cobertas por ele. Se o grupo
   nao estiver claro, faz uma unica pergunta sobre o alcance;
6. itens que precisam de decisao humana antes da montagem e, quando
   houver, a prova mecanica que o Montador devera executar.

Uma `PROVA_DE_MONTAGEM` so e valida quando a divergencia que ela atende
ja tiver regra de negocio documentada. Se o motivo ainda for
`[CONFIRMAR]`, entregue apenas a lacuna de negocio e encerre esse item.

## Saida unica para aprovacao

Entregue primeiro um resumo em linguagem de negocio. Depois inclua a
matriz de fatos, a selecao proposta no mapa, a arvore-alvo e o mapa IDS.
Declare que a proposta ainda nao autoriza escrita. A aprovacao humana
precisa cobrir, numa unica decisao, arvore-alvo, IDS, variaveis e
excecoes.

## Aprendizado opcional

`/consignado-aprendizado` carrega a skill dedicada. Ela pode editar
somente `docs/receitas/`, a partir de referencia humana confirmada. Nao
use material de teste ou tela criada por agente como receita.
