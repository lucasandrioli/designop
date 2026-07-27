# Etapa: simular-e-contratar

## Identificação
- Nome da etapa: `simular-e-contratar`
- Nível na jornada macro: ver docs/estrutura-lib.md (uma das 4 etapas
  macro: consentimento | simular-e-contratar | revisar | formalizar)
- **Modalidade coberta por este documento: PRIMEIRA CONCESSÃO.**

## Aviso: este doc cobre só a primeira concessão

Medido no Teste 16 (docs/fila-de-testes.md), comparando a mesma etapa e
o MESMO cluster nas duas modalidades: o refinanciamento é
estruturalmente disjunto. As 3 seções do corpo da primeira concessão
(campo-valor, oferta-seguro, oferta-portabilidade) não existem no
refin, e as 3 do refin (contrato-atual, composição-troco, banner de
prazo do troco) não existem aqui. Nenhuma das variáveis do contrato
abaixo tem alvo na tela de refinanciamento.

Consequência: o refinanciamento precisa do próprio documento
(`docs/etapas/simular-e-contratar-refin.md`), do próprio template
(`simular-e-contratar/refin/tpl-simulacao`) e do próprio contrato de
variáveis — que, pela medição, é quase vazio: quase tudo na tela de
refin é dado de runtime (saldo devedor, parcelas pagas, troco, taxas)
ou rótulo fixo. Único candidato a variável de cluster identificado até
agora: o prazo do troco. [CONFIRMAR]

O que as duas modalidades COMPARTILHAM é a camada de componente
(header-fluxo, campo-valor, totalizador, botão — mesmas keys, mesmos
variants), não a estrutura da tela. Ver docs/estrutura-lib.md,
"Modalidade na nomenclatura".

## Telas que compõem esta etapa

### Principal (nível 1, caminho feliz)

| Template | Componente na lib | Observado em |
| --- | --- | --- |
| Simulação | `simular-e-contratar/tpl-simulacao` | Lab - Consignado Piloto, node `73:102`, construído e validado via os 3 agentes reais (comparador/montador/validador) em 2026-07-25 — ver docs/fila-de-testes.md, Teste 10 |

### Nível 2 (opcional, alcançável a partir do nível 1)

| Template | Componente na lib | Gatilho (nível 1) | Observado em |
| --- | --- | --- | --- |
| Edição de valor | `simular-e-contratar/tpl-edicao-valor` | toque no `campo-valor` da tela principal | Lab - Consignado Piloto, node `80:101`, 2026-07-25 |
| Edição de parcelas | `simular-e-contratar/tpl-edicao-parcelas` | toque na parcela/prazo da tela principal | Lab - Consignado Piloto, node `83:269`, 2026-07-25 |
| Detalhes do seguro | `simular-e-contratar/tpl-detalhe-seguro` | seta de ação (`Mostrar ação`) do item-lista "oferta-seguro" | Lab - Consignado Piloto, node `81:103`, 2026-07-25 — **conteúdo placeholder `[EXEMPLO]`, copy real de cobertura/preço ainda [CONFIRMAR]** |

Edição de valor: campo de texto editável (não slider), com a faixa
min/max do convênio como texto de apoio abaixo. Edição de parcelas:
lista vertical de opções fixas (`opcao-parcela`, componente novo no
Mini DS), uma linha por prazo com o valor da parcela resultante e
indicador de seleção — não é slider. Detalhes do seguro: além de
informativo, tem ação própria de adicionar/remover a oferta nesta tela
(não só na principal) — decisão confirmada pelo designer, 2026-07-25.

Componente novo criado no Mini DS pra viabilizar isso: `opcao-parcela`
(variant Estado=selecionado/não-selecionado, properties Prazo e Valor
parcela — ambas texto, sem binding de cluster ainda definido).

### Erro de regra de negócio (específico desta etapa)
[CONFIRMAR] — sem caso real ainda. Candidatos possíveis a levantar com
o designer: valor solicitado fora da faixa (`simulacao/faixa-valor` já
define min/max por cluster — hoje isso é limite do campo, não
necessariamente uma tela de erro separada), cliente sem margem
consignável disponível.

### Erro de sistema (genérico)
[CONFIRMAR] — inclusive se é compartilhado entre etapas ou próprio
desta.

## Comportamento de campo
`campo-valor` na tela principal continua DISPLAY-only (não editável
inline) — a edição acontece numa tela de nível 2 própria
(`tpl-edicao-valor`), com `campo-texto` (Estado=padrão/erro, já existe
no Mini DS). Resolvido: não é slider, é campo de texto digitável.
Prazo/parcela segue o mesmo padrão: não editável inline na tela
principal, edição em `tpl-edicao-parcelas` via lista de opções fixas
(`opcao-parcela`), não slider.

## Componentes do IDS tipicamente usados
header-fluxo, campo-valor, item-lista (papéis: oferta-seguro,
oferta-portabilidade), totalizador, botão (nível 1); campo-texto,
opcao-parcela, linha-checkbox (nível 2).

## Variáveis que esta etapa espera (contrato)

| Variável | Tipo | Obrigatória se etapa ativa |
| --- | --- | --- |
| `simulacao/rotulo-valor` | STRING | sim |
| `simulacao/faixa-valor` | STRING | sim |
| `oferta-seguro/texto-suporte` | STRING | sim, quando `elegibilidade/mostra-seguro` = true |
| `elegibilidade/mostra-seguro` | BOOLEAN | sim |
| `elegibilidade/mostra-portabilidade` | BOOLEAN | citada em docs/clusters/c1-mg.md R3, ainda não implementada (achado do validador, Teste 10) |

Taxa vigente e valor de parcela do totalizador ficam FORA deste
contrato: são dado de runtime (saída do motor de simulação), não
conteúdo de design — decisão do designer, 2026-07-25.

## Histórico
- 2026-07-25: primeira versão, criada depois do ciclo real dos 3
  agentes (Teste 10). Só a tela principal está confirmada; erro de
  sistema, erro de regra de negócio, nível 2 e comportamento de campo
  ficam [CONFIRMAR] até haver caso real — não inventados para preencher
  a estrutura.
- 2026-07-25 (mesmo dia, mais tarde): 3 telas de nível 2 confirmadas
  pelo designer e construídas — edição de valor, edição de parcelas,
  detalhes do seguro. Erro de sistema e erro de regra de negócio
  continuam [CONFIRMAR]. Componente novo `opcao-parcela` criado no
  Mini DS e publicado.
