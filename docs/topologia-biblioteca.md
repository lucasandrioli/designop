---
status: PENDENTE_DE_DECISAO
aprovadoPor: null
aprovadoEm: null
---

# Topologia da biblioteca Figma

## Decisao pendente

Esta e uma decisao de arquitetura da biblioteca, nao uma deducao de uma
referência. O Montador pode fazer inventario de leitura e preparar uma
recomendacao, mas nao cria collection, variavel, binding, componente ou
template enquanto `status` nao for `APROVADO` por uma pessoa designer.

Aprovacao futura registra aqui a alternativa escolhida, quem aprovou e a data.
Ela nao reaproveita automaticamente rascunhos, aprovacoes ou evidencias de
uma rodada anterior.

## Alternativas para revisao

### A. Conteudo por modalidade, contexto como mode

| Aspecto | Proposta |
| --- | --- |
| Collections | Uma collection `Conteudo - <Modalidade>` por modalidade. |
| Caminho de variavel | `<etapa>/<tela>/<papel>`. |
| Modes | Um mode por contexto, aplicado uma unica vez no wrapper da Section. |
| Previews | Um preview por contexto em `_verificacao-<etapa>`, sem prototipo. |
| IDS | Collections estruturais do IDS coexistem; o conteudo nao substitui IDS. |

**Impacto:** preserva modalidade como estrutura e impede que contexto vire
nome de variavel. E a alternativa recomendada porque respeita as regras
canônicas atuais e deixa a comparação entre contextos explícita no preview.

### B. Conteudo por etapa, modalidade como mode

| Aspecto | Proposta |
| --- | --- |
| Collections | Uma collection por etapa compartilhada entre modalidades. |
| Caminho de variavel | `<modalidade>/<tela>/<papel>`. |
| Modes | Modes combinariam modalidade e contexto. |
| Previews | Previews agrupados por etapa e mode combinado. |
| IDS | Collections IDS coexistiriam, mas a selection de modalidade dependeria do mode. |

**Impacto:** simplifica o numero de collections, mas conflita com a regra de
que modalidade muda estrutura e nunca e mode. Nao pode ser aprovada sem uma
mudanca explícita dessa regra canônica.

### C. Conteudo global por dominio, com selecao por bindings locais

| Aspecto | Proposta |
| --- | --- |
| Collections | Uma collection global, organizada por dominio visual. |
| Caminho de variavel | `<dominio>/<etapa>/<tela>/<papel>`. |
| Modes | Contextos seriam resolvidos por bindings em cada template. |
| Previews | Previews precisariam declarar bindings e modes em mais de um nível. |
| IDS | Collections IDS coexistiriam, mas cada template ficaria responsável por resolver o contexto. |

**Impacto:** favorece agrupamento visual, mas quebra a herança unica de mode
na Section e aumenta o risco de bindings locais divergentes. Nao pode ser
aprovada enquanto essa regra canônica continuar vigente.

## Registro da aprovacao

Quando houver decisao humana, mantenha somente a alternativa aprovada e
atualize o bloco inicial, por exemplo:

```yaml
status: APROVADO
alternativa: A
aprovadoPor: DESIGNER
aprovadoEm: 2026-08-05
```

O `pacote-montagem.json` registra o hash deste documento aprovado. Sem esse
vínculo, uma entrega de montagem nao pode seguir para o Validador.
