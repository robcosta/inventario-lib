function persistirContextoAtual_(atualizacoes) {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const id = ss.getId();

  // 🔹 Se for ADMIN
  const rawAdmin = PropertiesService
    .getScriptProperties()
    .getProperty(CONTEXTO_KEYS.PREFIXO + id);

  if (rawAdmin) {
    atualizarContextoAdmin_(atualizacoes);
    return;
  }

  // 🔹 Se for CLIENTE
  const rawCliente = PropertiesService
    .getDocumentProperties()
    .getProperty('CONTEXTO_CLIENTE');

  if (rawCliente) {
    atualizarContextoCliente_(atualizacoes);
    return;
  }

  throw new Error('Nenhum contexto ativo para atualizar.');
}
