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
    inventario.clientAtualizarInformacoes();
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

function clientAtualizarInformacoes() {
  inventario.clientAtualizarInformacoes();
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
function clientAbrirPlanilhaAdmin() {
  inventario.clientAbrirPlanilhaAdmin();
}

/* ============================================================
 * PROXIES — ARIR PLANILHA GERAL
 * ============================================================ */
function clientAbrirPlanilhaGeral() {
  inventario.abrirPlanilhaGeral();
}

/* ============================================================
 * PROXIES — DIAGNÓSTICO
 * ============================================================ */
function clientExecutarDiagnostico() {
  inventario.clientExecutarDiagnostico();
}

/* ============================================================
 * PROXIES — MOSTRAR VERSÃO
 * ============================================================ */
function mostrarVersaoSistema() {
  inventario.mostrarVersaoSistema();
}

