---
name: consignado-montagem
description: Monta um rascunho de template aprovado a partir de referencias cruas e so o promove apos validacao independente. Use no agente Montador, sempre depois da aprovacao humana.
user-invocable: true
disable-model-invocation: true
---

# Montagem de etapa

Esta skill e chamada manualmente com `/consignado-montagem`. Ela nao
substitui a aprovacao humana nem permite que uma referencia crua seja
promovida por parecer parecida com um template.

Siga o [Contrato de papeis](../../../docs/contrato-papeis.md). Montagem
nao decide regra, classificacao nem veredito de validacao; devolva a
pendencia ao papel responsavel.

## Recursos obrigatorios desta execucao

Leia estes recursos antes de qualquer chamada Figma. Os links existem
para que o Copilot carregue o conteudo e os arquivos auxiliares, nao
apenas reconheca seus nomes.

- [Plugin API do Figma](../figma-plugin-api/SKILL.md)
- [Validacao do consignado](../consignado-validacao/SKILL.md)
- [Validacao estrutural](../../../scripts/validateCreation.js)
- [Validacao do contrato de conteudo](../../../scripts/validateContentContract.js)
- [Validacao de comportamento por mode](../../../scripts/validateModeBehavior.js)
- [Elegibilidade para promocao](../../../scripts/validatePromotion.js)
- [Taxonomia de nomes e carimbo](../../../docs/estrutura-lib.md)
- [Modelo de variaveis e modes](../../../docs/modelo-clusters.md)

Na primeira resposta, antes de escrever no Figma, abra a conversa em
linguagem natural. Diga o que precisa, o que vai montar nesta rodada,
o que o designer recebera ao final e o proximo passo. Skills e scripts
lidos entram somente depois, no detalhe tecnico. Se faltar algum
recurso ou entrada de negocio, pare. Nao troque essa abertura por uma
promessa de que "vai seguir a skill".

## Entradas obrigatorias

1. Proposta consolidada aprovada explicitamente pelo designer nesta
   conversa: template-base, especializacoes, schema de variaveis e
   plano de componentizacao.
2. Catalogo da etapa, mapa de fluxo e manual de cada cluster em
   `docs/`.
3. Arquivo Figma, pagina de referencias, referencias por cluster e area
   de montagem informados pelo designer.
4. Topologia decidida em `docs/topologia-biblioteca.md` e collection
   resolvida para a etapa.
5. Para promocao: relatorio mais recente do Validador dizendo `APTO
   PARA PROMOCAO` para cada rascunho indicado.

Liste todos os bloqueios de uma vez. Sem qualquer entrada, nao crie
tela, variavel, binding, componente ou documento oficial.

## Estado dos objetos

| Estado | Nome | Onde vive | Pode publicar? |
| --- | --- | --- | --- |
| Referencia humana | `ref-...` | pagina ou secao de referencias | nao |
| Material de construcao | `_rascunho-<etapa>-<nome>` | pagina ou secao de montagem | nao |
| Template aprovado | `etapa/tpl-...` | `_templates` | sim |

`ref-*` nunca e componentizado nem renomeado. Clonar uma referencia e
permitido, desde que a copia se torne `_rascunho-*` antes de qualquer
alteracao. O clone nao herda direito ao prefixo `tpl-*`.

## Fase A: contrato visual antes da escrita

1. Leia as referencias e registre, para cada tela selecionada: node ID,
   textos visiveis, blocos visiveis, instancias IDS, properties
   expostas, tamanho relativo dos blocos e screenshot de referencia.
   Isso e o contrato visual da rodada, nao uma regra de negocio nova.
2. Descubra as properties reais das instancias IDS. Nunca invente keys
   como `Label` ou sufixos `#...`; use as definitions expostas no
   arquivo atual.
3. Audite styles e tokens IDS aplicados. Carregar uma fonte so permite
   editar texto na API; nao prova que a tipografia segue IDS. Token
   proximo exige aprovacao humana registrada.
4. Planeje o que sera preservado, reutilizado como secao interna e
   variabilizado. Limpar uma arvore nunca justifica retirar hero,
   ilustracao, fundo, card, espacamento ou hierarquia visivel da
   referencia.
5. Confirme que toda escrita ocorrera fora da pagina ou secao de
   referencias. Se o plano aponta para ela, pare.

## Fase B: montar somente o rascunho

1. Crie ou localize a area de montagem da etapa. Preserve a pagina de
   referencias somente leitura.
2. Antes de clonar, anexar ou editar texto, carregue as fontes reais
   de todos os nos textuais envolvidos. Fonte sem `family` e bloqueio,
   nao valor para substituir.
3. Clone a referencia escolhida para a area de montagem e renomeie para
   `_rascunho-<etapa>-<nome>`. Limpe o mode explicito da collection de
   conteudo no clone e em seus descendentes locais antes de
   componentizar.
4. Ao varrer a arvore, pare em `INSTANCE`. Nao atravesse instancia
   remota para editar texto interno ou procurar um no stale. Use a
   property publica exposta ou registre o fallback como bloqueio.
5. Crie somente variaveis previstas no schema aprovado. Cada nome
   comeca com `<etapa>/`; modes sao clusters que usam a etapa. Ausencia
   de etapa pertence somente ao mapa.
6. Componentize secoes internas aprovadas e depois o rascunho. Use
   property first nas instancias IDS, com as keys reais descobertas na
   fase A. No interno e fallback documentado.
7. Aplique bindings estruturais e de conteudo no master. Texto bindado
   usa `textAutoResize` HEIGHT ou WIDTH_AND_HEIGHT. O master nunca
   recebe mode explicito.
8. Crie um wrapper de preview por cluster e aplique nele o mode do
   cluster. A instancia dentro do wrapper nao recebe override manual
   de conteudo.

## Fase C: prova do rascunho

Ainda nao renomeie para `tpl-*` nem atualize documentos oficiais.

1. Rode `validateCreation` no rascunho com a collection de conteudo.
2. Rode `validateContentContract` para todos os papeis aprovados.
3. Rode `validateModeBehavior` em cada preview. A entrada inclui
   wrapper, mode, instancia, referencia, raiz de layout e papeis.
4. Rode `validateLayout` em cada preview resolvido por mode.
5. Produza screenshots lado a lado: referencia, rascunho sem mode e
   preview de cada cluster. Revise geometria, hierarquia e blocos
   essenciais. Uma validacao matematica aprovada nao dispensa essa
   revisao visual.
6. Entregue ao Validador: IDs dos rascunhos, contratos, previews,
   referencias, collection, modes, scripts e screenshots revisados.

Reprovacao em qualquer item mantem o estado `_rascunho-*`. Corrija ou
reporte a pendencia, mas nao use o nome `tpl-*` para esconder trabalho
incompleto.

## Fase D: promocao apos validacao independente

Use esta fase somente quando o Validador devolveu `APTO PARA PROMOCAO`.
Nao reconstrua tela, mude regra ou altere referencia nesta fase.

1. Leia novamente a evidencia do Validador e rode
   `validatePromotion` com os IDs, collection e resultados de cada
   prova. O script nao substitui o Validador: ele impede que uma
   promocao seja baseada em nome, clone ou carimbo manual.
2. Gere o carimbo final ainda no rascunho, a partir dos `boundVariables` e das component
   properties reais. Complete os campos canonicos de
   `docs/estrutura-lib.md`; nunca copie um carimbo de memoria.
3. Se o carimbo estiver completo, renomeie o componente para a taxonomia final
   `etapa/tpl-nome` ou especializacao funcional aprovada.
4. Mova ou mantenha o template aprovado em `_templates`, atualize
   somente os documentos oficiais que ja estavam aprovados e registre
   a evidencia da promocao.

## Saida

Primeiro, em linguagem simples, diga o estado do objeto, o que foi
criado ou promovido, o que bateu com cada referencia, o que bloqueia a
proxima acao e o que o designer pode revisar agora. Diga tambem se o
proximo passo e o Validador ou a publicacao manual.

Depois, apresente a evidencia tecnica: IDs, collection, modes,
bindings, scripts, screenshots e documentos alterados.
