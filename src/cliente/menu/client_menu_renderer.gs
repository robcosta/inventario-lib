/**
 * ============================================================
 * MENU CLIENT — RENDERIZAÇÃO
 * ============================================================
 */

function renderMenuClient() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('📦 Inventário Patrimonial');

  if (!_client_temContexto()) {
    menu
      .addItem('ℹ️ Atualizar Informações', 'clientAtualizarInformacoes')
      .addToUi();
    return;
  }

  menu
    .addItem('🔄 Atualizar Informações', 'clientAtualizarInformacoes')
    .addSeparator()
    .addItem('📂 Abrir Pasta de Trabalho', 'clientAbrirPastaTrabalho')
    .addItem('▶️ Processar Imagens', 'clientProcessarImagens')
    .addToUi();
}
