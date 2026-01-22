/**
 * ============================================================
 * CONTEXTO — CLIENT (UTILS)
 * ============================================================
 */

function _client_obterContexto() {
  const raw = PropertiesService
    .getDocumentProperties()
    .getProperty('CONTEXTO_TRABALHO');

  return raw ? JSON.parse(raw) : null;
}

function _client_temContexto() {
  return !!_client_obterContexto();
}
