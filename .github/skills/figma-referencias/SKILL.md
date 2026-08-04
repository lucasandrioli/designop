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
5. Rode `validateCanvasOrganization` para as Sections criadas e
   `validateInteractionContract` para cada tela com interacao.
6. Entregue node IDs, resultados dos dois validadores e qualquer
   lacuna. O proximo papel sera o Analista, que le as referencias sem
   receber explicacao sobre defeitos tecnicos intencionais.
