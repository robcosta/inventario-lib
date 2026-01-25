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
 * ❌ Não contém acesso a Drive/Sheets
 * ============================================================
 */

/**
 * ============================================================
 * onOpen — ENTRADA DO ADMIN
 * ============================================================
 */
function onOpen() {
  try {
    inventario.adminRenderMenu(); // API pública da biblioteca
  } catch (e) {
    Logger.log('[ADMIN][ONOPEN][ERRO]');
    Logger.log(e);
    SpreadsheetApp.getUi().alert(
      'Erro ao inicializar o menu de Administração.\n\n' + e.message
    );
  }
}

/* ============================================================
 * PROXIES DE MENU — CONTEXTO
 * ============================================================
 */

function criarContextoTrabalho() {
  inventario.criarContextoTrabalho();
}

function selecionarContextoTrabalho() {
  inventario.selecionarContextoTrabalho();
}

/* ============================================================
 * PROXIES DE MENU — ACESSOS
 * ============================================================
 */

function gerenciarAcessosContexto() {
  inventario.gerenciarAcessosContexto();
}

/* ============================================================
 * PROXY — PROCESSAR IMAGENS (VISION)
 * ============================================================
 */

function processarImagem() {
  inventario.processarImagem();
}

/* ============================================================
 * PROXIES DE MENU — PLANILHA GERAL
 * ============================================================
 */

function abrirPlanilhaGeral() {
  inventario.abrirPlanilhaGeral();
}

function importarCSVGeral() {
  inventario.importarCSVGeral();
}

function formatarPlanilhaGeral() {
  inventario.formatarPlanilhaGeral();
}

function criarOuRecriarPlanilhaGeral() {
  inventario.criarOuRecriarPlanilhaGeral();
}

/* ============================================================
 * PROXIES DE MENU — PLANILHA CONTEXTO
 * ============================================================
 */

function formatarPlanilhaContexto() {
  inventario.formatarPlanilhaContexto();
}

function importarCSVContexto() {
  inventario.importarCSVContexto();
}

function popularPlanilhaContexto() {
  inventario.popularPlanilhaContexto();
}

/* ============================================================
 * PROXIES DE MENU — CLIENTE / SUPORTE
 * ============================================================
 */

function formatarPlanilhaCliente() {
  inventario.formatarPlanilhaCliente();
}

function abrirPastasTrabalho() {
  inventario.abrirPastasTrabalho();
}

function executarDiagnostico() {
  inventario.executarDiagnostico();
}


/**
 * ============================================================
 * CSV — ENTRYPOINT (TEMPLATE)
 * Chamado pelo HTML
 * ============================================================
 */
function receberCSV(tipo, nomeArquivo, dataUrl) {
  // Repassa a chamada vinda do HTML para a função pública da biblioteca
  return inventario.receberCSV(tipo, nomeArquivo, dataUrl);
}
