/**
 * ============================================================
 * TEMPLATE ADMIN — INVENTÁRIO PATRIMONIAL
 * ============================================================
 * Responsabilidades:
 * - Inicializar menu ADMIN
 * - Repassar comandos para a biblioteca
 *
 * ❌ Não contém lógica de negócio
 * ❌ Não contém regras
 * ============================================================
 */

/**
 * Disparado ao abrir a planilha ADMIN
 */
function onOpen() {
  try {
    inventario.adminRenderMenu(); // função pública da biblioteca
  } catch (e) {
    Logger.log('[ADMIN][ONOPEN][ERRO]');
    Logger.log(e);
    SpreadsheetApp.getUi().alert(
      'Erro ao inicializar o menu de Administração.\n\n' + e.message
    );
  }
}

/* ============================================================
 * PROXIES DE MENU — ADMIN
 * (obrigatórios para o Google Sheets)
 * ============================================================
 */

function criarContextoTrabalho() {
  inventario.criarContextoTrabalho(); // biblioteca
}

function selecionarContextoTrabalho() {
  inventario.selecionarContextoTrabalho();
}

function gerenciarAcessosContexto() {
  inventario.gerenciarAcessosContexto();
}

function configurarPlanilhaBase() {
  inventario.configurarPlanilhaBase();
}

function formatarPlanilhaCliente() {
  inventario.formatarPlanilhaCliente();
}

function enviarCSV() {
  inventario.enviarCSV();
}

function popularPlanilhaOperacional() {
  inventario.popularPlanilhaOperacional();
}

function formatarPlanilhaOperacional() {
  inventario.formatarPlanilhaOperacional();
}

function abrirPastasTrabalho() {
  inventario.abrirPastasTrabalho();
}

function executarDiagnostico() {
  inventario.executarDiagnostico();
}
