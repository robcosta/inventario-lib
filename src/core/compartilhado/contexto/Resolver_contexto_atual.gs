function resolverContextoAtual_() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const id = ss.getId();

  // 1️⃣ Tenta como ADMIN (ScriptProperties)
  const rawAdmin = PropertiesService
    .getScriptProperties()
    .getProperty(CONTEXTO_KEYS.PREFIXO + id);

  if (rawAdmin) {
    return JSON.parse(rawAdmin);
  }

  // 2️⃣ Tenta como CLIENTE (DocumentProperties)
  const rawCliente = PropertiesService
    .getDocumentProperties()
    .getProperty('CONTEXTO_CLIENTE');

  if (rawCliente) {
    return JSON.parse(rawCliente);
  }

  return null;
}
