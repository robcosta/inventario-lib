/**
 * ============================================================
 * MENU ADMIN — RENDERIZAÇÃO
 * ============================================================
 */

function adminRenderMenu_(){
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('🏛️ Inventário – Administração');

  if (planilhaTemContexto_()) {
    menu
      .addItem('🔁 Selecionar Contexto', 'selecionarContextoTrabalho')
      .addItem('🔐 Gerenciar Acessos', 'gerenciarAcessosContexto')
      .addSeparator()
      .addItem('⚙️ Configurar Planilha Base', 'configurarPlanilhaBase')
      .addItem('🎨 Formatar Planilha Cliente', 'formatarPlanilhaCliente')
      .addSeparator()
      .addItem('📤 Enviar CSV', 'enviarCSV')
      .addItem('📊 Popular Operacional', 'popularPlanilhaOperacional')
      .addItem('🎨 Formatar Operacional', 'formatarPlanilhaOperacional')
      .addSeparator()
      .addItem('🗂️ Pastas de Trabalho', 'abrirPastasTrabalho')
      .addItem('🧪 Diagnóstico', 'executarDiagnostico');
  } else {
    menu.addItem('➕ Criar Contexto de Trabalho', 'criarContextoTrabalho');
  }

  menu.addToUi();
}
