# Receita: <tipo de tela>

Receitas sao escritas pelo agente APRENDIZ, nao por voce. Ele observa as
telas que o designer constroi e extrai o padrao. Esta pasta comeca
vazia: ela se enche sozinha conforme o designer trabalha.

Serve ao Bloco 3 (custodiante): quando houver receita suficiente, o
montador podera construir tela nova no padrao do designer em vez de
so variabilizar tela existente. Ate la, esta pasta e so acumulo.

Um arquivo por tipo de tela: `<etapa>-<tela>.md`.

## Anatomia
Herda `docs/receitas/_comuns.md`. Estrutura especifica:

    raiz (<largura>, <VERTICAL|HORIZONTAL>, <sizing>)
    +- <secao> [IDS]
    +- corpo
    |  +- <instancia>
    +- <rodape>

## Componentes usados e properties tipicas
- `<componente>`: `<Property>=<valor tipico>`

## Amostragem
- Observado em: `<telas, quantas>`
- Confianca: `<ALTA (5+ telas) | MEDIA (3-4) | BAIXA (1-2)>`

Receita com confianca BAIXA e hipotese, nao padrao. O montador nao deve
construir a partir dela sem confirmar com o designer.

## Regras derivadas (a confirmar)
<padroes que parecem valer sempre, mas com poucas amostras>
