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
    .addItem('📌 Bens Pendentes', 'relatorioGerarBensPendentes')
    .addItem('✅ Bens Encontrados', 'relatorioGerarBensEncontrados')
    .addItem('📍 Bens de Outra Localidade', 'relatorioGerarBensOutraLocalidade')
    .addItem('🏷️ Bens para Nova Etiqueta', 'relatorioGerarBensEtiquetas')
    .addToUi();
}
