/**
 * ============================================================
 * MENU ADMIN — RENDERIZAÇÃO
 * ============================================================
 */

function adminRenderMenu_() {

  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('🏛️ Inventário – Administração');

  if (!planilhaTemContexto_()) {
    menu
      .addItem('➕ Criar Contexto de Trabalho', 'criarContextoTrabalho')
      .addToUi();
    return;
  }

  // ==========================================================
  // CONTEXTO
  // ==========================================================
  menu
    .addItem('🔁 Selecionar Contexto', 'selecionarContextoTrabalho')
    .addItem('🔐 Gerenciar Acessos', 'gerenciarAcessosContexto')
    .addSeparator();


  // ==========================================================
  // PROCESSAR IMAGEM - API VISION
  // ==========================================================
  menu
    .addSeparator()
    .addItem('🖼️ Processar Imagem (Teste)', 'processarImagem')
    .addSeparator();
  // ==========================================================
  // PLANILHA GERAL
  // ==========================================================
  menu
    .addSubMenu(
      ui.createMenu('📘 Planilha Geral')
        .addItem('📂 Abrir Planilha', 'abrirPlanilhaGeral')
        .addItem('📤 Importar CSV', 'importarCSVGeral')
        .addItem('🎨 Formatar Planilha Geral', 'formatarPlanilhaGeral')
        .addItem('🧱 Criar / Recriar', 'criarOuRecriarPlanilhaGeral')
    )
    .addSeparator();

  // ==========================================================
  // PLANILHA CONTEXTO
  // ==========================================================
  menu
    .addSubMenu(
      ui.createMenu('📗 Planilha Contexto')
        .addItem('📤 Importar CSV', 'importarCSVContexto')
        .addItem('📊 Popular', 'popularPlanilhaContexto')
        .addItem('🎨 Formatar', 'formatarPlanilhaContexto')
    )
    .addSeparator();

  // ==========================================================
  // CLIENTE / SUPORTE
  // ==========================================================
  menu
    .addItem('🎨 Formatar Planilha Cliente', 'formatarPlanilhaCliente')
    .addSeparator()
    .addItem('🗂️ Pastas de Trabalho', 'abrirPastasTrabalho')
    .addItem('🧪 Diagnóstico', 'executarDiagnostico');

  menu.addToUi();
}

