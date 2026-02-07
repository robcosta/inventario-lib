/**
 * ============================================================
 * CSV — DIALOG
 * ============================================================
 */
function abrirDialogImportacaoCSV_(tipo) {

  const template = HtmlService.createTemplateFromFile(
    'admin/compartilhado/csv/csv_upload'
  );

  template.tipoDestino = tipo;

  const html = template
    .evaluate()
    .setWidth(500)
    .setHeight(300);

  SpreadsheetApp
    .getUi()
    .showModalDialog(html, 'Importar CSV');
}
