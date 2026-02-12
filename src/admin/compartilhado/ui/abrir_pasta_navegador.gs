/**
 * ============================================================
 * UI — ABRIR PASTA NO NAVEGADOR
 * ============================================================
 *
 * Abre uma pasta do Google Drive em nova aba
 * exibindo o nome da pasta no modal.
 *
 * @param {string} pastaId
 */

function abrirPastaNoNavegador_(pastaId) {

  if (!pastaId) {
    SpreadsheetApp.getUi().alert('❌ ID da pasta inválido.');
    return;
  }

  let nomePasta = 'Pasta';

  try {
    const pasta = DriveApp.getFolderById(pastaId);
    nomePasta = pasta.getName();
  } catch (e) {
    SpreadsheetApp.getUi().alert(
      '❌ Não foi possível acessar a pasta.\n\n' + e.message
    );
    return;
  }

  const url = `https://drive.google.com/drive/folders/${pastaId}`;

  const html = HtmlService.createHtmlOutput(`
    <script>
      window.open('${url}', '_blank');
      google.script.host.close();
    </script>
  `).setWidth(10).setHeight(10);

  SpreadsheetApp
    .getUi()
    .showModalDialog(html, `Abrindo pasta: ${nomePasta}`);
}
