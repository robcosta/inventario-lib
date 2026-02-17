/**
 * ============================================================
 * UI — ABRIR PLANILHA NO NAVEGADOR (NOVA ABA)
 * ============================================================
 *
 * Abre uma planilha do Google Sheets em nova aba
 * exibindo o nome da planilha no modal.
 *
 * @param {string} spreadsheetId
 */

function abrirPlanilhaNoNavegador_(spreadsheetId) {

  if (!spreadsheetId) {
    SpreadsheetApp.getUi().alert('❌ ID da planilha inválido.');
    return;
  }

  let nomePlanilha = 'Planilha';

  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    nomePlanilha = ss.getName();
  } catch (e) {
    SpreadsheetApp.getUi().alert(
      '❌ Não foi possível acessar a planilha.\n\n' + e.message
    );
    return;
  }

  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/view`;

  const html = HtmlService.createHtmlOutput(`
    <script>
      window.open('${url}', '_blank');
      google.script.host.close();
    </script>
  `).setWidth(10).setHeight(10);

  SpreadsheetApp
    .getUi()
    .showModalDialog(html, `Abrindo planilha: ${nomePlanilha}`);
}
