/**
 * ============================================================
 * PASTA — CLIENT
 * ============================================================
 */

function _client_abrirPastaTrabalho() {
  const contexto = _client_obterContexto();
  if (!contexto || !contexto.pastaUnidadeId) return;

  const url = DriveApp
    .getFolderById(contexto.pastaUnidadeId)
    .getUrl();

  SpreadsheetApp.getUi().alert('Abrindo pasta:\n\n' + url);
}
