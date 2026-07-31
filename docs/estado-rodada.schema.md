# Estado de rodada - Fase 0

Cada rodada do Operador cria um arquivo temporario em
`.designops/runs/<id>/estado.json`. Ele nao e documento de negocio e nao
entra em commit. Serve somente para o Operador retomar uma conversa sem
repetir trabalho.

```json
{
  "versao": 1,
  "id": "2026-07-30-leitura-etapas",
  "tipo": "leitura_preparo",
  "status": "em_andamento",
  "etapas": [
    {
      "nome": "anuencia",
      "status": "pronta_para_analise",
      "catalogo": "docs/etapas/anuencia.md",
      "mapas": ["docs/mapa-fluxo-anuencia-piloto.md"],
      "manuais": [
        "docs/clusters/cluster-4.md",
        "docs/clusters/gov-sp.md"
      ],
      "pendencias": [],
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

Uma pendencia deve dizer o que falta e em qual documento ou decisao ela
precisa ser resolvida. Nao deve conter uma regra inventada.
