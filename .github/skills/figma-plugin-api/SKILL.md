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

## Texto e fontes

11. **Carregue a fonte ANTES de qualquer operação em texto**, incluindo
    `setBoundVariable('characters', ...)`:
    `await figma.loadFontAsync(node.fontName)`
12. **Texto que recebe variável DEVE ter `textAutoResize` = `HEIGHT` ou
    `WIDTH_AND_HEIGHT`.** Com `NONE` ou `TRUNCATION`, o conteúdo maior
    de outro cluster é cortado e o corte fica geometricamente
    INDETECTÁVEL.
13. **Camadas de TEXT renomeiam-se para o conteúdo.** Nunca localize um
    texto por nome de camada. Use node ID, conteúdo atual, ou (melhor)
    a component property.

## Variáveis

14. **Scopes:** sempre explícitos em variáveis de cor/número
    (`ALL_SCOPES` polui todos os pickers). STRING e BOOLEAN NÃO aceitam
    scopes de layout: deixe sem scope.
15. **Binding de cor em fill:** fills são read-only. Clone, modifique,
    reatribua:
    ```js
    let p = figma.util.solidPaint('#000000')
    p = figma.variables.setBoundVariableForPaint(p, 'color', variavel)
    node.fills = [p]
    ```
16. **DOUTRINA DE BINDING (a mais importante):**
    - **PROPERTY PRIMEIRO.** Se o componente expõe property (TEXT ou
      BOOLEAN), binde a variável NA PROPERTY:
      ```js
      inst.setProperties({ [key]: figma.variables.createVariableAlias(variavel) })
      ```
      Funciona para TEXT e BOOLEAN. É a API pública do componente:
      sobrevive a refatoração interna do design system.
    - **NÓ INTERNO só como fallback**, quando o componente não expõe
      property para aquele conteúdo. Quebra se o DS refatorar por
      dentro. Registrar como ponto frágil.
17. **Modes:** `node.setExplicitVariableModeForCollection(collection,
    modeId)` aplica um mode a uma subárvore. É como uma tela troca de
    cluster.
18. **Variável de biblioteca remota:**
    `await figma.variables.importVariableByKeyAsync(key)`. Funciona em
    plano Pro (validado).

## Component properties

19. **Criar a property não faz nada sozinho.** Tem que linkar no nó
    filho via `componentPropertyReferences`:
    - `{ characters: key }` para TEXT
    - `{ visible: key }` para BOOLEAN
    - `{ mainComponent: key }` para INSTANCE_SWAP
20. **Keys vêm com sufixo (`"Titulo#1:9"`) e NUNCA podem ser
    chutadas.** Capture do retorno de `addComponentProperty` ou resolva
    por nome:
    ```js
    const keyOf = (defs, nome) => Object.keys(defs).find(k => k.split('#')[0] === nome)
    ```
21. **INSTANCE_SWAP tem assinatura traiçoeira:** o `defaultValue` é o
    **id** do componente; os `preferredValues` usam **key**; e o
    terceiro argumento é um **objeto**, não array:
    ```js
    c.addComponentProperty('Midia', 'INSTANCE_SWAP', comp.id, {
      preferredValues: [{ type: 'COMPONENT', key: comp.key }]
    })
    ```
22. **`setProperties` aceita LOTE.** 10+ properties numa chamada só.
    Use para dirigir componentes densos do design system.
23. **Editar `.characters` direto em texto dentro de instância é
    frágil.** Prefira sempre `setProperties`.

## Componentes e biblioteca

24. **Consumo de componente publicado:**
    `await figma.importComponentByKeyAsync(key)` /
    `importComponentSetByKeyAsync(key)`. Confira `remote === true`.
25. **Guarde os component keys** num inventário. O índice do
    `search_design_system` demora minutos para popular após publish e
    não é confiável logo em seguida.
26. **`figma.createComponentFromNode(node)`** converte um frame pronto
    em componente, preservando estrutura e instâncias.
27. **Binding no MASTER propaga para todas as instâncias.** Componentize
    PRIMEIRO, binde DEPOIS.
28. **Prefixo `_` no nome bloqueia publicação** (validado: fica
    `UNPUBLISHED`). Use para seções internas que não devem aparecer
    para quem consome a lib.
29. **Publicar biblioteca NÃO é possível via API.** É ação manual do
    designer. Aceitar update de biblioteca no arquivo consumidor também
    é manual.
30. **`getPublishStatusAsync()`** informa se um componente está
    publicado (`CURRENT` / `UNPUBLISHED`).

## Protótipo

31. **Ler navegação:** `node.reactions` (percorra com
    `findAll(n => n.reactions && n.reactions.length > 0)`). Reactions
    normalmente vivem em INSTÂNCIAS de botão: o rótulo do gatilho é o
    texto INTERNO da instância, não o nome do nó.
32. **Escrever navegação:**
    ```js
    await node.setReactionsAsync([{
      trigger: { type: 'ON_CLICK' },
      actions: [{ type: 'NODE', navigation: 'NAVIGATE',
                  destinationId: destino.id, transition: null,
                  resetVideoPosition: false }],
    }])
    ```
33. **`page.flowStartingPoints`** define os pontos de partida nomeados.
    Cada um é um caso de uso.

## Validação geométrica (sem screenshot)

34. **MÉTRICA DE CORTE: use `absoluteBoundingBox`, NUNCA
    `absoluteRenderBounds`.** Render bounds mede pixels JÁ clipados e
    por definição nunca excede quem clipa: usá-lo torna o corte
    indetectável. (Este erro passou despercebido até um teste com
    defeito plantado.)
35. **Texto cortado:** `absoluteBoundingBox` do TEXT excedendo o box de
    um ancestral com `clipsContent = true`.
36. **Sobreposição:** interseção de bounding boxes entre irmãos. Só
    verifique onde auto layout não garante (frame NONE ou filhos
    ABSOLUTE).
37. **Isenções obrigatórias da checagem estrutural:**
    - Nós dentro de INSTANCE (validam-se no master)
    - Nós de arte vetorial (filhos só de shapes): sobreposição ali é
      intencional (ícones, ilustrações)
38. **Valide em TODOS os modes.** Texto que cabe num cluster estoura em
    outro. Aplicar mode e medir devem ser chamadas separadas (regra 4).

## Descrição de componente

39. **`component.description`** é o único artefato de documentação que
    viaja com o componente até quem consome a lib. Gere a partir dos
    bindings reais (varredura de `boundVariables`), nunca de memória.
