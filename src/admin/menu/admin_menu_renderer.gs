/**
 * ============================================================
 * MENU ADMIN — RENDERIZAÇÃO (VERSÃO FINAL CANÔNICA)
 * ============================================================
 *
 * Regras:
 * - ADMIN:TEMPLATE → SOMENTE "Criar Novo Contexto"
 * - ADMIN:<CONTEXTO> SEM contexto válido → SOMENTE "Reparar Contexto"
 * - ADMIN:<CONTEXTO> COM contexto válido → MENU COMPLETO
 *
 * Observação:
 * - Exibe versão do sistema no final do menu (somente informativo)
 */

/**
 * API PÚBLICA — chamada pelo onOpen
 */
function adminRenderMenu() {
  adminRenderMenu_();
}

function adminRenderMenu_() {

  // ==========================================================
  // 0️⃣ Aplicar contexto pendente (troca de contexto)
  // ==========================================================
  try {
    aplicarContextoAdminPendente_();
  } catch (e) {
    Logger.log('[ADMIN][MENU] Contexto pendente não aplicado: ' + e.message);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  const nomeAtual = ss.getName();
  const nomeUpper = nomeAtual.toUpperCase();
  const ehTemplate = nomeUpper.indexOf('TEMPLATE') !== -1;

  const temContexto = planilhaTemContexto_();

  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('🏛️ Inventário – Administração');

  // ==========================================================
  // 1️⃣ ADMIN: TEMPLATE → apenas criar
  // ==========================================================
  if (ehTemplate) {
    menu
      .addItem('➕ Criar Novo Contexto', 'criarContextoTrabalho');

    // Versão (informativa)
    adicionarVersaoAoMenu_(menu);

    menu.addToUi();
    return;
  }

  // ==========================================================
  // 2️⃣ ADMIN:<CONTEXTO> SEM contexto válido → reparar
  // ==========================================================
  if (!temContexto) {
    menu
      .addItem('🔧 Reparar Contexto', 'repararContextoAdmin');

    // Versão (informativa)
    adicionarVersaoAoMenu_(menu);

    menu.addToUi();
    return;
  }

  // ==========================================================
  // 3️⃣ ADMIN:<CONTEXTO> COM contexto válido → menu completo
  // ==========================================================
  menu
    .addItem('🔁 Selecionar Contexto', 'selecionarContextoTrabalho')
    .addSubMenu(
      ui.createMenu('🔐 Gerenciar Acessos')
        .addItem('👤 Acesso ADMIN', 'gerenciarAcessosAdmin')
        .addItem('👥 Acesso CLIENTE', 'gerenciarAcessosCliente')
    )
    .addSeparator();

  // ==========================================================
  // PASTAS DE TRABALHO
  // ==========================================================
  menu
    .addSubMenu(
      ui.createMenu('🗂️ Pastas de Trabalho')
        .addItem('📂 Abrir pasta de trabalho', 'abrirPastasTrabalho')
        .addItem('🔁 Escolher pasta', 'escolherPastaTrabalho')
        .addItem('➕ Criar pasta', 'criarPastaTrabalho')
    )
    .addSeparator();

  // ==========================================================
  // PROCESSAMENTO DE IMAGEM (VISION)
  // ==========================================================
  menu
    .addItem('🖼️ Processar Imagem', 'processarImagem')
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
  // CLIENTE / DIAGNÓSTICO
  // ==========================================================
  menu
    .addItem('🎨 Formatar Planilha Cliente', 'formatarPlanilhaCliente')
    .addSeparator()
    .addSubMenu(
      ui.createMenu('🧪 Diagnóstico')
        .addItem('📊 Executar Diagnóstico', 'executarDiagnostico')
        .addSeparator()
        .addItem('🧪 Testar Planilha Geral', 'runTestsPlanilhaGeral')
    );

  menu.addItem('ℹ️ Versão', 'mostrarVersaoSistema');

  menu.addToUi();
}
