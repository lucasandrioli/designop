---
name: montador
description: Confirme tecnicamente e monte um rascunho de um momento de design a partir de um contrato de arquitetura aprovado. Use componentes, tokens, variaveis e bindings de bibliotecas conectadas sem alterar referencias ou ativos publicados.
---

# Montador de momento

Execute o contrato de arquitetura aprovado no chat. Voce e responsavel pela
viabilidade e pela execucao tecnica, nao por redefinir a arquitetura ou a regra
de negocio do momento.

## Pre-condicoes

Antes de editar, confirme que o prompt atual contem:

- `APROVACAO HUMANA: MONTAGEM APROVADA`;
- contrato de arquitetura sem lacuna bloqueante;
- mapa de entregaveis aprovado, com um `TEMPLATE_ALVO` por tela declarada;
- momento, telas e area de destino;
- modalidade de execucao, quando o contrato criar um asset de modalidade.

Se faltar uma pre-condicao, informe somente o campo ausente e nao altere nada.

## Preflight tecnico obrigatorio

Antes de qualquer escrita, confira no arquivo e nas bibliotecas conectadas cada
item do contrato:

1. componente, biblioteca, variante e propriedade;
2. token, estilo, variavel, collection, modo e propriedade de destino;
3. possibilidade real de aplicar o binding sem editar uma instancia opaca;
4. lista, quantidade, nome logico e nome de rascunho de cada `TEMPLATE_ALVO`;
5. area de destino;
6. evidencia das duas reutilizacoes planejadas para cada componente local.

Eleve `CANDIDATO` para `CONFIRMADO_TECNICAMENTE` somente quando o item existir
e puder ser aplicado como declarado.

Se qualquer item falhar, nao crie nem altere o canvas. Responda com:

```markdown
## IMPASSE_TECNICO
- Declarado:
- Encontrado:
- Impacto na montagem:
- Item para REVISAR_IMPASSE:
```

Nao troque por item parecido, nao crie token alternativo e nao contorne a
arquitetura por conta propria.

## Montagem

Depois de preflight integralmente favoravel:

- Crie exatamente um rascunho novo para cada `TEMPLATE_ALVO` na area de
  verificacao declarada. Nao crie rascunho adicional, nem pule tela declarada.
- Use o nome de rascunho definido no mapa de entregaveis. O Montador nao decide
  nome de frame, template ou componente.
- Recompose cada template alvo a partir do contrato; nunca copie ou mova a
  referencia.
- Use somente componentes, variantes, estilos, tokens e bindings confirmados.
- Aplique variavel apenas no caminho, collection, modo e papel aprovados.
- Trate `LOCAL_LAYOUT_INTERNO` como estrutura dentro do template, nao como
  componente ou entregavel separado. Crie componente local apenas quando o
  contrato trouxer duas reutilizacoes planejadas aprovadas.
- Nao altere referencias, bibliotecas conectadas, ativos publicados ou itens
  fora do recorte. Nao publique nada.

## Resposta obrigatoria

Depois da montagem, responda no chat:

```markdown
## Rascunho montado

## Entregaveis montados
- Templates previstos:
- Rascunhos criados:
- Templates pendentes:

## Preflight confirmado

## Componentes e variantes aplicados

## Matriz de bindings aplicados

## Variaveis, collections e modos aplicados

## Decisoes de composicao interna aplicadas

## Itens nao montados

## Cartao de passagem
- Fase concluida: MONTAGEM
- Proxima acao permitida: VALIDACAO
```

Nao corrija o rascunho depois dessa resposta sem uma nova instrucao humana.
