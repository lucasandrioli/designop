#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const failures = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`Arquivo ausente: ${relativePath}`);
    return '';
  }

  return fs.readFileSync(absolutePath, 'utf8');
}

function requireText(file, content, expected) {
  if (!content.includes(expected)) {
    failures.push(`${file} precisa conter: ${expected}`);
  }
}

const analyst = read('.github/agents/analista.agent.md');
const analysis = read('.github/skills/consignado-analise/SKILL.md');
const reconstruction = read('.github/skills/figma-reconstrucao/SKILL.md');
const roles = read('docs/contrato-papeis.md');

requireText('.github/agents/analista.agent.md', analyst, 'screenshots das referencias');
requireText('.github/agents/analista.agent.md', analyst, 'nao pede promocao');
requireText('.github/agents/analista.agent.md', analyst, 'Uma solicitacao `/consignado-analise` ja pede a proposta completa');
requireText('.github/agents/analista.agent.md', analyst, '`get_libraries` apenas lista bibliotecas conectadas');
requireText('.github/agents/analista.agent.md', analyst, 'Mesmo que um catalogo registre que um rascunho foi criado em rodada');
requireText('.github/agents/analista.agent.md', analyst, 'Toda\nseta observada precisa mostrar node de origem');
requireText('.github/agents/analista.agent.md', analyst, 'Nao tente\ncarrega-las por `figma-get_figma_skill`');
requireText('.github/agents/analista.agent.md', analyst, 'nao leia seus\nbindings, modes, previews ou layout');
requireText('.github/agents/analista.agent.md', analyst, 'nao capture screenshot nem contexto dessa verificacao');

requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'tabela de reacoes');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'CONTEUDO_POR_CLUSTER');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'DADO_TRANSACIONAL');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'biblioteca,\ncomponente ou token, key real');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'valor aproximado nao entra no contrato');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'Nunca proponha placeholder');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'ANALISE INCOMPLETA');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'contexts representativos sao sempre frames `ref-*`');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'uma quinta\ninstancia oculta na referencia e artefato tecnico');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'Nao leia bindings, modes, layout,');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'previews ou screenshots deles');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'ANALISE PARCIAL');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'findAll` nao inclui o proprio frame');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'Nao abrevie keys na proposta');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'Escopo\naprovavel agora');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, '`get_libraries` so informa quais bibliotecas estao conectadas');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'Nao transforme nome de instancia, nome de variant ou lista de bibliotecas');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, '`PROPOSTA PARA APROVACAO`');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, '`ANALISE INCOMPLETA`');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'NAO VERIFICADA NESTA RODADA');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'comecar classificado como `DADO_TRANSACIONAL`');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, '`get_variable_defs` ou a fonte equivalente');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'Marcadores como "varia", "idem",');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'O inverso tambem vale: se a referencia usa texto ou um componente IDS');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'orientacao -> direcionamento` e `orientacao -> tutorial-1');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, '`papel`, `pai`, `ordem`, `tipo de no`, `sizing`');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, '`papel`, `biblioteca`, `componente\nou token`, `key inteira`');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'mantenha a tela\n`BLOQUEADA` nesta rodada');
requireText('.github/skills/consignado-analise/SKILL.md', analysis, 'Artefato tecnico de referencia, por exemplo `flowStartingPoint` sem nome');
requireText('docs/contrato-papeis.md', roles, 'Inventario nao e uma entrega separada do Analista');
requireText('docs/contrato-papeis.md', roles, 'O Analista prova prototipos na referencia na rodada atual');
requireText('docs/contrato-papeis.md', roles, 'Uma proposta para aprovacao precisa mostrar a bifurcacao completa');

requireText('.github/skills/figma-reconstrucao/SKILL.md', reconstruction, 'Asset proprietario obrigatorio ausente');
requireText('docs/contrato-papeis.md', roles, 'evidencia\nde leitura visual, reacoes e IDS');
requireText('docs/contrato-papeis.md', roles, '`_verificacao-*` e territorio do\nValidador');

if (failures.length > 0) {
  console.error('Portoes da analise reprovados:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Portoes da analise aprovados: evidencia, IDS e limites de papel estao exigidos.');
