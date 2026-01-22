/**
 * ============================================================
 * API PÚBLICA — ADMIN (INVENTÁRIO)
 * ============================================================
 */

/** MENU */
function adminRenderMenu() {
  adminRenderMenu_();
}

/** CONTEXTO */
function criarContextoTrabalho() {
  criarContextoTrabalho_();
}

function selecionarContextoTrabalho() {
  selecionarContextoTrabalho_();
}

/** ACESSOS */
function gerenciarAcessosContexto() {
  gerenciarAcessosContexto_();
}

/** ===========================
 * PLANILHA GERAL
 * =========================== */

function abrirPlanilhaGeral() {
  abrirPlanilhaGeral_();
}

/**
 * ============================================================
 * CSV — IMPORTAR (GERAL)
 * ============================================================
 */

function importarCSVGeral_() {
  abrirDialogImportacaoCSV_('GERAL');
}

/**
 * ============================================================
 * CSV — IMPORTAR (CONTEXTO)
 * ============================================================
 */

function importarCSVContexto_() {
  abrirDialogImportacaoCSV_('CONTEXTO');
}


function criarOuRecriarPlanilhaGeral() {
  criarOuRecriarPlanilhaGeral_();
}

/** ===========================
 * PLANILHA CONTEXTO
 * =========================== */

function formatarPlanilhaContexto() {
  formatarPlanilhaContexto_();
}

function importarCSVContexto() {
  importarCSVContexto_();
}

function popularPlanilhaContexto() {
  popularPlanilhaContexto_();
}

/** CLIENTE */
function formatarPlanilhaCliente() {
  formatarPlanilhaCliente_();
}

/** PASTAS */
function abrirPastasTrabalho() {
  abrirPastasTrabalho_();
}

/** DIAGNÓSTICO */
function executarDiagnostico() {
  executarDiagnostico_();
}
