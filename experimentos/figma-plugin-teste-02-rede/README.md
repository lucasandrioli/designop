# Teste 02: rede controlada do plugin Figma

Este experimento confirma somente se um plugin local do Figma consegue fazer
uma requisicao HTTPS externa a um dominio explicitamente autorizado.

## Limites do teste

- Destino unico: `https://httpbin.org/get`.
- Nenhum dado do arquivo Figma e enviado.
- Nenhuma credencial, token, chave de API ou agente e usado.
- Nenhum no, componente, variavel ou pagina e criado ou alterado.
- A resposta recebida nao e persistida.

## Como executar

1. Abra um arquivo Figma descartavel no aplicativo desktop.
2. Acesse **Plugins** > **Development** > **Import plugin from manifest...**.
3. Selecione o arquivo `manifest.json` desta pasta.
4. Execute **Plugins** > **Development** > **DesignOps - Teste 02 Rede**.

## Resultado esperado

Se a rede estiver permitida, o Figma mostra:

```text
Teste de rede aprovado (HTTP 200).
```

Se falhar, registre literalmente a notificacao mostrada pelo Figma. O erro
separa bloqueio de rede, restricao de dominio e falha de conectividade antes
de qualquer tentativa de usar Copilot Studio.

## O que este teste nao comprova

Este resultado nao prova que o Copilot Studio, o Direct Line ou um endpoint
interno estao autorizados. Ele valida apenas a capacidade basica de rede do
plugin com uma lista de dominios restrita.
