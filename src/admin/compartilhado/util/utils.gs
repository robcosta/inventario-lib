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
 * ============================================================
 * ABRIR PLANILHA NO NAVEGADOR (NOVA ABA)
 * ============================================================
 */

function abrirPlanilhaNoNavegador_(spreadsheetId) {

  const url =
    'https://docs.google.com/spreadsheets/d/' + spreadsheetId;

  const html = `
    <script>
      window.open('${url}', '_blank');
      google.script.host.close();
    </script>
  `;

  const dialog = HtmlService
    .createHtmlOutput(html)
    .setWidth(10)
    .setHeight(10);

  SpreadsheetApp
    .getUi()
    .showModalDialog(dialog, 'Abrindo planilha...');
}

/**
 * ============================================================
 * UI — TOAST
 * ============================================================
 */

function toast_(mensagem, titulo, tempo) {
  const ss = SpreadsheetApp.getActive();
  ss.toast(
    mensagem,
    titulo || 'Inventário',
    tempo || 5
  );
}
