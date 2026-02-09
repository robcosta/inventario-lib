/**
 * ============================================================
 * CSV — DIALOG (GENÉRICO)
 * ============================================================
 */
function abrirDialogImportacaoCSV_(tipo) {
  if (!tipo || typeof tipo !== 'string') {
    throw new Error('Tipo de destino inválido para importação CSV.');
  }

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