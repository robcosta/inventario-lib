/**
 * ============================================================
 * TEMPLATE CLIENT — INVENTÁRIO PATRIMONIAL (ID-BASED)
 * ============================================================
 * Responsabilidades:
 * - Inicializar menu CLIENT
 * - Atualizar informações automaticamente
 * - Apenas proxies → ZERO lógica de negócio
 * ============================================================
 */

/**
 * Disparado ao abrir a planilha CLIENTE
 */
function onOpen(e) {
  try {
    inventario.clientRenderMenu();
    SpreadsheetApp.getActiveSpreadsheet()
      .toast("🔄 Atualize as informações para sincronizar o contexto.", "📦 Inventário Patrimonial", 7);
  } catch (err) {
    Logger.log('[CLIENT][ONOPEN][ERRO]');
    Logger.log(err);
  }
}

/* ============================================================
 * PROXIES — CLIENT
 * ============================================================ */

function clientRenderMenu() {
  inventario.clientRenderMenu();
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
  inventario.processarImagens(); // teste/manual
}

/* ============================================================
 * PROXIES — ARIR PLANILHA ADMIN
 * ============================================================ */
function adminAbrirPlanilha() {
  inventario.adminAbrirPlanilha();
}

/* ============================================================
 * PROXIES — ARIR PLANILHA GERAL
 * ============================================================ */
function clientAbrirPlanilhaGeral() {
  inventario.abrirPlanilhaGeral();
}

/* ============================================================
 * PROXIES — CLIENTE FORMATAÇÃO
 * ============================================================ */
function formatarPlanilhaCliente() {
  inventario.formatarPlanilhaCliente();
}

/* ============================================================
 * PROXIES — DIAGNÓSTICO
 * ============================================================ */
function clientExecutarDiagnostico() {
  inventario.clientExecutarDiagnostico();
}

/* ============================================================
 * PROXIES — ATUALIZAR INFORMAÇÕES
 * ============================================================ */
function clientAtualizarInformacoes() {
  inventario.clientAtualizarInformacoes();
}

/* ============================================================
 * PROXIES — MOSTRAR VERSÃO
 * ============================================================ */
function mostrarVersaoSistema() {
  inventario.mostrarVersaoSistema();
}


