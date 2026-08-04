---
name: figma-referencias
description: Prepara referencias cruas e evidencias de prototipo sob pedido explicito, sem criar assets publicaveis.
user-invocable: true
disable-model-invocation: true
---

# Referencias Figma

Use esta skill somente quando a pessoa pedir explicitamente para criar
ou completar referencias de teste ou evidencia. Ela nao faz parte da
analise normal e nunca substitui referencias humanas reais.

Carregue `figma-plugin-api` e a skill MCP `figma-use` antes de qualquer
`use_figma`.

## Limites

- Crie apenas Sections `ref-*`, frames de evidencia e reacoes de
  prototipo.
- Nao crie `tpl-*`, variaveis de conteudo, componentes locais aprovados,
  previews ou Fluxos.
- Use bibliotecas ja conectadas. Para descoberta, comece por instancias
  existentes e use somente `libraries_added_to_file` quando precisar
  consultar bibliotecas.
- Escritas no Figma sao sempre em serie.
- Um defeito tecnico intencional pode existir na referencia, mas seu
  nome, descricao e rotulo visivel nao podem revelar o defeito ao
  Analista.

## Procedimento

1. Receba um contrato logico de tela e de jornada aprovado para a
   referencia. Sem ele, crie somente o que foi solicitado e registre as
   lacunas como `[CONFIRMAR]`.
2. Reserve regioes com espacamento horizontal e vertical suficiente
   para que as Sections e seus rotulos nao se sobreponham.
3. Crie cada tela na dimensao declarada. Em mobile, use `360 x 800`,
   salvo excecao declarada.
4. Conecte somente as interacoes declaradas. `URL` externo precisa de
   URL HTTPS fornecida; nao invente URL para PDF ou canal externo.
5. Antes de qualquer escrita, execute um preflight de fonte para cada
   papel que pretenda instanciar:
   - se houver instancia de referencia, registre `mainComponent.key`,
     `assetType` e biblioteca dela;
   - sem instancia, consulte `get_libraries` e restrinja
     `search_design_system` somente a `libraries_added_to_file`;
   - execute `scripts/inspectRemoteComponent.js` com a key, assetType e
     libraryKey encontradas. As tres informacoes sao obrigatorias. Ele escolhe a importacao compativel, confirma
     `remote === true` e lista as properties publicas;
   - se a key falhar, a property nao existir ou o componente nao aceitar
     a composicao, pare aquele papel como `SEM_EQUIVALENTE`. Nao desenhe
     imitacao nem use key de outra rodada.
6. Instancia e opaca: altere somente properties publicas. Nunca mova ou
   anexe filhos dentro dela; composicao adicional e irma em frame local.
7. Para tela rolavel com rodape fixo declarado, use somente os enums
   `NONE`, `HORIZONTAL`, `VERTICAL` ou `BOTH`. Anexe os filhos fixos por
   ultimo e defina `numberOfFixedChildren` na raiz depois da arvore pronta.
8. Monte cada contrato de interacao a partir de `collectPrototypeReactions`:
   use os nomes e destinos retornados pelo coletor e escolha como raiz o
   menor frame ou Section que realmente contenha a acao. Nunca transcreva
   nomes de memoria ou de um plano anterior. Rode
   `validateCanvasOrganization` para as Sections criadas e para a
   Section `_componentes-locais`, quando existir. A verificacao de
   sobreposicao deve incluir os componentes dentro dessa area interna.
   `validateInteractionContract` para cada tela com interacao.
9. Entregue node IDs, mapa de fontes que passou no preflight, resultados
   dos validadores e qualquer
   lacuna. O proximo papel sera o Analista, que le as referencias sem
   receber explicacao sobre defeitos tecnicos intencionais.
