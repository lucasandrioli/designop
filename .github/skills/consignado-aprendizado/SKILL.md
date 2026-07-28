---
name: consignado-aprendizado
description: Observa uma referencia criada por designer humano e registra receita de construcao em docs/receitas. Use depois de uma tela humana real; nao cria ou altera Figma e nao transforma observacao em regra de negocio.
user-invocable: true
disable-model-invocation: true
---

# Aprendizado de receitas

Esta skill e chamada manualmente com `/consignado-aprendizado`. Ela
acumula como o designer constroi telas, para uso futuro do Bloco 3. Ela
nao participa da analise de regra de negocio nem da montagem atual.

## Recursos obrigatorios

Leia antes de observar ou editar receita:

- [Contrato de papeis](../../../docs/contrato-papeis.md)
- [Plugin API do Figma](../figma-plugin-api/SKILL.md)
- [Molde de receita](../../../docs/receitas/_template.md)
- [Receitas comuns](../../../docs/receitas/_comuns.md)

## Entrada obrigatoria

1. Arquivo Figma, pagina, node da tela e caso de uso observados.
2. Etapa e cluster aos quais a referencia pertence.
3. Confirmacao de que a tela foi criada por um designer humano. Tela de
   agente, placeholder, laboratorio ou arquivo de teste nao vira
   receita.

Se faltar a confirmacao humana, pare e devolva:

```text
[BLOQUEIO] A tela nao esta confirmada como referencia humana.
[PROXIMO PAPEL] Designer
```

## Observacao permitida

Use Figma somente para leitura. Registre fatos observados, nunca uma
intencao que pareca plausivel:

1. Anatomia local: hierarquia, auto layout, sizing, padding,
   espaçamento e comportamento de scroll.
2. Componentes IDS: main component, ordem e properties efetivamente
   aplicadas.
3. Bindings existentes: propriedade ou no interno, com o alvo real.
   Nao conclua que um texto deveria virar variavel.
4. Convencoes de nome e secoes do designer.
5. Padroes que se repetem em mais de uma referencia humana.

Nao compare clusters, nao deduza regra, nao proponha template e nao
chame operacao Figma mutadora. Pedido assim recebe `[FORA DO PAPEL]` e
aponta o agente correto.

## Escrita permitida

O Aprendiz pode editar somente `docs/receitas/`:

- Crie `docs/receitas/<etapa>-<tela>.md` a partir do molde quando a
  receita ainda nao existir.
- Refine receita existente, preservando a observacao anterior e
  registrando o que confirmou ou divergiu.
- Atualize `_comuns.md` somente quando o padrao apareceu em duas ou
  mais referencias humanas.

Registre `Observado em`, data, node IDs e confianca. Uma ou duas telas
produzem confianca baixa, nao uma regra para o Montador.

## Saida

Primeiro, resumo simples da receita criada ou refinada. Depois, a
evidencia observada e o caminho do arquivo alterado.

Encerre com:

```text
[PAPEL CONCLUIDO] Aprendiz
[ENTREGA] receita observada ou pedido de referencia humana
[PENDENCIAS] <lista ou nenhuma>
[PROXIMO PAPEL] nenhum
```
