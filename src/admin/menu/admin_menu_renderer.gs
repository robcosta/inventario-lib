/**
 * ============================================================
 * MENU ADMIN — RENDERIZAÇÃO
 * ============================================================
 */

/**
 * API PÚBLICA — Renderizar menu (chamada pelo onOpen)
 */
function adminRenderMenu() {
  adminRenderMenu_();
}

function adminRenderMenu_() {

  // Aplica contexto pendente (se existir) na planilha ADMIN atual
  try {
    const aplicado = aplicarContextoAdminPendente_();
    Logger.log('[ADMIN][MENU] Contexto pendente aplicado? ' + aplicado);
  } catch (e) {
    Logger.log('[ADMIN][MENU] Falha ao aplicar contexto pendente: ' + e.message);
  }

  // Se for TEMPLATE, limpa qualquer contexto e mostra apenas criar
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const nome = ss ? ss.getName() : '';
    if (nome && nome.toUpperCase().indexOf('ADMIN: TEMPLATE') !== -1) {
      const planilhaId = ss.getId();
      const chave = PROPRIEDADES_ADMIN.CONTEXTO_ADMIN + '_' + planilhaId;
      PropertiesService.getScriptProperties().deleteProperty(chave);
      PropertiesService.getDocumentProperties().deleteProperty(PROPRIEDADES_ADMIN.CONTEXTO_ADMIN);
      Logger.log('[ADMIN][MENU] TEMPLATE detectada, contexto limpo.');
    }
  } catch (e) {
    Logger.log('[ADMIN][MENU] Falha ao limpar contexto da TEMPLATE: ' + e.message);
  }

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

