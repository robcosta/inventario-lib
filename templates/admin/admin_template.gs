/**
 * ============================================================
 * TEMPLATE ADMIN — INVENTÁRIO PATRIMONIAL
 * ============================================================
 *
 * Responsabilidades:
 * - Inicializar menu ADMIN
 * - Encaminhar comandos para a biblioteca inventario
 *
 * ❌ Não contém lógica de negócio
 * ❌ Não contém regras
 * ❌ Não acessa Drive / Sheets diretamente
 * ============================================================
 */


/* ============================================================
 * onOpen — ENTRADA DO ADMIN
 * ============================================================ */
function onOpen() {
  try {
    inventario.adminRenderMenu();
  } catch (e) {
    Logger.log('[ADMIN][ONOPEN][ERRO]');
    Logger.log(e);
    SpreadsheetApp.getUi().alert(
      'Erro ao inicializar o menu de Administração.\n\n' + e.message
    );
  }
}


/* ============================================================
 * PROXIES — CONTEXTO
 * ============================================================ */
function criarContextoTrabalho() {
  inventario.criarContextoTrabalho();
}

function repararContextoAdmin() {
  inventario.repararContextoAdmin();
}

function selecionarContextoTrabalho() {
  inventario.selecionarContextoTrabalho();
}


/* ============================================================
 * PROXIES — ACESSOS
 * ============================================================ */
function gerenciarAcessosContexto() {
  inventario.gerenciarAcessosContexto();
}


/* ============================================================
 * PROXIES — ÁREA DE FOTOS
 * ============================================================ */
function criarNovaPastaFotos() {
  inventario.criarNovaPastaFotos();
}

function trocarPastaFotos() {
  inventario.trocarPastaFotos();
}

function abrirPastaFotosAtual() {
  inventario.abrirPastaFotosAtual();
}


/* ============================================================
 * PROXIES — PROCESSAMENTO DE IMAGENS (VISION)
 * ============================================================ */
function processarImagens() {
  inventario.processarImagens();
}


/* ============================================================
 * PROXIES — PLANILHA ADMIN
 * ============================================================ */
function importarCSVAdmin() {
  inventario.importarCSVAdmin();
}

function popularPlanilhaAdmin() {
  inventario.popularPlanilhaAdmin();
}

function formatarPlanilhaAdmin() {
  inventario.formatarPlanilhaAdmin();
}


/* ============================================================
 * PROXIES — PLANILHA CLIENTE
 * ============================================================ */
function abrirPlanilhaCliente() {
  inventario.abrirPlanilhaCliente();
}

function formatarPlanilhaCliente() {
  inventario.formatarPlanilhaCliente();
}


/* ============================================================
 * PROXIES — PLANILHA GERAL
 * ============================================================ */
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
 * PROXIES — DIAGNÓSTICO / SUPORTE
 * ============================================================ */
function executarDiagnostico() {
  inventario.executarDiagnostico();
}

function runTestsPlanilhaGeral() {
  inventario.runTestsPlanilhaGeral();
}

function mostrarVersaoSistema() {
  inventario.mostrarVersaoSistema();
}


/* ============================================================
 * CSV — ENTRYPOINT (HTML)
 * ============================================================ */
function receberCSV(tipo, nomeArquivo, dataUrl) {
  return inventario.receberCSV(tipo, nomeArquivo, dataUrl);
}