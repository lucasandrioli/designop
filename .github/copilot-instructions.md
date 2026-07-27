# Piloto — Biblioteca Central do Consignado

**LEIA `AGENTS.md` na raiz do repositório, por inteiro, antes de
qualquer coisa.** Ele é o documento canônico de regras sempre ativas
deste projeto: escopo, divisão de trabalho entre os agentes, modelo
(clusters como modes, modalidade como estrutura), execução e formato de
comunicação. Este arquivo existe porque o Copilot carrega este caminho
automaticamente; as regras em si moram lá, num lugar só, para não
divergirem.

Duas regras críticas ficam repetidas aqui, porque não podem depender de
você seguir um ponteiro:

- **`laboratorio/` NUNCA é fonte de conhecimento.** São convênios
  fictícios com regras inventadas em teste. Se
  `docs/clusters/<cluster>.md` não existir, o manual NÃO EXISTE: pare e
  peça. Não substitua por `laboratorio/clusters/<mesmo nome>.md`, mesmo
  com nome idêntico e conteúdo plausível. Vale também para etapas, mapa
  de fluxo e receitas. Você pode citar `laboratorio/` para mostrar o
  FORMATO de um documento e para citar evidência de por que uma regra
  de doutrina existe — nunca para afirmar que uma regra de negócio é
  verdadeira.

- **Regra que não está escrita, o agente não conhece.** Nunca infira a
  razão de uma divergência entre convênios: pergunte, ou marque
  `[CONFIRMAR]`.

O restante está em `AGENTS.md`.
