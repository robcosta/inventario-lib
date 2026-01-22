/**
 * ============================================================
 * CSV — DIALOG
 * ============================================================
 */

function abrirDialogImportacaoCSV_(tipo) {

  const html = HtmlService
    .createHtmlOutputFromFile('shared/csv/csv_upload')
    .setWidth(500)
    .setHeight(300);

  html.tipoDestino = tipo;

  SpreadsheetApp
    .getUi()
    .showModalDialog(html, 'Importar CSV');
}
