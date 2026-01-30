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
// PASTAS DE TRABALHO
// ==========================================================
menu
  .addSeparator()
  .addSubMenu(
    ui.createMenu('🗂️ Pastas de Trabalho')
      .addItem('📂 Abrir pasta de trabalho', 'abrirPastasTrabalho')
      .addItem('🔁 Escolher pasta', 'escolherPastaTrabalho')
      .addItem('➕ Criar pasta', 'criarPastaTrabalho')
  )
  .addSeparator();
 
  // ==========================================================
  // PROCESSAR IMAGEM - API VISION
  // ==========================================================
  menu
    .addItem('🖼️ Processar Imagem', 'processarImagem')
    .addSeparator();
  // ==========================================================
  // PLANILHA GERAL
  // ==========================================================
  menu
    .addSeparator()
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
    .addItem('🧪 Diagnóstico', 'executarDiagnostico');
  menu.addToUi();
}

