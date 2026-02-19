/**
 * ============================================================
 * CLIENTE — FORMATAR PLANILHA (LAYOUT BASE)
 * ============================================================
 */
function formatarPlanilhaCliente_(spreadsheetId) {

  const ss = SpreadsheetApp.openById(spreadsheetId);

  let sheet = ss.getSheetByName("INFORMAÇÕES");

  if (!sheet) {
    const paginaPadrao = ss.getSheetByName("Página1");
    if (paginaPadrao) {
      paginaPadrao.setName("INFORMAÇÕES");
      sheet = paginaPadrao;
    } else {
      sheet = ss.insertSheet("INFORMAÇÕES");
    }
  }

  sheet.clear();
  sheet.clearFormats();
  sheet.setHiddenGridlines(true);

  clienteConstruirLayoutBase_(sheet);

  cliente_formatarAbaManual_(ss.getId());
}
