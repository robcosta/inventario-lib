/**
 * ============================================================
 * UI — ABRIR PASTA NO NAVEGADOR
 * ============================================================
 *
 * Abre uma pasta do Google Drive em nova aba.
 *
 * @param {string} pastaId
 */
function abrirPastaNoNavegador_(pastaId) {

  const url = `https://drive.google.com/drive/folders/${pastaId}`;

  const html = HtmlService.createHtmlOutput(
    `<script>
       window.open('${url}', '_blank');
       google.script.host.close();
     </script>`
  ).setWidth(10).setHeight(10);

  SpreadsheetApp.getUi().showModalDialog(html, 'Abrindo pasta...');
}
