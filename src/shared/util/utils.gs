/**
 * ============================================================
 * UTILITÁRIOS ADMINISTRATIVOS
 * ============================================================
 */

function obterPastaInventario_() {
  const it = DriveApp.getFoldersByName('Inventario Patrimonial');
  return it.hasNext() ? it.next() : null;
}

function obterOuCriarSubpasta_(pai, nome) {
  const it = pai.getFoldersByName(nome);
  return it.hasNext() ? it.next() : pai.createFolder(nome);
}

function admin_planilhaTemContexto_() {
  return !!PropertiesService
    .getDocumentProperties()
    .getProperty('ADMIN_CONTEXTO_ATIVO');
}

/**
 * Retorna o contexto ativo da planilha (ou null)
 */
function obterContextoAtivo_() {
  const raw = PropertiesService
    .getDocumentProperties()
    .getProperty('ADMIN_CONTEXTO_ATIVO');

  return raw ? JSON.parse(raw) : null;
}