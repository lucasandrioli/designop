# Receita: tela de simulacao

## Anatomia
Herda docs/receitas/_comuns.md. Estrutura especifica:

    raiz (360, VERTICAL, FIXED)
    +- header-fluxo [IDS]  (Titulo: "Simulacao", voltar+fechar visiveis)
    +- corpo (gap 24, pad 24/16)
    |  +- campo-valor [IDS]        (Rotulo, Valor, Faixa)
    |  +- oferta-seguro [item-lista IDS]
    |  +- oferta-portabilidade [item-lista IDS]
    |  +- [aviso-consentimento: so em alguns clusters]
    +- totalizador [IDS] (Selecao=ambos por padrao)
    +- acao-rodape (pad 12/16)
       +- botao primario [IDS] (Rotulo: "Continuar")

## Componentes usados e properties tipicas
- header-fluxo: Titulo=<nome da etapa>, Mostrar voltar=true,
  Mostrar fechar=true
- campo-valor: Rotulo=<pergunta>, Valor=<simulado>, Faixa=<min a max>
- item-lista (x2, ofertas): Mostrar tag=true, Mostrar acao=true,
  Mostrar texto de suporte=true, Midia=icone
- totalizador: Selecao=<estado das ofertas>, Taxa original/vigente,
  Valor parcela
- botao: Tipo=primario, Rotulo="Continuar"

## Bindings observados (o que vira variavel de cluster)
- campo-valor.Rotulo  -> simulacao/titulo
- campo-valor.Faixa   -> simulacao/faixa
- oferta-seguro (texto de suporte) -> oferta/seguro-suporte
- totalizador (taxa vigente) -> simulacao/taxa-vigente
- aviso-consentimento (visible) -> consentimento/mostra-aviso
Nota: no lab estes bindings foram feitos em NO INTERNO. Pela doutrina
atual (teste 9), o correto e bindar na PROPERTY. Corrigir na proxima
iteracao.

## Observado em
ref-simulacao/c1-mg (6:54), ref-simulacao/c4-federais (6:103)
Arquivo: Lab - Consignado Piloto. Data: 2026-07-12.
Amostras: 2. Confianca: BAIXA.
