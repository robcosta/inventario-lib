/**
 * ============================================================
 * MENU ADMIN — RENDERIZAÇÃO
 * ============================================================
 */

<<<<<<< HEAD
function adminRenderMenu_() {

  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('🏛️ Inventário – Administração');

  if (!planilhaTemContexto_()) {
=======
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

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const nomeAtual = ss ? ss.getName() : '';
  const ehTemplate = nomeAtual.toUpperCase().indexOf('TEMPLATE') !== -1;
  const temContexto = planilhaTemContexto_();
  const contexto = obterContextoAtivo_();
  
  Logger.log('[ADMIN][MENU] Planilha: ' + nomeAtual);
  Logger.log('[ADMIN][MENU] É Template? ' + ehTemplate);
  Logger.log('[ADMIN][MENU] Tem Contexto? ' + temContexto);
  Logger.log('[ADMIN][MENU] Contexto: ' + JSON.stringify(contexto));

  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('🏛️ Inventário – Administração');

  // ========== TEMPLATE: Sempre permite criar contexto ==========
  if (ehTemplate) {
    // Limpar qualquer contexto existente no Template (não deveria ter)
    if (contexto) {
      try {
        const planilhaId = ss.getId();
        const chave = PROPRIEDADES_ADMIN.CONTEXTO_ADMIN + '_' + planilhaId;
        PropertiesService.getScriptProperties().deleteProperty(chave);
        PropertiesService.getDocumentProperties().deleteProperty(PROPRIEDADES_ADMIN.CONTEXTO_ADMIN);
        Logger.log('[ADMIN][MENU] TEMPLATE tinha contexto (removido).');
      } catch (e) {
        Logger.log('[ADMIN][MENU] Erro ao limpar Template: ' + e.message);
      }
    }
    Logger.log('[ADMIN][MENU] Renderizando menu Template (Criar Contexto)');
>>>>>>> bugfix-contexto-persistencia
    menu
      .addItem('➕ Criar Contexto de Trabalho', 'criarContextoTrabalho')
      .addToUi();
    return;
  }

<<<<<<< HEAD
=======
  // ========== ADMIN: X sem contexto → Oferecer reparar ==========
  if (!temContexto) {
    Logger.log('[ADMIN][MENU] ADMIN sem contexto válido - oferecendo reparar');
    menu
      .addItem('➕ Criar Contexto de Trabalho', 'criarContextoTrabalho')
      .addItem('🔧 Reparar Contexto', 'repararContextoAdmin')
      .addToUi();
    return;
  }

>>>>>>> bugfix-contexto-persistencia
  // ==========================================================
  // CONTEXTO
  // ==========================================================
  menu
    .addItem('🔁 Selecionar Contexto', 'selecionarContextoTrabalho')
<<<<<<< HEAD
    .addItem('🔐 Gerenciar Acessos', 'gerenciarAcessosContexto')
=======
    .addSubMenu(
      ui.createMenu('🔐 Gerenciar Acessos')
        .addItem('👤 Acesso ADMIN', 'gerenciarAcessosAdmin')
        .addItem('👥 Acesso CLIENTE', 'gerenciarAcessosCliente')
    )
>>>>>>> bugfix-contexto-persistencia
    .addSeparator();


  // ==========================================================
// PASTAS DE TRABALHO
// ==========================================================
menu
  .addSeparator()
  .addSubMenu(
    ui.createMenu('🗂️ Pastas de Trabalho')
<<<<<<< HEAD
      .addItem('➕ Criar pasta', 'criarPastaTrabalho')
      .addItem('🔁 Escolher pasta', 'escolherPastaTrabalho')
=======
      .addItem('📂 Abrir pasta de trabalho', 'abrirPastasTrabalho')
      .addItem('🔁 Escolher pasta', 'escolherPastaTrabalho')
      .addItem('➕ Criar pasta', 'criarPastaTrabalho')
>>>>>>> bugfix-contexto-persistencia
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
<<<<<<< HEAD
    .addItem('🧪 Diagnóstico', 'executarDiagnostico');
=======
    .addSubMenu(
      ui.createMenu('🧪 Diagnóstico')
        .addItem('📊 Executar Diagnóstico', 'executarDiagnostico')
        .addSeparator()
        .addItem('🧪 Testar Planilha Geral', 'runTestsPlanilhaGeral')
    );
>>>>>>> bugfix-contexto-persistencia
  menu.addToUi();
}

