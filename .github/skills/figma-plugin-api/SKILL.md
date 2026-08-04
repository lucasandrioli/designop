---
name: figma-plugin-api
description: >-
  Gramática obrigatória da Plugin API do Figma via use_figma. Carregue
  SEMPRE antes de qualquer chamada use_figma. Contém as regras que, se
  violadas, causam erro atômico ou falha silenciosa: auto layout,
  binding de variáveis, component properties, publicação, validação
  geométrica. Destilada de execução real, não de documentação.
---

# Plugin API do Figma: regras duras

Cada regra abaixo corresponde a um erro real cometido e corrigido.
Violar qualquer uma causa erro atômico (nada é aplicado) ou, pior,
falha silenciosa.

## Princípios de execução

1. **Scripts falham atomicamente.** Se um script dá erro no meio, NADA
   foi aplicado. Não re-tente às cegas: corrija a causa.
2. **O contexto de página reseta a cada chamada.** Todo script começa
   na primeira página do arquivo. Use
   `await figma.setCurrentPageAsync(page)` no máximo UMA vez por
   script. Trabalho multi-página = múltiplas chamadas.
3. **Trabalhe em passos pequenos.** Um componente por vez, uma tela por
   vez. Nunca tente construir tudo numa chamada só.
4. **Mudança de geometria não é lida na mesma chamada de forma
   confiável.** Se alterou algo que afeta layout (mode, padding,
   conteúdo) e precisa MEDIR o resultado, faça a leitura numa chamada
   SEPARADA.

## Auto layout

5. **`figma.createFrame()` nasce com `layoutMode = 'NONE'`.** Filhos com
   relação estrutural exigem auto layout explícito. Frame NONE com 2+
   filhos = empilhamento acidental.
6. **Ordem obrigatória: `appendChild` PRIMEIRO, sizing DEPOIS.** Nó sem
   pai não aceita FILL/HUG.
7. **Dois enums distintos, nunca cruzar:**
   - No FILHO: `layoutSizingHorizontal` / `layoutSizingVertical` =
     `FIXED | HUG | FILL`
   - No PAI: `primaryAxisSizingMode` / `counterAxisSizingMode` =
     `FIXED | AUTO`
8. **`HUG` só vale para o próprio frame auto layout ou filho TEXT.**
   Frame filho que precisa abraçar conteúdo usa `sizingMode = AUTO`.
9. **`layoutPositioning = 'ABSOLUTE'` exige pai com layoutMode != NONE.**
   Para sobrepor elementos (ex: check dentro de círculo), use frame
   auto layout com alinhamento CENTER, não posicionamento absoluto.
10. **Tela mobile padrão:** raiz 360 de largura, `layoutMode VERTICAL`,
    `primaryAxisSizingMode AUTO` (ou FIXED com altura), filhos com
    `layoutSizingHorizontal = 'FILL'`. Padding vive nas seções, não na
    raiz.
11. **TEXTO VAZIO NÃO É NÓ AUSENTE.** Um TEXT com `characters = ''`
    ainda tem altura de uma linha (não zero) e o auto layout ainda
    conta esse nó como visível, aplicando `itemSpacing` ao redor dele
    normalmente. Bindar só o `characters` de um texto que pode ficar
    vazio por contexto/condição deixa espaço morto na tela quando o
    valor é vazio. Se um bloco de texto pode ficar vazio, AGRUPE-O num
    frame próprio e binde a VISIBILIDADE DO FRAME (não só o texto) a
    um boolean. (Regra comprovada em teste interno.)
    Ao criar um TEXT que recebera binding de conteudo, nao o deixe vazio
    antes de medir a tela: carregue a fonte, aplique o valor inicial do
    mode padrao, defina a largura com `resize()`, e so entao aplique
    `textAutoResize = 'HEIGHT'` para calcular a altura. `resize()`
    depois de `textAutoResize` redefine esse modo para `NONE` e deixa o
    texto com altura de 1 px. So depois aplique o binding de conteudo.

## Texto e fontes

12. **Carregue a fonte ANTES de qualquer operação em texto**, incluindo
    `setBoundVariable('characters', ...)`:
    `await figma.loadFontAsync(node.fontName)`
13. **Texto que recebe variável DEVE ter `textAutoResize` = `HEIGHT` ou
    `WIDTH_AND_HEIGHT`.** Com `NONE` ou `TRUNCATION`, o conteúdo maior
    de outro contexto é cortado e o corte fica geometricamente
    INDETECTÁVEL.
14. **Camadas de TEXT renomeiam-se para o conteúdo.** Nunca localize um
    texto por nome de camada. Use node ID, conteúdo atual, ou (melhor)
    a component property.

## Variáveis

15. **Scopes:** sempre explícitos em variáveis de cor/número
    (`ALL_SCOPES` polui todos os pickers). STRING e BOOLEAN NÃO aceitam
    scopes de layout: deixe sem scope.
16. **Binding de cor em fill:** fills são read-only. Clone, modifique,
    reatribua:
    ```js
    let p = figma.util.solidPaint('#000000')
    p = figma.variables.setBoundVariableForPaint(p, 'color', variavel)
    node.fills = [p]
    ```
17. **DOUTRINA DE BINDING (a mais importante):**
    - **PROPERTY PRIMEIRO.** Se o componente expõe property (TEXT ou
      BOOLEAN), binde a variável NA PROPERTY:
      ```js
      inst.setProperties({ [key]: figma.variables.createVariableAlias(variavel) })
      ```
      Funciona para TEXT e BOOLEAN. É a API pública do componente:
      sobrevive a refatoração interna do design system.
    - **NÓ INTERNO só como fallback**, quando o componente não expõe
      property para aquele conteúdo. Quebra se o DS refatorar por
      dentro. Registrar como ponto frágil. Ver regra 25: em instância
    REMOTA, nó interno como fallback também pode falhar tecnicamente,
    não só ser frágil a refatoração.
17a. **Visibilidade no nó da instância:** quando um componente remoto
    não expõe property pública BOOLEAN, é permitido bindar a variável
    BOOLEAN no próprio nó `INSTANCE`:
    ```js
    instancia.setBoundVariable('visible', variavelBoolean)
    ```
    Isto não abre nem altera filhos internos da instância. Use apenas
    para um papel de visibilidade aprovado no contrato e, se o efeito
    ainda não estiver comprovado naquele arquivo, execute primeiro a
    `PROVA_DE_MONTAGEM` em `_verificacao-<etapa>`. Nunca faça essa prova
    em `ref-*` nem no papel do Analista.
18. **Modes:** `node.setExplicitVariableModeForCollection(collection,
    modeId)` aplica um mode a uma subárvore. É como uma tela troca de
    contexto. O mode propaga por toda a hierarquia: pinar UMA VEZ num
    ancestral comum (ex: o frame de topo de uma página de fluxo) basta
    para que TODAS as telas/etapas instanciadas dentro dele herdem o
    mesmo mode — não é preciso pinar tela por tela.
    `clearExplicitVariableModeForCollection(collection)` remove o
    override do nó, voltando a herdar do contexto.
    **Clone de referencia:** este projeto nao usa clone de tela como
    ponto de partida de template. Se um asset visual aprovado precisar
    ser clonado, varra o clone e limpe o mode explicito da collection de
    conteudo no clone e em todos os descendentes. Um mode herdado deixa
    o template preso no contexto de origem. Master de template nunca
    pina mode de contexto; somente wrapper de preview ou frame de Fluxos
    pode pinar.
19. **Variável de biblioteca remota:**
    `await figma.variables.importVariableByKeyAsync(key)`. Funciona em
    plano Pro (validado).
19a. **Para ENUMERAR tokens de biblioteca remota, `getLocalVariableCollectionsAsync()`
    NÃO serve** — ela só retorna collections locais e devolve lista vazia
    num arquivo consumidor cujos tokens vêm todos de lib. Use:
    ```js
    const cols = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()
    const vars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(col.key)
    const importada = await figma.variables.importVariableByKeyAsync(v.key) // pra ler valor/scopes
    ```
    Obrigatório sempre que precisar comparar um valor da tela contra a
    escala de tokens disponível (auditoria de aderência).
19b. **Ao casar um valor hardcoded com um token, RESPEITE O SCOPE do
    token, nunca case só pelo valor numérico.** `itemSpacing`/padding só
    podem casar com token de scope `GAP`; `cornerRadius` só com
    `CORNER_RADIUS`; tamanho de fonte só com `FONT_SIZE`. Casar por
    número puro produz recomendação lixo — num teste real, um
    `itemSpacing = 14` foi "casado" com um token de FONT_SIZE de valor 14
    (`tipo/corpo`), sugerindo trocar espaçamento por tamanho de fonte.
    Num IDS com centenas de tokens numéricos, colisão de valor é a
    regra, não a exceção. Quando não houver token com o valor exato E o
    scope certo, reporte "fora da escala" e ofereça o token mais próximo
    dentro do scope válido — como sugestão a confirmar, nunca como troca
    automática. (Regra comprovada em teste interno.)

## Component properties

20. **Criar a property não faz nada sozinho.** Tem que linkar no nó
    filho via `componentPropertyReferences`:
    - `{ characters: key }` para TEXT
    - `{ visible: key }` para BOOLEAN
    - `{ mainComponent: key }` para INSTANCE_SWAP
21. **Keys vêm com sufixo (`"Titulo#1:9"`) e NUNCA podem ser
    chutadas.** Capture do retorno de `addComponentProperty` ou resolva
    por nome:
    ```js
    const keyOf = (defs, nome) => Object.keys(defs).find(k => k.split('#')[0] === nome)
    ```
22. **INSTANCE_SWAP tem assinatura traiçoeira:** o `defaultValue` é o
    **id** do componente; os `preferredValues` usam **key**; e o
    terceiro argumento é um **objeto**, não array:
    ```js
    c.addComponentProperty('Midia', 'INSTANCE_SWAP', comp.id, {
      preferredValues: [{ type: 'COMPONENT', key: comp.key }]
    })
    ```
23. **`setProperties` aceita LOTE.** 10+ properties numa chamada só.
    Use para dirigir componentes densos do design system.
24. **Editar `.characters` direto em texto dentro de instância é
    frágil.** Prefira sempre `setProperties`.
25. **NÓ ANINHADO DENTRO DE INSTÂNCIA REMOTA INVISÍVEL VIRA
    INACESSÍVEL.** Se uma instância importada via
    `importComponentByKeyAsync` está com `visible = false` (direto ou
    por variável bindada), `instance.children` retorna `[]` e tanto
    `getNodeById` quanto `getNodeByIdAsync` para os IDs dos filhos
    aninhados (formato `I<id-da-instancia>;<id-original>`) retornam
    `null`/erro "Node ... not found" — mesmo que o node exista e
    funcionasse normalmente quando visível. Isso quebra
    `setBoundVariable` em texto interno de uma seção que também está
    invisible no momento do bind. Duas saídas:
    (a) ordem: bind todo conteúdo interno da seção ENQUANTO ela ainda
    está visível, e só bind o `visible` do ancestral por ÚLTIMO;
    (b) se a seção já está invisible e precisa editar mesmo assim,
    pine um mode explícito temporário no nó
    (`setExplicitVariableModeForCollection`) que resolva `visible` como
    `true`, edite, depois `clearExplicitVariableModeForCollection`.
    (Regra comprovada em teste interno.)

## Componentes e biblioteca

26. **Consumo de componente publicado:**
    `await figma.importComponentByKeyAsync(key)` /
    `importComponentSetByKeyAsync(key)`. Confira `remote === true`.
27. **Guarde os component keys** num inventário. O índice do
    `search_design_system` demora minutos para popular após publish e
    não é confiável logo em seguida.
27a. **Descoberta de biblioteca vem da instancia observada.** Recupere
    `mainComponent.key` de uma instancia remota da referencia e pesquise
    uma vez pelo nome exato do componente para obter sua `libraryKey`.
    Depois, restrinja buscas relacionadas com `includeLibraryKeys`.
    Componentes, tokens, icones e ilustracoes podem vir de bibliotecas
    diferentes, portanto registre uma `libraryKey` por fonte confirmada.
    `get_libraries` e ultimo recurso: se for inevitavel, leia somente
    `libraries_added_to_file` e nunca explore
    `libraries_available_to_add`.
28. **`figma.createComponentFromNode(node)`** converte um frame pronto
    em componente, preservando estrutura e instâncias.
29. **Binding no MASTER propaga para todas as instâncias.** Componentize
    PRIMEIRO, binde DEPOIS.
30. **Prefixo `_` no nome bloqueia publicação** (validado: fica
    `UNPUBLISHED`). Use para seções internas que não devem aparecer
    para quem consome a lib.
31. **Publicar biblioteca NÃO é possível via API.** É ação manual do
    designer. Aceitar update de biblioteca no arquivo consumidor também
    é manual.
32. **`getPublishStatusAsync()`** informa se um componente está
    publicado (`CURRENT` / `UNPUBLISHED`).
33. **`combineAsVariants([...], parent)` só aceita nós `COMPONENT`.**
    Monte cada variante com `figma.createComponent()` (nunca
    `createFrame()`) antes de combinar — passar um `FRAME` derruba o
    script inteiro com "Cannot move node. A COMPONENT_SET node cannot
    have children of type other than COMPONENT". Se precisar transformar
    frames já prontos, converta cada um individualmente com
    `figma.createComponentFromNode(frame)` primeiro, depois combine.
34. **Instância pode estar renomeada por PAPEL, com nome diferente do
    componente real.** Convenção do projeto: uma instância de
    `banner-desconto` pode se chamar `aviso-consentimento` na tela
    porque é esse o papel dela ali (convenção registrada em
    docs/receitas/_comuns.md quando o aprendiz já tiver rodado). Isso não
    é duplicação nem componente `[LOCAL]` — confirme sempre pelo
    `mainComponent.key` (ou `(await instance.getMainComponentAsync()).name`),
    nunca pelo `instance.name`, antes de reportar um componente como
    desconhecido ou duplicado.

## Protótipo

35. **Ler navegação:** `node.reactions` (percorra com
    `findAll(n => n.reactions && n.reactions.length > 0)`). Reactions
    normalmente vivem em INSTÂNCIAS de botão: o rótulo do gatilho é o
    texto INTERNO da instância, não o nome do nó.
36. **Escrever navegação:**
    ```js
    await node.setReactionsAsync([{
      trigger: { type: 'ON_CLICK' },
      actions: [{ type: 'NODE', navigation: 'NAVIGATE',
                  destinationId: destino.id, transition: null,
                  resetVideoPosition: false }],
    }])
    ```
37. **`page.flowStartingPoints`** define os pontos de partida nomeados.
    Cada um é um caso de uso.

## Validação geométrica (sem screenshot)

38. **MÉTRICA DE CORTE: use `absoluteBoundingBox`, NUNCA
    `absoluteRenderBounds`.** Render bounds mede pixels JÁ clipados e
    por definição nunca excede quem clipa: usá-lo torna o corte
    indetectável. (Este erro passou despercebido até um teste com
    defeito plantado.)
39. **Texto cortado:** `absoluteBoundingBox` do TEXT excedendo o box de
    um ancestral com `clipsContent = true`.
40. **Sobreposição:** interseção de bounding boxes entre irmãos. Só
    verifique onde auto layout não garante (frame NONE ou filhos
    ABSOLUTE).
41. **Isenções obrigatórias da checagem estrutural:**
    - Nós dentro de INSTANCE (validam-se no master)
    - Nós de arte vetorial (filhos só de shapes): sobreposição ali é
      intencional (ícones, ilustrações)
42. **Valide em TODOS os modes.** Texto que cabe num contexto estoura em
    outro. Aplicar mode e medir devem ser chamadas separadas (regra 4).
    Texto BINDADO mas com valor VAZIO num mode não é erro de layout em
    si (ver validateLayout.js, check emptyBoundText) — é sintoma de
    template usado fora do contexto a que pertence; cruzar contra o mapa
    de fluxo antes de reportar como bug.

## Descrição de componente

43. **`component.description`** é o único artefato de documentação que
    viaja com o componente até quem consome a lib. Gere a partir dos
    bindings reais (varredura de `boundVariables`), nunca de memória.

## Mais achados (seção Auto layout)

44. **Frame auto layout sem `counterAxisSizingMode` explícito fica
    preso no tamanho default do `createFrame()` (100×100).** Setar
    `primaryAxisSizingMode = 'AUTO'` não hug a altura sozinho quando o
    layoutMode é HORIZONTAL (primary = horizontal, counter = vertical)
    — os dois eixos são independentes (regra 7). Sintoma: linhas
    "rótulo + valor" com espaço vazio enorme abaixo do texto, sem
    nenhum erro de script e sem `validateLayout` reprovar (não é
    overlap nem clipping, é espaço desperdiçado — `validateLayout` não
    detecta isso hoje). Sempre setar os DOIS eixos (`primaryAxisSizingMode`
    E `counterAxisSizingMode`) em frame auto layout novo, nunca confiar
    no default.

45. **`resize()` fixa o eixo primario do frame auto layout.** Se um
    container deve abracar os filhos, construa e anexe os filhos,
    depois aplique `primaryAxisSizingMode = 'AUTO'` novamente. Definir
    `AUTO` antes de `resize()` deixa o frame com a altura temporaria
    usada na criacao, mesmo que os filhos crescam depois. Leia a altura
    em chamada separada antes de concluir que a tela esta pronta.

## Descoberta (leitura)

46. **`get_metadata` sem `nodeId` pode devolver só UMA página**, não o
    arquivo inteiro. Concluir "não existe" a partir daí é erro comum e
    caro: o validador quase reprovou um template por ausência quando
    ele estava na 2ª de 4 páginas. Para saber o que existe de fato,
    enumere por script: `figma.root.children` para as páginas e
    `page.findAll(...)` dentro de cada uma. Só afirme que algo não
    existe depois de varrer assim.

46. **Binding feito via component property NÃO aparece em
    `node.boundVariables` do nó interno** — ele vive em
    `instance.componentProperties[<key>].boundVariables`, e o TEXT lá
    dentro fica com `boundVariables` vazio. Como a doutrina do projeto
    é PROPERTY FIRST, o template CORRETO é exatamente o que parece
    "sem binding" para quem olha só o nó. Ao auditar bindings, leia
    sempre os dois lugares; ao reportar ausência de binding, diga em
    qual dos dois você procurou.
47. **Token visual do IDS não prova binding de conteúdo.** Um template
    pode conter fonte ou cor bindada dentro de uma instancia remota e
    ainda nao trocar texto por contexto. Ao validar `tpl-`, confira alias
    da collection de conteudo em `componentPropertyDefinitions`,
    `instance.componentProperties` ou fallback local. Ignore tokens
    internos do IDS como prova de conteudo variavel.
