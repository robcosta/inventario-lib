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
    .addSubMenu(
      ui.createMenu('🗂️ Pastas de Trabalho')
        .addItem('📂 Abrir pasta de trabalho', 'clientAbrirPastaTrabalho')
        .addItem('🔁 Escolher pasta', 'clientEscolherPastaTrabalho')
        .addItem('➕ Criar pasta', 'clientCriarPastaTrabalho')
    )
    .addSeparator()
    .addItem('🖼️ Processar Imagens', 'clientProcessarImagens')
    .addSeparator()
    .addItem('📘 Abrir Planilha Geral', 'clientAbrirPlanilhaGeral')
    .addItem('📗 Abrir Planilha Contexto', 'clientAbrirPlanilhaContexto')
    .addToUi();
}
