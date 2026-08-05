# Teste 01: importacao de plugin Figma

Este experimento confirma somente se o ambiente permite importar e executar
um plugin local do Figma. Ele nao usa rede, Copilot Studio, MCP, biblioteca,
variaveis ou referencias do DesignOps.

## Conteudo

- `manifest.json`: declara um plugin Figma sem qualquer acesso de rede.
- `code.js`: cria um unico frame de teste, de 360 x 100, na pagina atual.

## Como executar

1. Abra um arquivo Figma descartavel no aplicativo desktop.
2. Acesse **Plugins** > **Development** > **Import plugin from manifest...**.
3. Selecione o arquivo `manifest.json` desta pasta.
4. Execute **Plugins** > **Development** > **DesignOps - Teste 01**.

## Resultado esperado

O plugin cria, no centro da viewport, um frame azul-claro chamado
`_teste-plugin-designops` e mostra a notificacao de sucesso.

Se a importacao exigir um `id`, crie um plugin vazio pelo proprio Figma para
ele gerar o identificador e acrescente esse valor ao manifesto. Nao reutilize
o identificador de outro plugin.

## Evidencia a registrar

- A importacao foi aceita ou bloqueada.
- O item apareceu ou nao em **Plugins** > **Development**.
- Ao executar, o frame apareceu ou a mensagem de erro exibida.

Nao execute este teste em uma biblioteca ou arquivo de trabalho real.
