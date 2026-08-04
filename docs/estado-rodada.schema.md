# Estado de rodada - Fase 0

Cada rodada do Operador cria um arquivo temporario em
`.designops/runs/<id>/estado.json`. Ele nao e documento de negocio e nao
entra em commit. Serve somente para o Operador retomar uma conversa sem
repetir trabalho.

```json
{
  "versao": 1,
  "id": "<data>-leitura-etapas",
  "tipo": "leitura_preparo",
  "status": "em_andamento",
  "etapas": [
    {
      "nome": "<etapa-a>",
      "status": "pronta_para_analise",
      "catalogo": "docs/etapas/<etapa-a>.md",
      "mapas": ["docs/mapas/<modalidade>.md"],
      "manuais": [
        "docs/contextos/<contexto-a>.md",
        "docs/contextos/<contexto-b>.md"
      ],
      "leitores_concluidos": ["leitor-<etapa-a>"],
      "bloqueios": [],
      "pendencias_nao_bloqueantes": [],
      "proximo_passo": "/consignado-analise"
    }
  ],
  "decisoes_para_designer": [],
  "eventos": [
    {
      "momento": "2026-07-30T15:00:00-03:00",
      "tipo": "rodada_iniciada",
      "mensagem": "Leitores iniciados para as etapas informadas."
    }
  ]
}
```

## Valores permitidos

`status` da rodada:

- `em_andamento`
- `aguardando_designer`
- `concluida`
- `interrompida`

`status` da etapa:

- `pronta_para_analise`
- `precisa_contexto`
- `bloqueada`

Um bloqueio deve dizer o que falta e em qual documento ou decisao ele
precisa ser resolvido. Nao deve conter uma regra inventada.

Uma pendencia nao bloqueante tambem deve registrar sua origem, mas nao
impede a proxima fase quando manuais-base e mapa da rodada ja definem o
recorte interno pedido. Exemplos: detalhe de canal externo fora da
biblioteca ou uma jornada futura que nao participa desta rodada.

`leitores_concluidos` lista os subagentes que efetivamente devolveram um
cartao. O Operador so pode concluir a rodada quando houver um Leitor para
cada etapa pedida.
