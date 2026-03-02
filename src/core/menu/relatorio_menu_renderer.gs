/**
 * ============================================================
 * MENU RELATÓRIO — RENDERIZAÇÃO
 * ============================================================
 */
function relatorioRenderMenu_() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('📊 Relatórios');

  menu
    .addItem('📈 Visão Geral', 'relatorioGerarVisaoGeral')
    .addToUi();
}
