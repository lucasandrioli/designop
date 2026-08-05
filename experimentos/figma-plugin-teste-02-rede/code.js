async function runNetworkProbe() {
  try {
    const response = await fetch(
      "https://httpbin.org/get?source=designops-figma-plugin-test-02"
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    await response.json();
    figma.notify(`Teste de rede aprovado (HTTP ${response.status}).`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    figma.notify(`Teste de rede bloqueado ou falhou: ${message}`, {
      error: true
    });
  } finally {
    figma.closePlugin();
  }
}

runNetworkProbe();
