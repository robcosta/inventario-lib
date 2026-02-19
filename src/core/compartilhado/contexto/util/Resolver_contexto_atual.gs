/**
 * ============================================================
 * CONTEXTO — RESOLVER CONTEXTO ATUAL (TIPADO)
 * ============================================================
 *
 * Retorna o contexto ativo com identificação explícita
 * do tipo (ADMIN ou CLIENTE).
 *
 * @returns {Object|null}
 * {
 *   tipo: 'ADMIN' | 'CLIENTE',
 *   origem: 'SCRIPT_PROPERTIES' | 'DOCUMENT_PROPERTIES',
 *   dados: Object
 * }
 */
function resolverContextoAtual_() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const id = ss.getId();

  // ============================================================
  // 1️⃣ Tenta como ADMIN (ScriptProperties)
  // ============================================================
  const rawAdmin = PropertiesService
    .getScriptProperties()
    .getProperty(CONTEXTO_KEYS.PREFIXO + id);

  if (rawAdmin) {
    return {
      tipo: 'ADMIN',
      origem: 'SCRIPT_PROPERTIES',
      dados: JSON.parse(rawAdmin)
    };
  }

  // ============================================================
  // 2️⃣ Tenta como CLIENTE (DocumentProperties)
  // ============================================================
  const rawCliente = PropertiesService
    .getDocumentProperties()
    .getProperty('CONTEXTO_CLIENTE');

  if (rawCliente) {
    return {
      tipo: 'CLIENTE',
      origem: 'DOCUMENT_PROPERTIES',
      dados: JSON.parse(rawCliente)
    };
  }

  return null;
}
