/**
 * ============================================================
 * CSV — UPLOAD
 * ============================================================
 */

function _admin_csvAbrirUpload() {
  const html = HtmlService
    .createHtmlOutputFromFile('admin/csv/admin_csv_ui')
    .setWidth(500)
    .setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, 'Enviar CSV');
}
