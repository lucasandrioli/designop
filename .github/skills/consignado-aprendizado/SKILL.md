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

## Como abrir a conversa

Antes de observar, situe a tela humana que sera estudada, diga o que
voce vai descobrir sozinho e peca somente a confirmacao humana caso ela
ainda nao exista. Explique que, ao final, uma receita sera guardada para
uso futuro. Nao comece por node IDs, termos da API ou uma lista de
campos.

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

Se faltar a confirmacao humana, pare e explique:

```text
Ainda preciso confirmar que esta tela foi criada por um designer.
Sem isso, eu nao vou transforma-la em receita.
O proximo passo e o designer indicar uma referencia humana.
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
chame operacao Figma mutadora. Pedido assim recebe uma explicacao de
qual agente cuida disso e do proximo passo correto.

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

Feche dizendo se a receita foi criada ou se faltou referencia humana,
onde ela ficou registrada e como ela podera ser usada no futuro. O
detalhe tecnico vem depois desse resumo.
